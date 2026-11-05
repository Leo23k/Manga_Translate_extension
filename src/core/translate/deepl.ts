import type { Lang } from '../types';
import type { Fetcher, TranslateProvider } from './Provider';

/** DeepL does not support Vietnamese as of writing; kept for the pipeline and other targets. */
export class DeepLProvider implements TranslateProvider {
  readonly id = 'deepl';
  constructor(private apiKey: string, private fetcher: Fetcher = fetch.bind(globalThis)) {}

  async translate(texts: string[], from: Lang, to: Lang): Promise<string[]> {
    if (!texts.length) return [];
    const host = this.apiKey.endsWith(':fx') ? 'api-free.deepl.com' : 'api.deepl.com';
    const res = await this.fetcher(`https://${host}/v2/translate`, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: texts,
        source_lang: from.toUpperCase(),
        target_lang: to.toUpperCase(),
      }),
    });
    if (!res.ok) throw new Error(`DeepL failed: ${res.status}`);
    const data = (await res.json()) as { translations: Array<{ text: string }> };
    return data.translations.map((t) => t.text);
  }
}
