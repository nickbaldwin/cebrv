import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save - to reload.");

// chrome.contextMenus.onClicked.addListener(genericOnClick);

chrome.runtime.onInstalled.addListener(function () {
  // Create one test item for each context type.

  chrome.contextMenus.create({
    id: 'rethinkful',
    title: 'add to rethinkful',
    type: 'normal',
    contexts: ['page'],
  });
});

chrome.contextMenus.onClicked.addListener((item, tab) => {
  const url = tab?.url || '';
  if (item.menuItemId !== 'rethinkful' || url.startsWith('chrome://')) {
    return;
  }
  console.log(tab?.url);
  console.log(tab?.title);
  console.log(tab?.favIconUrl);
  console.log(tab?.active);

  const u = new URL(tab?.url || '');
  console.log(u.hostname);
  console.log(u.origin);
  console.log(u.pathname);
});
