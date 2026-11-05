import { describe, expect, it } from 'vitest';
import { bubbleRegion, groupWords } from '../src/core/grouping';
import { cropBubble, findBubbles, inkBox } from '../src/core/bubbles';
import { isVerticalInk } from '../src/core/lang';
import { cleanBubbleText, isMeaningful } from '../src/core/textClean';
import { splitNumbered } from '../src/core/translate/google';
import type { OcrWord } from '../src/core/types';

const w = (text: string, x: number, y: number, ww = 40, h = 14, conf = 90): OcrWord => ({
  text, conf, bbox: { x, y, w: ww, h },
});

describe('groupWords', () => {
  it('merges stacked lines into one bubble and separates distant ones', () => {
    const words = [
      w('HELLO', 10, 10), w('THERE', 60, 10),
      w('FRIEND', 10, 28),
      w('RUN', 300, 400),
    ];
    const regions = groupWords(words);
    expect(regions).toHaveLength(2);
    expect(regions[0].text).toBe('Hello there friend');
    expect(regions[1].text).toBe('Run');
  });
  it('keeps a line together when word tops differ by a few px', () => {
    const words = [
      w('Where', 140, 172, 60), w('are', 205, 175), w('you', 250, 172), w('going', 295, 178, 80, 20),
      w('so', 125, 218, 30), w('early', 160, 216, 60), w('this', 225, 215),
    ];
    const regions = groupWords(words);
    expect(regions).toHaveLength(1);
    expect(regions[0].text).toBe('Where are you going so early this');
  });
  it('drops low-confidence noise', () => {
    expect(groupWords([w('xx', 0, 0, 10, 10, 10)])).toHaveLength(0);
  });
});

describe('cleanBubbleText', () => {
  it('joins hyphenated words and fixes lone l', () => {
    expect(cleanBubbleText('Let us go to- gether')).toBe('Let us go together');
    expect(cleanBubbleText('l am here')).toBe('I am here');
  });
});

describe('CJK text', () => {
  it('drops the spaces Tesseract puts between Japanese and Chinese tokens', () => {
    expect(cleanBubbleText('どこ へ 行く の ?', 'ja')).toBe('どこへ行くの?');
    expect(cleanBubbleText('你 要 去 哪里 ?', 'zh')).toBe('你要去哪里?');
  });
  it('keeps word spacing in Korean', () => {
    expect(cleanBubbleText('어디 가는 거야 ?', 'ko')).toBe('어디 가는 거야?');
  });
  it('does not treat Latin-only text as meaningful CJK', () => {
    expect(isMeaningful('abc', 'ja')).toBe(false);
    expect(isMeaningful('待って', 'ja')).toBe(true);
  });
  it('uses the engine reading order for a bubble, and ignores noise words', () => {
    // vertical column order (right column first) is only known to the engine
    const words = [w('待', 10, 10, 20, 20, 90), w('一', 40, 10, 20, 20, 90), w('x', 70, 10, 5, 5, 5)];
    const r = bubbleRegion(words, 'ja', '一 緒 に | 待 っ て')!;
    expect(r.text).toBe('一緒に|待って');
    expect(r.bbox).toEqual({ x: 10, y: 10, w: 50, h: 20 });
  });
  it('reads Japanese as vertical only when the ink is clearly taller than wide', () => {
    expect(isVerticalInk('ja', { w: 100, h: 260 })).toBe(true);
    expect(isVerticalInk('ja', { w: 260, h: 100 })).toBe(false);
    expect(isVerticalInk('ko', { w: 100, h: 260 })).toBe(false);
    expect(isVerticalInk('ja', null)).toBe(false);
  });
});

describe('findBubbles', () => {
  const W = 120, H = 90;
  const img = (draw: (x: number, y: number) => [number, number, number]) => {
    const d = new Uint8ClampedArray(W * H * 4);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const [r, g, b] = draw(x, y);
        d.set([r, g, b, 255], (y * W + x) * 4);
      }
    return d;
  };
  const inBubble = (x: number, y: number) => x >= 20 && x < 100 && y >= 15 && y < 75;
  const onInk = (x: number, y: number) => x >= 40 && x < 80 && y >= 40 && y < 50 && (x % 4) < 2;

  it('finds a white box holding ink and ignores bare bright areas', () => {
    const rgba = img((x, y) => (onInk(x, y) ? [0, 0, 0] : inBubble(x, y) ? [255, 255, 255] : [90, 60, 140]));
    const found = findBubbles(rgba, W, H);
    expect(found).toHaveLength(1);
    expect(found[0].bbox).toEqual({ x: 20, y: 15, w: 80, h: 60 });
    const empty = img((x, y) => (inBubble(x, y) ? [255, 255, 255] : [90, 60, 140]));
    expect(findBubbles(empty, W, H)).toHaveLength(0);
  });

  it('crops ink only: artwork outside the bubble becomes white', () => {
    const rgba = img((x, y) => (onInk(x, y) ? [0, 0, 0] : inBubble(x, y) ? [255, 255, 255] : [10, 10, 10]));
    const [b] = findBubbles(rgba, W, H);
    const crop = cropBubble(rgba, W, b, 5);
    expect(crop.width).toBe(90);
    expect(crop.data[0]).toBe(255); // padding corner
    const inkPx = (45 - crop.x + (45 - crop.y) * crop.width) * 4; // x=45 -> x%4=1 -> ink
    expect(crop.data[inkPx]).toBe(0);
    // the ink strip is 40 wide x 10 tall (x 40..80, y 40..50 with every 4th pair of columns)
    expect(inkBox(crop)).toEqual({ w: 38, h: 10 });
  });
});

describe('splitNumbered', () => {
  it('maps numbered lines back to indices', () => {
    expect(splitNumbered('1. Xin chào\n2. Tạm biệt', 2)).toEqual(['Xin chào', 'Tạm biệt']);
  });
});
