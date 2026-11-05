import { createWorker, type Worker } from 'tesseract.js';
import { cropBubble, findBubbles, inkBox } from '../core/bubbles';
import { bubbleRegion, groupWords } from '../core/grouping';
import { OCR_MODEL, VERTICAL_MODEL, isVerticalInk } from '../core/lang';
import { binarizeOtsu, sampleBackground, textColorFor } from '../core/pixels';
import type { BBox, OcrResult, OcrWord, SourceLang, TextRegion } from '../core/types';

/**
 * A page has 5-10 bubbles and one worker reads them one after another (~1s each), so each model
 * gets a small pool that reads them in parallel. Every worker holds its own copy of the model,
 * which for CJK is tens of MB, so those pools are smaller and only start when that language is used.
 */
class Pool {
  private workers: Promise<Worker>[] = [];
  private idle: Worker[] = [];
  private waiters: Array<{ resolve: (w: Worker) => void; reject: (e: unknown) => void }> = [];
  private failure: unknown = null;

  constructor(private model: string, private size: number) {}

  start() {
    while (this.workers.length < this.size) {
      const p = createWorker(this.model, 1, {
        workerPath: chrome.runtime.getURL('tesseract/worker.min.js'),
        corePath: chrome.runtime.getURL('tesseract/core'),
        langPath: chrome.runtime.getURL('tesseract/lang'),
        workerBlobURL: false,
        gzip: true,
      });
      this.workers.push(p);
      p.then(
        (w) => this.release(w),
        (e) => {
          // a worker that cannot start would otherwise leave every request waiting forever
          this.failure = e;
          this.waiters.splice(0).forEach((w) => w.reject(e));
        },
      );
    }
  }

  release(w: Worker) {
    const next = this.waiters.shift();
    if (next) next.resolve(w);
    else this.idle.push(w);
  }

  acquire(): Promise<Worker> {
    if (this.failure) return Promise.reject(this.failure);
    this.start();
    const w = this.idle.pop();
    return w ? Promise.resolve(w) : new Promise((resolve, reject) => this.waiters.push({ resolve, reject }));
  }
}

const cores = navigator.hardwareConcurrency ?? 4;
const pools = new Map<string, Pool>();

function poolFor(model: string): Pool {
  let p = pools.get(model);
  if (!p) {
    const size = model === 'eng' ? Math.max(2, Math.min(4, cores - 1)) : model === VERTICAL_MODEL ? 1 : 2;
    p = new Pool(model, size);
    pools.set(model, p);
  }
  return p;
}

/** psm 6: one block (a bubble crop). psm 5: one vertical block. psm 11: sparse text (a picked area). */
async function recognize(
  canvas: HTMLCanvasElement, model: string, psm: '5' | '6' | '11', dx: number, dy: number, scale: number,
) {
  const pool = poolFor(model);
  const worker = await pool.acquire();
  let data;
  try {
    await worker.setParameters({ tessedit_pageseg_mode: psm as never });
    ({ data } = await worker.recognize(canvas, {}, { blocks: true }));
  } finally {
    pool.release(worker);
  }
  const words: OcrWord[] = [];
  for (const b of data.blocks ?? [])
    for (const p of b.paragraphs)
      for (const l of p.lines)
        for (const wd of l.words)
          words.push({
            text: wd.text,
            conf: wd.confidence,
            bbox: {
              x: dx + wd.bbox.x0 / scale,
              y: dy + wd.bbox.y0 / scale,
              w: (wd.bbox.x1 - wd.bbox.x0) / scale,
              h: (wd.bbox.y1 - wd.bbox.y0) / scale,
            },
          });
  return { words, text: data.text };
}

// Re-scanning the same page is common (several areas of one strip), and an extension page
// does not share the browser's HTTP cache with the tab, so keep the last few image blobs.
const blobs = new Map<string, Promise<Blob>>();
const MAX_BLOBS = 4;

function loadBlob(url: string): Promise<Blob> {
  let p = blobs.get(url);
  if (!p) {
    p = fetch(url).then((res) => {
      if (!res.ok) throw new Error(`image fetch ${res.status}`);
      return res.blob();
    });
    p.catch(() => blobs.delete(url));
    blobs.set(url, p);
    if (blobs.size > MAX_BLOBS) blobs.delete(blobs.keys().next().value!);
  }
  return p;
}

async function loadBitmap(url: string): Promise<ImageBitmap> {
  return createImageBitmap(await loadBlob(url));
}

function canvasFrom(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext('2d', { willReadFrequently: true })! };
}

/**
 * The part of a bubble that is safe to paint over: the rectangle inscribed in its ellipse
 * (a 0.146 inset per side), pulled in a little more because the overlay adds its own padding.
 */
function inscribed(b: BBox): BBox {
  const dx = b.w * 0.19, dy = b.h * 0.19;
  return { x: b.x + dx, y: b.y + dy, w: b.w - 2 * dx, h: b.h - 2 * dy };
}

function union(a: BBox, b: BBox): BBox {
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
}

/** Whole page of a comic: find the white bubbles first, then read only inside them. */
async function ocrImage(url: string, lang: SourceLang): Promise<OcrResult> {
  const bmp = await loadBitmap(url);
  const { width, height } = bmp;
  const full = canvasFrom(width, height);
  full.ctx.drawImage(bmp, 0, 0);
  bmp.close();
  const rgba = full.ctx.getImageData(0, 0, width, height).data;

  const found = await Promise.all(
    findBubbles(rgba, width, height).map(async (bubble) => {
      const crop = cropBubble(rgba, width, bubble);
      const { canvas, ctx } = canvasFrom(crop.width, crop.height);
      ctx.putImageData(new ImageData(crop.data as Uint8ClampedArray<ArrayBuffer>, crop.width, crop.height), 0, 0);

      const vertical = isVerticalInk(lang, inkBox(crop));
      const { words, text } = vertical
        ? await recognize(canvas, VERTICAL_MODEL, '5', crop.x, crop.y, 1)
        : await recognize(canvas, OCR_MODEL[lang], '6', crop.x, crop.y, 1);
      const region = bubbleRegion(words, lang, text);
      if (region) {
        region.bg = '#fff';
        region.fg = '#111';
        // translated text is usually longer than the source, and CJK columns are narrow:
        // give the overlay the whole inscribed area of the bubble, not just the old text box
        region.bbox = union(region.bbox, inscribed(bubble.bbox));
      }
      return region;
    }),
  );
  const regions = found.filter((r): r is TextRegion => r !== null).sort((a, b) => a.bbox.y - b.bbox.y);
  return { width, height, regions };
}

/**
 * Area picked by the user: no bubble detection, so dark bubbles and lettering on artwork work too.
 * The crop is binarised with its own Otsu threshold and read as sparse text. A tall selection of
 * Japanese is read as one vertical block.
 */
async function ocrRegion(url: string, area: BBox, lang: SourceLang): Promise<OcrResult> {
  const bmp = await loadBitmap(url);
  const x = Math.max(0, Math.floor(area.x));
  const y = Math.max(0, Math.floor(area.y));
  const w = Math.min(bmp.width - x, Math.ceil(area.w));
  const h = Math.min(bmp.height - y, Math.ceil(area.h));
  if (w < 10 || h < 10) return { width: bmp.width, height: bmp.height, regions: [] };

  const raw = canvasFrom(w, h);
  raw.ctx.drawImage(bmp, x, y, w, h, 0, 0, w, h);
  const rawPx = raw.ctx.getImageData(0, 0, w, h).data;

  const scale = h < 500 ? 2 : 1;
  const big = canvasFrom(w * scale, h * scale);
  big.ctx.drawImage(bmp, x, y, w, h, 0, 0, w * scale, h * scale);
  const px = big.ctx.getImageData(0, 0, big.canvas.width, big.canvas.height);
  binarizeOtsu(px.data);
  big.ctx.putImageData(px, 0, 0);

  let regions: TextRegion[];
  if (isVerticalInk(lang, { w, h })) {
    const { words, text } = await recognize(big.canvas, VERTICAL_MODEL, '5', x, y, scale);
    const r = bubbleRegion(words, lang, text);
    regions = r ? [r] : [];
  } else {
    const { words } = await recognize(big.canvas, OCR_MODEL[lang], '11', x, y, scale);
    regions = groupWords(words, lang);
  }
  for (const r of regions) {
    const bg = sampleBackground(rawPx, w, h, { ...r.bbox, x: r.bbox.x - x, y: r.bbox.y - y });
    r.bg = bg;
    r.fg = textColorFor(bg);
  }
  const result = { width: bmp.width, height: bmp.height, regions };
  bmp.close();
  return result;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.target !== 'offscreen') return;
  const lang: SourceLang = msg.lang ?? 'en';
  if (msg.type === 'warm') {
    // load the model now, while the user is still dragging or scrolling
    poolFor(OCR_MODEL[lang]).start();
    return;
  }
  if (msg.type !== 'ocr') return;
  (msg.region ? ocrRegion(msg.url, msg.region, lang) : ocrImage(msg.url, lang)).then(
    (result) => sendResponse({ ok: true, result }),
    (e) => sendResponse({ ok: false, error: String(e?.message ?? e) }),
  );
  return true;
});
