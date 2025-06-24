document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('darkToggle');
  const statusText = document.getElementById('statusText');
  

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab) return;
  

  const result = await chrome.storage.local.get([`dark_${tab.id}`]);
  const isDarkEnabled = result[`dark_${tab.id}`] || false;
  

  toggle.checked = isDarkEnabled;
  updateStatusText(isDarkEnabled);

  toggle.addEventListener('change', async () => {
    const newState = toggle.checked;
    
    try {

      await chrome.storage.local.set({ [`dark_${tab.id}`]: newState });
      

      await chrome.runtime.sendMessage({
        action: 'toggleDark',
        tabId: tab.id,
        enabled: newState
      });
      

      updateStatusText(newState);
      

      chrome.action.setBadgeText({
        text: newState ? "ON" : "",
        tabId: tab.id
      });
      
      chrome.action.setBadgeBackgroundColor({
        color: newState ? "#4CAF50" : "#FF0000"
      });
      
    } catch (error) {
      console.error('Error toggling dark mode:', error);

      toggle.checked = !newState;
    }
  });
  
  function updateStatusText(enabled) {
    statusText.textContent = enabled ? 'ON' : 'OFF';
    statusText.className = enabled ? 'status-text active' : 'status-text';
  }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updatePopup') {
    const toggle = document.getElementById('darkToggle');
    const statusText = document.getElementById('statusText');
    
    if (toggle && statusText) {
      toggle.checked = message.enabled;
      statusText.textContent = message.enabled ? 'ON' : 'OFF';
      statusText.className = message.enabled ? 'status-text active' : 'status-text';
    }
  }
});