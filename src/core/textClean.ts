import type { SourceLang } from './types';

const CJK_LETTER = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

/** Normalize OCR text of one speech bubble into a sentence ready for translation. */
export function cleanBubbleText(raw: string, lang: SourceLang = 'en'): string {
  return lang === 'en' ? cleanEnglish(raw) : cleanCjk(raw, lang);
}

function cleanEnglish(raw: string): string {
  let t = raw.replace(/\s+/g, ' ').trim();
  // join words hyphenated across line breaks: "TO- GETHER" -> "TOGETHER"
  t = t.replace(/([A-Za-z])- ([a-z]{2,})/g, '$1$2');
  t = t.replace(/\bl(?=\s|[,.!?]|$)/g, 'I').replace(/\|/g, 'I');
  const letters = t.replace(/[^A-Za-z]/g, '');
  const upper = letters.replace(/[^A-Z]/g, '').length;
  if (letters.length >= 3 && upper / letters.length > 0.8) t = toSentenceCase(t);
  return t;
}

function cleanCjk(raw: string, lang: SourceLang): string {
  let t = raw.replace(/\s+/g, ' ').trim();
  if (lang === 'ko') {
    // Korean separates words with spaces; only drop the ones Tesseract puts before punctuation
    return t.replace(/ (?=[?!.,~…])/g, '');
  }
  // Japanese and Chinese are written without spaces, but Tesseract emits one between tokens
  t = t.replace(/\s+(?=[^\x00-\x7F])|(?<=[^\x00-\x7F])\s+/g, '');
  return t.replace(/ (?=[?!.,])/g, '');
}

function toSentenceCase(s: string): string {
  const lower = s.toLowerCase().replace(/\bi\b/g, 'I');
  return lower.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase());
}

/** A region is worth translating only if it holds some real words. */
export function isMeaningful(text: string, lang: SourceLang = 'en'): boolean {
  if (lang !== 'en') return CJK_LETTER.test(text);
  const letters = text.replace(/[^A-Za-z]/g, '');
  return letters.length >= 2 && /[A-Za-z]{2,}/.test(text);
}
