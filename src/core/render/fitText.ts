/** Largest font size (px) at which `text` fits inside w x h, found by binary search on real layout. */
export function fitFontSize(
  doc: Document, text: string, w: number, h: number, fontFamily: string, max = 40, min = 7,
): number {
  const probe = doc.createElement('div');
  probe.style.cssText =
    `position:absolute;visibility:hidden;left:-9999px;top:0;width:${w}px;` +
    `font-family:${fontFamily};line-height:1.15;text-align:center;overflow-wrap:break-word;`;
  probe.textContent = text;
  doc.body.appendChild(probe);
  let lo = min;
  let hi = max;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    probe.style.fontSize = `${mid}px`;
    if (probe.scrollHeight <= h) lo = mid;
    else hi = mid - 1;
  }
  probe.remove();
  return lo;
}
