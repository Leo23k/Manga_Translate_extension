export type Lang = 'en' | 'ko' | 'ja' | 'zh' | 'vi';

/** Languages the OCR + translation pipeline can read; always translated to Vietnamese. */
export type SourceLang = 'en' | 'ja' | 'ko' | 'zh';

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface OcrWord {
  text: string;
  conf: number;
  bbox: BBox;
}

export interface TextRegion {
  bbox: BBox;
  text: string;
  conf: number;
  lineHeight: number;
  /** sampled bubble background / text colour, filled in by the platform adapter */
  bg?: string;
  fg?: string;
}

export interface OcrResult {
  width: number;
  height: number;
  regions: TextRegion[];
}

export interface TranslatedRegion extends TextRegion {
  translated: string;
}

export type DisplayMode = 'overlay' | 'tooltip';
