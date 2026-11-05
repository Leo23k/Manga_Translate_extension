import type { SourceLang } from './types';

/** Tesseract model used to read each source language (horizontal text). */
export const OCR_MODEL: Record<SourceLang, string> = {
  en: 'eng',
  ja: 'jpn',
  ko: 'kor',
  zh: 'chi_sim',
};

/** Japanese is often set in vertical columns, which needs its own model. */
export const VERTICAL_MODEL = 'jpn_vert';

/**
 * Whether lettering of this ink extent is vertical. Decided from geometry rather than from
 * recognition confidence: the horizontal model reads vertical columns as confident nonsense.
 */
export function isVerticalInk(lang: SourceLang, ink: { w: number; h: number } | null): boolean {
  return lang === 'ja' && !!ink && ink.h > ink.w * 1.15;
}

export const isCjk = (lang: SourceLang) => lang !== 'en';
