
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-invert') {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.id) return;

      if (!tab.url || !tab.url.includes('youtube.com/watch')) {
        return;
      }

      chrome.storage.local.get(['isInverted'], (result) => {
        const newState = !result.isInverted;
        

        chrome.tabs.sendMessage(tab.id, {
          action: newState ? 'invertOn' : 'invertOff'
        });
        

        chrome.storage.local.set({ isInverted: newState });
      });
    });
  }
});
