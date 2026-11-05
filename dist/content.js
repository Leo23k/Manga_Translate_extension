"use strict";
(() => {
  // src/core/render/fitText.ts
  function fitFontSize(doc, text, w, h, fontFamily, max = 40, min = 7) {
    const probe = doc.createElement("div");
    probe.style.cssText = `position:absolute;visibility:hidden;left:-9999px;top:0;width:${w}px;font-family:${fontFamily};line-height:1.15;text-align:center;overflow-wrap:break-word;`;
    probe.textContent = text;
    doc.body.appendChild(probe);
    let lo = min;
    let hi = max;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      probe.style.fontSize = `${mid}px`;
      if (probe.scrollHeight <= h) lo = mid;
      else hi = mid - 1;
    }
    probe.remove();
    return lo;
  }

  // src/core/render/overlay.ts
  var FONT = '"Patrick Hand","Comic Neue","Be Vietnam Pro","Segoe UI",sans-serif';
  function renderRegions(img, regions, naturalW, mode2) {
    const doc = img.ownerDocument;
    const win = doc.defaultView;
    const layer = doc.createElement("div");
    layer.className = "leo-layer";
    layer.style.cssText = "position:absolute;z-index:2147483000;pointer-events:none;";
    doc.body.appendChild(layer);
    const items = [];
    for (const r of regions) {
      const el = doc.createElement("div");
      el.className = "leo-bubble";
      layer.appendChild(el);
      items.push({ el, r });
    }
    let currentMode = mode2;
    const layout = () => {
      const rect = img.getBoundingClientRect();
      layer.style.left = `${rect.left + win.scrollX}px`;
      layer.style.top = `${rect.top + win.scrollY}px`;
      layer.style.width = `${rect.width}px`;
      layer.style.height = `${rect.height}px`;
      const s = rect.width / naturalW;
      for (const { el, r } of items) {
        const pad = r.lineHeight * 0.25;
        const x = (r.bbox.x - pad) * s;
        const y = (r.bbox.y - pad) * s;
        const w = (r.bbox.w + pad * 2) * s;
        const h = (r.bbox.h + pad * 2) * s;
        const box = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;box-sizing:border-box;`;
        if (currentMode === "overlay") {
          const size = fitFontSize(doc, r.translated, w, h, FONT);
          el.textContent = r.translated;
          el.removeAttribute("title");
          el.style.cssText = box + `display:flex;align-items:center;justify-content:center;text-align:center;background:${r.bg ?? "#fff"};color:${r.fg ?? "#000"};font:${size}px/1.15 ${FONT};overflow:hidden;border-radius:6px;pointer-events:auto;`;
        } else {
          el.textContent = "";
          el.title = r.translated;
          el.style.cssText = box + "background:transparent;pointer-events:auto;";
        }
      }
    };
    const ro = new ResizeObserver(layout);
    ro.observe(img);
    win.addEventListener("resize", layout);
    layout();
    return {
      update: layout,
      setMode(m) {
        currentMode = m;
        layout();
      },
      destroy() {
        ro.disconnect();
        win.removeEventListener("resize", layout);
        layer.remove();
      }
    };
  }

  // src/ext/content.ts
  var MIN_SIZE = 300;
  var handles = /* @__PURE__ */ new Map();
  var busy = /* @__PURE__ */ new Set();
  var mode = "overlay";
  chrome.storage.sync.get("mode").then((v) => {
    if (v.mode) mode = v.mode;
  }).catch(() => {
  });
  function addHandle(img, h) {
    handles.set(img, [...handles.get(img) ?? [], h]);
  }
  async function request(img, region) {
    const url = img.currentSrc || img.src;
    const reply = await chrome.runtime.sendMessage({ type: "translate-image", url, pageUrl: location.href, region });
    if (!reply?.ok) throw new Error(reply?.error);
    return reply.data;
  }
  async function translateImg(img) {
    if (!(img.currentSrc || img.src) || handles.has(img) || busy.has(img)) return;
    busy.add(img);
    img.style.outline = "2px dashed #f90";
    try {
      const { width, regions } = await request(img);
      if (regions.length) addHandle(img, renderRegions(img, regions, width, mode));
    } catch (e) {
      console.warn("[leo] translate failed", img.currentSrc || img.src, e);
    } finally {
      busy.delete(img);
      img.style.outline = "";
    }
  }
  async function translateArea(img, area) {
    const r = img.getBoundingClientRect();
    const left = Math.max(r.left, area.left), right = Math.min(r.right, area.right);
    const top = Math.max(r.top, area.top), bottom = Math.min(r.bottom, area.bottom);
    if (right - left < 8 || bottom - top < 8) return;
    const sx = img.naturalWidth / r.width, sy = img.naturalHeight / r.height;
    const region = { x: (left - r.left) * sx, y: (top - r.top) * sy, w: (right - left) * sx, h: (bottom - top) * sy };
    const box = document.createElement("div");
    box.style.cssText = `position:fixed;left:${left}px;top:${top}px;width:${right - left}px;height:${bottom - top}px;outline:2px dashed #f90;z-index:2147483646;pointer-events:none;`;
    document.body.appendChild(box);
    try {
      const { width, regions } = await request(img, region);
      if (regions.length) addHandle(img, renderRegions(img, regions, width, mode));
      else console.info("[leo] no text found in the selected area");
    } catch (e) {
      console.warn("[leo] area translate failed", e);
    } finally {
      box.remove();
    }
  }
  function selectRegion() {
    void chrome.runtime.sendMessage({ type: "warm" });
    const shield = document.createElement("div");
    shield.style.cssText = "position:fixed;inset:0;z-index:2147483647;cursor:crosshair;background:rgba(0,0,0,.12);";
    const rect = document.createElement("div");
    rect.style.cssText = "position:fixed;border:2px dashed #f90;background:rgba(255,153,0,.15);display:none;";
    shield.appendChild(rect);
    document.body.appendChild(shield);
    let sx = 0, sy = 0, drawing = false;
    const area = (e) => new DOMRect(Math.min(sx, e.clientX), Math.min(sy, e.clientY), Math.abs(e.clientX - sx), Math.abs(e.clientY - sy));
    const done = () => {
      shield.remove();
      window.removeEventListener("keydown", onKey, true);
    };
    const onKey = (e) => {
      if (e.key === "Escape") done();
    };
    window.addEventListener("keydown", onKey, true);
    shield.addEventListener("mousedown", (e) => {
      e.preventDefault();
      drawing = true;
      sx = e.clientX;
      sy = e.clientY;
      rect.style.display = "block";
    });
    shield.addEventListener("mousemove", (e) => {
      if (!drawing) return;
      const a = area(e);
      rect.style.cssText += `;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;`;
    });
    shield.addEventListener("mouseup", (e) => {
      const a = area(e);
      done();
      if (a.width < 12 || a.height < 12) return;
      for (const img of document.images) void translateArea(img, a);
    });
  }
  var isComicSized = (img) => img.naturalWidth >= MIN_SIZE && img.naturalHeight >= MIN_SIZE;
  function translateAll() {
    void chrome.runtime.sendMessage({ type: "warm" });
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const img = e.target;
          if (img.complete && isComicSized(img)) {
            io.unobserve(img);
            void translateImg(img);
          } else if (!img.complete) {
            img.addEventListener("load", () => isComicSized(img) && void translateImg(img), { once: true });
          }
        }
      },
      // start well before an image scrolls in: a tall strip takes seconds to read
      { rootMargin: "3000px 0px" }
    );
    for (const img of document.images) io.observe(img);
  }
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "translate-all") translateAll();
    else if (msg.type === "select-region") selectRegion();
    else if (msg.type === "translate-url") {
      const img = [...document.images].find((i) => (i.currentSrc || i.src) === msg.url);
      if (img) void translateImg(img);
    } else if (msg.type === "set-mode") {
      mode = msg.mode;
      handles.forEach((hs) => hs.forEach((h) => h.setMode(mode)));
    } else if (msg.type === "clear") {
      handles.forEach((hs) => hs.forEach((h) => h.destroy()));
      handles.clear();
    }
  });
})();
