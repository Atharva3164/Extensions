// Get the checkbox element
const invertToggle = document.getElementById('invertToggle');

// On popup open, read stored state (optional)
chrome.storage.local.get(['isInverted'], (result) => {
  invertToggle.checked = !!result.isInverted;
});

// Listen for toggle changes
invertToggle.addEventListener('change', () => {
  // Get the current tab (YouTube page)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) return;

    // Send a message to the content script in that tab
    chrome.tabs.sendMessage(tab.id, {
      action: invertToggle.checked ? 'invertOn' : 'invertOff'
    });

    // Optionally store the state so that reopening the popup persists it
    chrome.storage.local.set({ isInverted: invertToggle.checked });
  });
});
