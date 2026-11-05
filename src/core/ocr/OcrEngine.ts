import type { Lang, OcrWord } from '../types';

export interface OcrEngine {
  recognize(image: Blob, lang: Lang): Promise<OcrWord[]>;
  dispose(): Promise<void>;
}
