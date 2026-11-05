import type { Lang } from '../types';

export interface TranslateProvider {
  readonly id: string;
  translate(texts: string[], from: Lang, to: Lang): Promise<string[]>;
}

export type Fetcher = typeof fetch;
