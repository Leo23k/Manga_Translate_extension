"use strict";
(() => {
  // src/core/translate/google.ts
  var SEP = "\n";
  var CODE = { zh: "zh-CN" };
  var GoogleProvider = class {
    constructor(fetcher = fetch.bind(globalThis)) {
      this.fetcher = fetcher;
    }
    fetcher;
    id = "google";
    async translate(texts, from, to) {
      if (!texts.length) return [];
      const q = texts.map((t, i) => `${i + 1}. ${t.replace(/\n/g, " ")}`).join(SEP);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${CODE[from] ?? from}&tl=${CODE[to] ?? to}&q=${encodeURIComponent(q)}`;
      const res = await retry(() => this.fetcher(url));
      if (!res.ok) throw new Error(`Google translate failed: ${res.status}`);
      const data = await res.json();
      const joined = data[0].map((s) => s[0]).join("");
      return splitNumbered(joined, texts.length);
    }
  };
  function splitNumbered(out, n) {
    const result = new Array(n).fill("");
    for (const line of out.split(/\n+/)) {
      const m = line.match(/^\s*(\d+)\s*[.)]\s*(.*)$/);
      if (m) {
        const i = Number(m[1]) - 1;
        if (i >= 0 && i < n) result[i] = m[2].trim();
      }
    }
    return result;
  }
  async function retry(fn, tries = 3) {
    let last;
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

  // src/ext/background.ts
  var provider = new GoogleProvider();
  var inflight = /* @__PURE__ */ new Map();
  async function ensureOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: [chrome.offscreen.Reason.WORKERS],
      justification: "Run Tesseract OCR (WASM + worker) outside the page CSP"
    });
  }
  async function getLang() {
    const v = await chrome.storage.sync.get("lang");
    return ["en", "ja", "ko", "zh"].find((l) => l === v.lang) ?? "en";
  }
  var memo = /* @__PURE__ */ new Map();
  var MEMO_MAX = 800;
  async function translateTexts(texts, lang) {
    const k = (t) => `${lang}\0${t}`;
    const missing = [...new Set(texts.filter((t) => !memo.has(k(t))))];
    if (missing.length) {
      const out = await provider.translate(missing, lang, "vi");
      missing.forEach((t, i) => {
        if (out[i]) memo.set(k(t), out[i]);
      });
      while (memo.size > MEMO_MAX) memo.delete(memo.keys().next().value);
    }
    return texts.map((t) => memo.get(k(t)) ?? "");
  }
  async function allowHotlink(imageUrl, pageUrl) {
    const host = new URL(imageUrl).hostname;
    const origin = new URL(pageUrl).origin;
    let id = 1;
    for (const ch of host) id = (id * 31 + ch.charCodeAt(0)) % 1e9;
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [id],
      addRules: [{
        id,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            { header: "referer", operation: chrome.declarativeNetRequest.HeaderOperation.SET, value: `${origin}/` },
            { header: "origin", operation: chrome.declarativeNetRequest.HeaderOperation.SET, value: origin }
          ]
        },
        condition: {
          requestDomains: [host],
          tabIds: [chrome.tabs.TAB_ID_NONE],
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
            chrome.declarativeNetRequest.ResourceType.OTHER
          ]
        }
      }]
    });
  }
  async function translateImage(url, pageUrl, region) {
    const lang = await getLang();
    const key = `leo:v2:${lang}:${provider.id}:${url}`;
    if (!region) {
      const cached = (await chrome.storage.local.get(key))[key];
      if (cached) return cached;
    }
    if (pageUrl) await allowHotlink(url, pageUrl);
    await ensureOffscreen();
    const reply = await chrome.runtime.sendMessage({ target: "offscreen", type: "ocr", url, region, lang });
    if (!reply?.ok) throw new Error(reply?.error ?? "OCR failed");
    const ocr = reply.result;
    const out = await translateTexts(ocr.regions.map((r) => r.text), lang);
    const regions = ocr.regions.map((r, i) => ({ ...r, translated: out[i] })).filter((r) => r.translated);
    const value = { width: ocr.width, regions };
    if (!region) await chrome.storage.local.set({ [key]: value }).catch(() => {
    });
    return value;
  }
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === "warm") {
      void (async () => {
        await ensureOffscreen();
        await chrome.runtime.sendMessage({ target: "offscreen", type: "warm", lang: await getLang() });
      })().catch(() => {
      });
      return;
    }
    if (msg?.type !== "translate-image") return;
    const id = msg.region ? `${msg.url}@${JSON.stringify(msg.region)}` : msg.url;
    let p = inflight.get(id);
    if (!p) {
      p = translateImage(msg.url, msg.pageUrl, msg.region).finally(() => inflight.delete(id));
      inflight.set(id, p);
    }
    p.then(
      (data) => sendResponse({ ok: true, data }),
      (e) => sendResponse({ ok: false, error: String(e?.message ?? e) })
    );
    return true;
  });
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({ id: "leo-region", title: "Qu\xE9t \u0111\u1EC3 d\u1ECBch", contexts: ["all"] });
    });
  });
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (tab?.id && info.menuItemId === "leo-region")
      chrome.tabs.sendMessage(tab.id, { type: "select-region" });
  });
})();
