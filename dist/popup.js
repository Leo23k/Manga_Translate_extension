"use strict";
(() => {
  // src/ext/popup.ts
  var $ = (id) => document.getElementById(id);
  async function activeTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }
  var lang = $("lang");
  chrome.storage.sync.get("lang").then((v) => {
    lang.value = v.lang ?? "en";
  });
  lang.addEventListener("change", () => chrome.storage.sync.set({ lang: lang.value }));
  var select = $("mode");
  chrome.storage.sync.get("mode").then((v) => {
    select.value = v.mode ?? "overlay";
  });
  select.addEventListener("change", async () => {
    await chrome.storage.sync.set({ mode: select.value });
    const tab = await activeTab();
    if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: "set-mode", mode: select.value });
  });
  $("translate").addEventListener("click", async () => {
    const tab = await activeTab();
    if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: "translate-all" });
    window.close();
  });
  $("region").addEventListener("click", async () => {
    const tab = await activeTab();
    if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: "select-region" });
    window.close();
  });
  $("clear").addEventListener("click", async () => {
    const tab = await activeTab();
    if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: "clear" });
  });
})();
