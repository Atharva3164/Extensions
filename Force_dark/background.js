
const darkCSS = `
html, body {
  background-color: #121212 !important;
  color: #e0e0e0 !important;
}

* {
  background-color: transparent !important;
  color: #e0e0e0 !important;
  border-color: #444 !important;
}

div, p, span, h1, h2, h3, h4, h5, h6, li, td, th, section, article, header, footer, nav, aside {
  background-color: #121212 !important;
  color: #e0e0e0 !important;
}

input, textarea, select, button {
  background-color: #2d2d2d !important;
  color: #e0e0e0 !important;
  border-color: #555 !important;
}

a {
  color: #bb86fc !important;
}

a:visited {
  color: #cf6679 !important;
}

img, video {
  filter: brightness(0.8) contrast(1.2) !important;
}

pre, code {
  background-color: #1e1e1e !important;
  color: #e0e0e0 !important;
}

table {
  background-color: #121212 !important;
}
`;


async function toggleDarkMode(tabId, enabled) {
  try {
    if (enabled) {
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        css: darkCSS
      });
    } else {
      await chrome.scripting.removeCSS({
        target: { tabId: tabId },
        css: darkCSS
      });
    }
    return true;
  } catch (error) {
    console.log('Error toggling dark mode:', error);
    return false;
  }
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-dark") {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        const tabId = tabs[0].id;
        
 
        const result = await chrome.storage.local.get(`dark_${tabId}`);
        const currentState = result[`dark_${tabId}`] || false;
        const newState = !currentState;
        

        await chrome.storage.local.set({ [`dark_${tabId}`]: newState });
        

        const success = await toggleDarkMode(tabId, newState);
        
        if (success) {
     
          await chrome.action.setBadgeText({
            text: newState ? "ON" : "",
            tabId: tabId
          });
          
          await chrome.action.setBadgeBackgroundColor({
            color: newState ? "#4CAF50" : "#FF0000"
          });
        }
      }
    } catch (error) {
      console.log('Error in command listener:', error);
    }
  }
});


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'toggleDark') {
    try {
      const success = await toggleDarkMode(message.tabId, message.enabled);
      sendResponse({ success: success });
    } catch (error) {
      console.error('Error in message handler:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; 
  }
});


chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(`dark_${tabId}`);
});


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {

      const result = await chrome.storage.local.get(`dark_${tabId}`);
      const isDarkEnabled = result[`dark_${tabId}`] || false;
      
      if (isDarkEnabled) {

        const success = await toggleDarkMode(tabId, true);
        if (success) {
          await chrome.action.setBadgeText({ text: "ON", tabId: tabId });
          await chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
        }
      }
    } catch (error) {
      console.log('Error in tab update handler:', error);
    }
  }
});