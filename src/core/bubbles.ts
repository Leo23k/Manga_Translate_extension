import type { BBox } from './types';

/**
 * Speech-bubble detection on raw RGBA pixels. A bubble is a large near-white connected region
 * whose interior (the region plus the holes the lettering punches in it) has some ink in it.
 * Running OCR only inside these regions keeps Tesseract away from the artwork, where a global
 * threshold turns shadows into "ink" and makes recognition both slow and wrong.
 */
export interface Bubble {
  bbox: BBox;
  /** 1 where a pixel belongs to the bubble interior, row-major over bbox */
  inside: Uint8Array;
}

const BRIGHT = 232;
const CHROMA = 32;
const MIN_AREA = 1500;
const INK = 140;

export const luma = (r: number, g: number, b: number) => (r * 299 + g * 587 + b * 114) / 1000;

export function findBubbles(rgba: Uint8ClampedArray, W: number, H: number): Bubble[] {
  const n = W * H;
  const bright = new Uint8Array(n);
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    const r = rgba[p], g = rgba[p + 1], b = rgba[p + 2];
    if (luma(r, g, b) >= BRIGHT && Math.max(r, g, b) - Math.min(r, g, b) <= CHROMA) bright[i] = 1;
  }

  const queue = new Int32Array(n);
  const bubbles: Bubble[] = [];

  for (let start = 0; start < n; start++) {
    if (bright[start] !== 1) continue;

    // flood-fill one bright component; its pixels end up in queue[0..end)
    let head = 0, end = 0;
    queue[end++] = start;
    bright[start] = 2;
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    while (head < end) {
      const idx = queue[head++];
      const x = idx % W, y = (idx / W) | 0;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      if (x > 0 && bright[idx - 1] === 1) { bright[idx - 1] = 2; queue[end++] = idx - 1; }
      if (x < W - 1 && bright[idx + 1] === 1) { bright[idx + 1] = 2; queue[end++] = idx + 1; }
      if (y > 0 && bright[idx - W] === 1) { bright[idx - W] = 2; queue[end++] = idx - W; }
      if (y < H - 1 && bright[idx + W] === 1) { bright[idx + W] = 2; queue[end++] = idx + W; }
    }

    const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
    if (end < MIN_AREA || bw < 30 || bh < 20 || bh > 1400) continue;

    const bubble = analyse(rgba, W, queue, end, x0, y0, bw, bh);
    if (bubble) bubbles.push(bubble);
  }
  return bubbles;
}

function analyse(
  rgba: Uint8ClampedArray, W: number, comp: Int32Array, count: number,
  x0: number, y0: number, bw: number, bh: number,
): Bubble | null {
  const size = bw * bh;
  const member = new Uint8Array(size);
  for (let k = 0; k < count; k++) {
    const idx = comp[k];
    member[(((idx / W) | 0) - y0) * bw + ((idx % W) - x0)] = 1;
  }

  // everything reachable from the bbox border without crossing the component is outside
  const outside = new Uint8Array(size);
  const stack = new Int32Array(size);
  let sp = 0;
  const seed = (i: number) => {
    if (!member[i] && !outside[i]) { outside[i] = 1; stack[sp++] = i; }
  };
  for (let x = 0; x < bw; x++) { seed(x); seed((bh - 1) * bw + x); }
  for (let y = 0; y < bh; y++) { seed(y * bw); seed(y * bw + bw - 1); }
  while (sp > 0) {
    const i = stack[--sp];
    const x = i % bw;
    if (x > 0) seed(i - 1);
    if (x < bw - 1) seed(i + 1);
    if (i >= bw) seed(i - bw);
    if (i < size - bw) seed(i + bw);
  }

  const inside = new Uint8Array(size);
  let insideCount = 0, holes = 0, ink = 0;
  for (let i = 0; i < size; i++) {
    if (outside[i]) continue;
    inside[i] = 1;
    insideCount++;
    if (member[i]) continue;
    holes++;
    const p = (((i / bw) | 0) + y0) * W * 4 + ((i % bw) + x0) * 4;
    if (luma(rgba[p], rgba[p + 1], rgba[p + 2]) < INK) ink++;
  }

  const fill = insideCount / size;
  const inkRatio = ink / insideCount;
  if (fill < 0.35 || holes < 60 || inkRatio < 0.015 || inkRatio > 0.45) return null;
  return { bbox: { x: x0, y: y0, w: bw, h: bh }, inside };
}

export interface Crop {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  /** position of the crop's top-left corner in the source image */
  x: number;
  y: number;
}

/** Extent of the black ink in a crop produced by cropBubble, or null if the crop is blank. */
export function inkBox(c: Crop): { w: number; h: number } | null {
  let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (c.data[(y * c.width + x) * 4] !== 0) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return x1 < 0 ? null : { w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/** Black ink on white, only inside the bubble, with padding: what Tesseract reads best. */
export function cropBubble(rgba: Uint8ClampedArray, W: number, b: Bubble, pad = 10): Crop {
  const width = b.bbox.w + pad * 2;
  const height = b.bbox.h + pad * 2;
  const data = new Uint8ClampedArray(width * height * 4).fill(255);
  for (let y = 0; y < b.bbox.h; y++) {
    for (let x = 0; x < b.bbox.w; x++) {
      if (!b.inside[y * b.bbox.w + x]) continue;
      const p = ((b.bbox.y + y) * W + b.bbox.x + x) * 4;
      const v = luma(rgba[p], rgba[p + 1], rgba[p + 2]) < 128 ? 0 : 255;
      const q = ((y + pad) * width + x + pad) * 4;
      data[q] = data[q + 1] = data[q + 2] = v;
    }
  }
  return { data, width, height, x: b.bbox.x - pad, y: b.bbox.y - pad };
}
