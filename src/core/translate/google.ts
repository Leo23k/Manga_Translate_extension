import type { Lang } from '../types';
import type { Fetcher, TranslateProvider } from './Provider';

const SEP = '\n';
// Google calls Simplified Chinese zh-CN; the other codes match ours
const CODE: Partial<Record<Lang, string>> = { zh: 'zh-CN' };

/** Unofficial gtx endpoint: no key, but rate-limited, so bubbles are batched into one request. */
export class GoogleProvider implements TranslateProvider {
  readonly id = 'google';
  constructor(private fetcher: Fetcher = fetch.bind(globalThis)) {}

  async translate(texts: string[], from: Lang, to: Lang): Promise<string[]> {
    if (!texts.length) return [];
    // one numbered line per bubble keeps context and lets us split the answer back
    const q = texts.map((t, i) => `${i + 1}. ${t.replace(/\n/g, ' ')}`).join(SEP);
    const url =
      'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t' +
      `&sl=${CODE[from] ?? from}&tl=${CODE[to] ?? to}&q=${encodeURIComponent(q)}`;
    const res = await retry(() => this.fetcher(url));
    if (!res.ok) throw new Error(`Google translate failed: ${res.status}`);
    const data = (await res.json()) as [Array<[string]>];
    const joined = data[0].map((s) => s[0]).join('');
    return splitNumbered(joined, texts.length);
  }
}

export function splitNumbered(out: string, n: number): string[] {
  const result: string[] = new Array(n).fill('');
  for (const line of out.split(/\n+/)) {
    const m = line.match(/^\s*(\d+)\s*[.)]\s*(.*)$/);
    if (m) {
      const i = Number(m[1]) - 1;
      if (i >= 0 && i < n) result[i] = m[2].trim();
    }
  }
  return result;
}

async function retry<T extends Response>(fn: () => Promise<T>, tries = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fn();
      if (r.status !== 429 && r.status < 500) return r;
      last = new Error(`HTTP ${r.status}`);
    } catch (e) {
      last = e;
    }
    await new Promise((r) => setTimeout(r, 400 * 2 ** i));
  }
  throw last;
}
