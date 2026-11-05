import type { DisplayMode, TranslatedRegion } from '../types';
import { fitFontSize } from './fitText';

const FONT = '"Patrick Hand","Comic Neue","Be Vietnam Pro","Segoe UI",sans-serif';

export interface RenderHandle {
  update(): void;
  setMode(mode: DisplayMode): void;
  destroy(): void;
}

/**
 * Draws translated regions over an <img>. Regions are in the image's natural pixel space.
 * The layer is positioned in document coordinates and re-synced on resize/layout changes.
 */
export function renderRegions(
  img: HTMLImageElement, regions: TranslatedRegion[], naturalW: number, mode: DisplayMode,
): RenderHandle {
  const doc = img.ownerDocument;
  const win = doc.defaultView!;
  const layer = doc.createElement('div');
  layer.className = 'leo-layer';
  layer.style.cssText = 'position:absolute;z-index:2147483000;pointer-events:none;';
  doc.body.appendChild(layer);

  const items: Array<{ el: HTMLDivElement; r: TranslatedRegion }> = [];
  for (const r of regions) {
    const el = doc.createElement('div');
    el.className = 'leo-bubble';
    layer.appendChild(el);
    items.push({ el, r });
  }

  let currentMode = mode;

  const layout = () => {
    const rect = img.getBoundingClientRect();
    layer.style.left = `${rect.left + win.scrollX}px`;
    layer.style.top = `${rect.top + win.scrollY}px`;
    layer.style.width = `${rect.width}px`;
    layer.style.height = `${rect.height}px`;
    const s = rect.width / naturalW;
    for (const { el, r } of items) {
      const pad = r.lineHeight * 0.25;
      const x = (r.bbox.x - pad) * s;
      const y = (r.bbox.y - pad) * s;
      const w = (r.bbox.w + pad * 2) * s;
      const h = (r.bbox.h + pad * 2) * s;
      const box = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;box-sizing:border-box;`;
      if (currentMode === 'overlay') {
        const size = fitFontSize(doc, r.translated, w, h, FONT);
        el.textContent = r.translated;
        el.removeAttribute('title');
        el.style.cssText =
          box +
          'display:flex;align-items:center;justify-content:center;text-align:center;' +
          `background:${r.bg ?? '#fff'};color:${r.fg ?? '#000'};font:${size}px/1.15 ${FONT};` +
          'overflow:hidden;border-radius:6px;pointer-events:auto;';
      } else {
        // tooltip: invisible hit area, translation shown as a native tooltip on hover
        el.textContent = '';
        el.title = r.translated;
        el.style.cssText = box + 'background:transparent;pointer-events:auto;';
      }
    }
  };

  const ro = new ResizeObserver(layout);
  ro.observe(img);
  win.addEventListener('resize', layout);
  layout();

  return {
    update: layout,
    setMode(m) {
      currentMode = m;
      layout();
    },
    destroy() {
      ro.disconnect();
      win.removeEventListener('resize', layout);
      layer.remove();
    },
  };
}
