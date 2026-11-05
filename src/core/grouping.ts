import type { BBox, OcrWord, SourceLang, TextRegion } from './types';
import { cleanBubbleText, isMeaningful } from './textClean';

const MIN_CONF = 40;

interface Line {
  words: OcrWord[];
  bbox: BBox;
}

function union(a: BBox, b: BBox): BBox {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    w: Math.max(a.x + a.w, b.x + b.w) - x,
    h: Math.max(a.y + a.h, b.y + b.h) - y,
  };
}

function overlap1d(a0: number, a1: number, b0: number, b1: number): number {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
}

/** Group words that sit on the same baseline into lines. */
function buildLines(words: OcrWord[]): Line[] {
  // left-to-right so a line only ever grows at its right end; sorting by y first would
  // interleave words whose boxes differ by a few px (descenders such as g, y)
  const sorted = [...words].sort((a, b) => a.bbox.x - b.bbox.x);
  const lines: Line[] = [];
  for (const w of sorted) {
    const line = lines.find((l) => {
      const ov = overlap1d(l.bbox.y, l.bbox.y + l.bbox.h, w.bbox.y, w.bbox.y + w.bbox.h);
      const gap = w.bbox.x - (l.bbox.x + l.bbox.w);
      return ov > 0.5 * Math.min(l.bbox.h, w.bbox.h) && gap < 1.5 * w.bbox.h && gap > -w.bbox.h;
    });
    if (line) {
      line.words.push(w);
      line.bbox = union(line.bbox, w.bbox);
    } else {
      lines.push({ words: [w], bbox: { ...w.bbox } });
    }
  }
  for (const l of lines) l.words.sort((a, b) => a.bbox.x - b.bbox.x);
  return lines;
}

const hasLetters = (s: string) => /[\p{L}\p{N}]/u.test(s);

/**
 * All words found inside one detected bubble form exactly one region.
 * Latin text is ordered by geometry. For CJK the engine's own reading order is used (`rawText`),
 * because vertical columns read right to left and the line builder only knows horizontal rows.
 */
export function bubbleRegion(words: OcrWord[], lang: SourceLang = 'en', rawText?: string): TextRegion | null {
  const good = words.filter((w) => w.conf >= MIN_CONF && hasLetters(w.text));
  if (!good.length) return null;

  let text: string;
  let bbox: BBox;
  let lineHeight: number;
  if (lang !== 'en' && rawText) {
    text = cleanBubbleText(rawText, lang);
    bbox = good.map((w) => w.bbox).reduce(union);
    lineHeight = good.reduce((s, w) => s + Math.min(w.bbox.w, w.bbox.h), 0) / good.length;
  } else {
    const lines = buildLines(good).sort((a, b) => a.bbox.y - b.bbox.y);
    text = cleanBubbleText(lines.map((l) => l.words.map((w) => w.text).join(' ')).join(' '), lang);
    bbox = lines.map((l) => l.bbox).reduce(union);
    lineHeight = lines.reduce((s, l) => s + l.bbox.h, 0) / lines.length;
  }
  if (!isMeaningful(text, lang)) return null;
  return { bbox, text, conf: good.reduce((s, w) => s + w.conf, 0) / good.length, lineHeight };
}

/** Merge stacked lines (same column, small vertical gap) into bubble-sized regions. */
export function groupWords(words: OcrWord[], lang: SourceLang = 'en'): TextRegion[] {
  const good = words.filter((w) => w.conf >= MIN_CONF && hasLetters(w.text));
  const lines = buildLines(good).sort((a, b) => a.bbox.y - b.bbox.y);

  const groups: Line[][] = [];
  for (const line of lines) {
    const g = groups.find((grp) => {
      const last = grp[grp.length - 1];
      const gap = line.bbox.y - (last.bbox.y + last.bbox.h);
      const h = Math.max(line.bbox.h, last.bbox.h);
      const colOverlap = overlap1d(
        last.bbox.x, last.bbox.x + last.bbox.w, line.bbox.x, line.bbox.x + line.bbox.w,
      );
      return gap < 1.5 * h && colOverlap > 0.3 * Math.min(last.bbox.w, line.bbox.w);
    });
    if (g) g.push(line);
    else groups.push([line]);
  }

  const regions: TextRegion[] = [];
  for (const grp of groups) {
    const bbox = grp.map((l) => l.bbox).reduce(union);
    const wordsIn = grp.flatMap((l) => l.words);
    const text = cleanBubbleText(grp.map((l) => l.words.map((w) => w.text).join(' ')).join(' '), lang);
    if (!isMeaningful(text, lang)) continue;
    const conf = wordsIn.reduce((s, w) => s + w.conf, 0) / wordsIn.length;
    const lineHeight = grp.reduce((s, l) => s + l.bbox.h, 0) / grp.length;
    regions.push({ bbox, text, conf, lineHeight });
  }
  return regions;
}
