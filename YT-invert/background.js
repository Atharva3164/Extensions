// background.js
// Service worker: stores invert state PER TAB (keyed by tab id), answers
// content scripts asking for their own tab's state, handles the keyboard
// shortcut for the active tab only, and cleans up state when a tab closes.

function storageKey(tabId) {
  return `invert_${tabId}`;
}

// Content script asks "what's my state?" on load — answer using the
// sender's own tab id so each tab only ever sees its own setting.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getInitialState' && sender.tab && sender.tab.id != null) {
    const key = storageKey(sender.tab.id);
    chrome.storage.local.get([key], (result) => {
      sendResponse({ isInverted: !!result[key] });
    });
    return true; // async response
  }
});

// Keyboard shortcut toggles ONLY the currently active tab.
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-invert') return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id || !tab.url || !tab.url.includes('youtube.com')) return;

  const key = storageKey(tab.id);
  const stored = await chrome.storage.local.get([key]);
  const newState = !stored[key];

  await chrome.storage.local.set({ [key]: newState });

  await ensureContentScript(tab.id);

  chrome.tabs.sendMessage(tab.id, {
    action: newState ? 'invertOn' : 'invertOff',
  });
});

// Clean up stored state once a tab is closed so storage doesn't grow forever.
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(storageKey(tabId));
});

async function ensureContentScript(tabId) {
  const alive = await pingContentScript(tabId);
  if (alive) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    });
  } catch (e) {
    // Restricted page (chrome://, Web Store, etc.) — nothing we can do.
  }
}

function pingContentScript(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: 'ping' }, () => {
      resolve(!chrome.runtime.lastError);
    });
  });
}
