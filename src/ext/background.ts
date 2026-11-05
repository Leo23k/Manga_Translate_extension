import { GoogleProvider } from '../core/translate/google';
import type { BBox, OcrResult, SourceLang, TranslatedRegion } from '../core/types';

interface Translated {
  width: number;
  regions: TranslatedRegion[];
}

const provider = new GoogleProvider();
const inflight = new Map<string, Promise<Translated>>();

async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: [chrome.offscreen.Reason.WORKERS],
    justification: 'Run Tesseract OCR (WASM + worker) outside the page CSP',
  });
}

/** Source language picked in the popup; read per request so changing it needs no reload. */
async function getLang(): Promise<SourceLang> {
  const v = await chrome.storage.sync.get('lang');
  return (['en', 'ja', 'ko', 'zh'] as const).find((l) => l === v.lang) ?? 'en';
}

// Repeated lines (sound effects, "Yes.", re-scans of the same area) skip the network entirely.
const memo = new Map<string, string>();
const MEMO_MAX = 800;

async function translateTexts(texts: string[], lang: SourceLang): Promise<string[]> {
  const k = (t: string) => `${lang}\u0000${t}`;
  const missing = [...new Set(texts.filter((t) => !memo.has(k(t))))];
  if (missing.length) {
    const out = await provider.translate(missing, lang, 'vi');
    missing.forEach((t, i) => {
      if (out[i]) memo.set(k(t), out[i]);
    });
    while (memo.size > MEMO_MAX) memo.delete(memo.keys().next().value!);
  }
  return texts.map((t) => memo.get(k(t)) ?? '');
}

/**
 * Image CDNs often reject hotlinking (403 without the reader page as Referer). fetch() cannot
 * set Referer itself, so a session rule rewrites it for requests made by the extension.
 */
async function allowHotlink(imageUrl: string, pageUrl: string) {
  const host = new URL(imageUrl).hostname;
  const origin = new URL(pageUrl).origin;
  let id = 1;
  for (const ch of host) id = (id * 31 + ch.charCodeAt(0)) % 1_000_000_000;
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [id],
    addRules: [{
      id,
      priority: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        requestHeaders: [
          { header: 'referer', operation: chrome.declarativeNetRequest.HeaderOperation.SET, value: `${origin}/` },
          { header: 'origin', operation: chrome.declarativeNetRequest.HeaderOperation.SET, value: origin },
        ],
      },
      condition: {
        requestDomains: [host],
        tabIds: [chrome.tabs.TAB_ID_NONE],
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
          chrome.declarativeNetRequest.ResourceType.OTHER,
        ],
      },
    }],
  });
}

async function translateImage(url: string, pageUrl?: string, region?: BBox): Promise<Translated> {
  const lang = await getLang();
  // selected areas are one-off, so only whole-image results are cached
  const key = `leo:v2:${lang}:${provider.id}:${url}`;
  if (!region) {
    const cached = (await chrome.storage.local.get(key))[key] as Translated | undefined;
    if (cached) return cached;
  }

  if (pageUrl) await allowHotlink(url, pageUrl);
  await ensureOffscreen();
  const reply = await chrome.runtime.sendMessage({ target: 'offscreen', type: 'ocr', url, region, lang });
  if (!reply?.ok) throw new Error(reply?.error ?? 'OCR failed');
  const ocr = reply.result as OcrResult;
  const out = await translateTexts(ocr.regions.map((r) => r.text), lang);
  const regions = ocr.regions
    .map((r, i) => ({ ...r, translated: out[i] }))
    .filter((r) => r.translated);
  const value = { width: ocr.width, regions };
  if (!region) await chrome.storage.local.set({ [key]: value }).catch(() => {});
  return value;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'warm') {
    void (async () => {
      await ensureOffscreen();
      await chrome.runtime.sendMessage({ target: 'offscreen', type: 'warm', lang: await getLang() });
    })().catch(() => {});
    return;
  }
  if (msg?.type !== 'translate-image') return;
  // coalesce duplicate requests for the same image / area
  const id = msg.region ? `${msg.url}@${JSON.stringify(msg.region)}` : msg.url;
  let p = inflight.get(id);
  if (!p) {
    p = translateImage(msg.url, msg.pageUrl, msg.region).finally(() => inflight.delete(id));
    inflight.set(id, p);
  }
  p.then(
    (data) => sendResponse({ ok: true, data }),
    (e) => sendResponse({ ok: false, error: String(e?.message ?? e) }),
  );
  return true;
});

// A single item keeps it at the top level of the right-click menu: Chrome folds two or more
// items from one extension into a submenu named after the extension.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'leo-region', title: 'Quét để dịch', contexts: ['all'] });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (tab?.id && info.menuItemId === 'leo-region')
    chrome.tabs.sendMessage(tab.id, { type: 'select-region' });
});
