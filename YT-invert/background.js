chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle_invert") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.id) return;

      // Send message to content.js to toggle invert
      chrome.tabs.sendMessage(tab.id, { action: "toggleInvertShortcut" });
    });
  }
});
