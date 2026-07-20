// popup.js
// Reflects and toggles the invert state for the CURRENTLY ACTIVE TAB only,
// keyed by that tab's own id — independent of any other open YouTube tab.

const invertToggle = document.getElementById('invertToggle');
const statusEl = document.getElementById('status');

let currentTabId = null;

function storageKey(tabId) {
  return `invert_${tabId}`;
}

// On popup open, load THIS tab's stored state (not a global one).
(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    setStatus('No active tab found.', true);
    invertToggle.disabled = true;
    return;
  }

  if (!tab.url || !tab.url.includes('youtube.com')) {
    setStatus('Open a YouTube video to use this.', true);
    invertToggle.disabled = true;
    return;
  }

  currentTabId = tab.id;
  const key = storageKey(currentTabId);
  const result = await chrome.storage.local.get([key]);
  invertToggle.checked = !!result[key];
})();

invertToggle.addEventListener('change', async () => {
  if (currentTabId == null) return;

  const desired = invertToggle.checked;
  const key = storageKey(currentTabId);

  try {
    // Store this tab's state only.
    await chrome.storage.local.set({ [key]: desired });

    // Make sure the content script is present in this tab before messaging
    // it — this is what removes the need to manually reload the page.
    await ensureContentScript(currentTabId);

    chrome.tabs.sendMessage(
      currentTabId,
      { action: desired ? 'invertOn' : 'invertOff' },
      () => {
        if (chrome.runtime.lastError) {
          setStatus("Couldn't reach the page. Try refreshing YouTube once.", true);
        } else {
          setStatus('');
        }
      }
    );
  } catch (err) {
    setStatus('Something went wrong applying the toggle.', true);
  }
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
    // e.g. restricted page — nothing we can do.
  }
}

function pingContentScript(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: 'ping' }, () => {
      resolve(!chrome.runtime.lastError);
    });
  });
}

function setStatus(message, isError) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#c0392b' : '#666';
}
