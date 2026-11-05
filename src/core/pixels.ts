import type { BBox } from './types';
import { luma } from './bubbles';

/** Otsu's method: threshold that best splits dark ink from light paper. */
export function otsuThreshold(rgba: Uint8ClampedArray): number {
  const hist = new Uint32Array(256);
  const total = rgba.length / 4;
  for (let p = 0; p < rgba.length; p += 4) hist[Math.round(luma(rgba[p], rgba[p + 1], rgba[p + 2]))]++;
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];
  let wB = 0, sumB = 0, best = 0, bestVar = -1;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB, mF = (sum - sumB) / wF;
    const v = wB * wF * (mB - mF) ** 2;
    if (v > bestVar) { bestVar = v; best = t; }
  }
  return best;
}

/** Hard black/white split at the Otsu threshold, in place. Adapts to the crop, unlike a fixed cut-off. */
export function binarizeOtsu(rgba: Uint8ClampedArray): void {
  const t = otsuThreshold(rgba);
  for (let p = 0; p < rgba.length; p += 4) {
    const v = luma(rgba[p], rgba[p + 1], rgba[p + 2]) <= t ? 0 : 255;
    rgba[p] = rgba[p + 1] = rgba[p + 2] = v;
    rgba[p + 3] = 255;
  }
}

/** Median colour of a thin ring just outside the box: a good guess for the bubble fill. */
export function sampleBackground(rgba: Uint8ClampedArray, W: number, H: number, b: BBox): string {
  const m = 3;
  const x0 = Math.max(0, Math.floor(b.x - m));
  const y0 = Math.max(0, Math.floor(b.y - m));
  const x1 = Math.min(W - 1, Math.ceil(b.x + b.w + m));
  const y1 = Math.min(H - 1, Math.ceil(b.y + b.h + m));
  const px: number[][] = [];
  const take = (x: number, y: number) => {
    const p = (y * W + x) * 4;
    px.push([rgba[p], rgba[p + 1], rgba[p + 2]]);
  };
  for (let x = x0; x <= x1; x += 2) { take(x, y0); take(x, y1); }
  for (let y = y0; y <= y1; y += 2) { take(x0, y); take(x1, y); }
  const med = (i: number) => px.map((p) => p[i]).sort((a, c) => a - c)[px.length >> 1] ?? 255;
  return `rgb(${med(0)},${med(1)},${med(2)})`;
}

export function textColorFor(bg: string): string {
  const [r, g, b] = bg.match(/\d+/g)!.map(Number);
  return luma(r, g, b) > 140 ? '#111' : '#fff';
}
