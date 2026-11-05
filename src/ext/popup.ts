const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// source language: read by the background script on every request, so nothing else to notify
const lang = $<HTMLSelectElement>('lang');
chrome.storage.sync.get('lang').then((v) => { lang.value = (v.lang as string | undefined) ?? 'en'; });
lang.addEventListener('change', () => chrome.storage.sync.set({ lang: lang.value }));

const select = $<HTMLSelectElement>('mode');
chrome.storage.sync.get('mode').then((v) => { select.value = (v.mode as string | undefined) ?? 'overlay'; });

select.addEventListener('change', async () => {
  await chrome.storage.sync.set({ mode: select.value });
  const tab = await activeTab();
  if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: 'set-mode', mode: select.value });
});

$('translate').addEventListener('click', async () => {
  const tab = await activeTab();
  if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: 'translate-all' });
  window.close();
});

$('region').addEventListener('click', async () => {
  const tab = await activeTab();
  if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: 'select-region' });
  window.close();
});

$('clear').addEventListener('click', async () => {
  const tab = await activeTab();
  if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: 'clear' });
});
