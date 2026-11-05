import { renderRegions, type RenderHandle } from '../core/render/overlay';
import type { BBox, DisplayMode } from '../core/types';

const MIN_SIZE = 300;
const handles = new Map<HTMLImageElement, RenderHandle[]>();
const busy = new Set<HTMLImageElement>();
let mode: DisplayMode = 'overlay';

chrome.storage.sync.get('mode').then((v) => { if (v.mode) mode = v.mode as DisplayMode; }).catch(() => {});

function addHandle(img: HTMLImageElement, h: RenderHandle) {
  handles.set(img, [...(handles.get(img) ?? []), h]);
}

async function request(img: HTMLImageElement, region?: BBox) {
  const url = img.currentSrc || img.src;
  const reply = await chrome.runtime.sendMessage({ type: 'translate-image', url, pageUrl: location.href, region });
  if (!reply?.ok) throw new Error(reply?.error);
  return reply.data as { width: number; regions: Parameters<typeof renderRegions>[1] };
}

async function translateImg(img: HTMLImageElement) {
  if (!(img.currentSrc || img.src) || handles.has(img) || busy.has(img)) return;
  busy.add(img);
  img.style.outline = '2px dashed #f90';
  try {
    const { width, regions } = await request(img);
    if (regions.length) addHandle(img, renderRegions(img, regions, width, mode));
  } catch (e) {
    console.warn('[leo] translate failed', img.currentSrc || img.src, e);
  } finally {
    busy.delete(img);
    img.style.outline = '';
  }
}

/** Translate only `area` (viewport px) of one image, mapped back to the image's natural pixels. */
async function translateArea(img: HTMLImageElement, area: DOMRect) {
  const r = img.getBoundingClientRect();
  const left = Math.max(r.left, area.left), right = Math.min(r.right, area.right);
  const top = Math.max(r.top, area.top), bottom = Math.min(r.bottom, area.bottom);
  if (right - left < 8 || bottom - top < 8) return;
  const sx = img.naturalWidth / r.width, sy = img.naturalHeight / r.height;
  const region = { x: (left - r.left) * sx, y: (top - r.top) * sy, w: (right - left) * sx, h: (bottom - top) * sy };

  const box = document.createElement('div');
  box.style.cssText =
    `position:fixed;left:${left}px;top:${top}px;width:${right - left}px;height:${bottom - top}px;` +
    'outline:2px dashed #f90;z-index:2147483646;pointer-events:none;';
  document.body.appendChild(box);
  try {
    const { width, regions } = await request(img, region);
    if (regions.length) addHandle(img, renderRegions(img, regions, width, mode));
    else console.info('[leo] no text found in the selected area');
  } catch (e) {
    console.warn('[leo] area translate failed', e);
  } finally {
    box.remove();
  }
}

/** Drag a rectangle over the page; every image under it is scanned for that part only. */
function selectRegion() {
  void chrome.runtime.sendMessage({ type: 'warm' }); // start loading OCR while the user drags
  const shield = document.createElement('div');
  shield.style.cssText =
    'position:fixed;inset:0;z-index:2147483647;cursor:crosshair;background:rgba(0,0,0,.12);';
  const rect = document.createElement('div');
  rect.style.cssText = 'position:fixed;border:2px dashed #f90;background:rgba(255,153,0,.15);display:none;';
  shield.appendChild(rect);
  document.body.appendChild(shield);

  let sx = 0, sy = 0, drawing = false;
  const area = (e: MouseEvent) =>
    new DOMRect(Math.min(sx, e.clientX), Math.min(sy, e.clientY), Math.abs(e.clientX - sx), Math.abs(e.clientY - sy));
  const done = () => {
    shield.remove();
    window.removeEventListener('keydown', onKey, true);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') done();
  };
  window.addEventListener('keydown', onKey, true);

  shield.addEventListener('mousedown', (e) => {
    e.preventDefault();
    drawing = true;
    sx = e.clientX;
    sy = e.clientY;
    rect.style.display = 'block';
  });
  shield.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const a = area(e);
    rect.style.cssText += `;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;`;
  });
  shield.addEventListener('mouseup', (e) => {
    const a = area(e);
    done();
    if (a.width < 12 || a.height < 12) return;
    for (const img of document.images) void translateArea(img, a);
  });
}

const isComicSized = (img: HTMLImageElement) =>
  img.naturalWidth >= MIN_SIZE && img.naturalHeight >= MIN_SIZE;

function translateAll() {
  void chrome.runtime.sendMessage({ type: 'warm' }); // load the OCR model before the first image
  // lazy-loaded readers swap the src after scroll, so size is checked when the image is near
  // the viewport (and again once it finishes loading), not when the button is pressed
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const img = e.target as HTMLImageElement;
        if (img.complete && isComicSized(img)) {
          io.unobserve(img);
          void translateImg(img);
        } else if (!img.complete) {
          img.addEventListener('load', () => isComicSized(img) && void translateImg(img), { once: true });
        }
      }
    },
    // start well before an image scrolls in: a tall strip takes seconds to read
    { rootMargin: '3000px 0px' },
  );
  for (const img of document.images) io.observe(img);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'translate-all') translateAll();
  else if (msg.type === 'select-region') selectRegion();
  else if (msg.type === 'translate-url') {
    const img = [...document.images].find((i) => (i.currentSrc || i.src) === msg.url);
    if (img) void translateImg(img);
  } else if (msg.type === 'set-mode') {
    mode = msg.mode;
    handles.forEach((hs) => hs.forEach((h) => h.setMode(mode)));
  } else if (msg.type === 'clear') {
    handles.forEach((hs) => hs.forEach((h) => h.destroy()));
    handles.clear();
  }
});
