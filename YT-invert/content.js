// content.js
// This content script runs on every YouTube page load.
// It listens for messages from popup.js and background.js.

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'invertOn') {
    applyInvert();
  } else if (msg.action === 'invertOff') {
    removeInvert();
  }
});

// Helper: add a CSS rule (filter: invert(1)) to <div id="movie_player">
function applyInvert() {
  const playerDiv = document.getElementById('movie_player');
  if (!playerDiv) return;
  
  // Add a data-attribute so we can remove it later
  playerDiv.setAttribute('data-inverted', 'true');
  // Apply the invert filter
  playerDiv.style.filter = 'invert(1)';
  
  // Optional: Show a brief notification
  showNotification('Video colors inverted');
}

// Helper: remove the CSS invert filter
function removeInvert() {
  const playerDiv = document.getElementById('movie_player');
  if (!playerDiv) return;
  
  if (playerDiv.getAttribute('data-inverted') === 'true') {
    playerDiv.removeAttribute('data-inverted');
    playerDiv.style.filter = ''; // Clear inline filter
    
    // Optional: Show a brief notification
    showNotification('Video colors restored');
  }
}

// Optional: Show a brief visual notification
function showNotification(message) {
  // Remove existing notification if any
  const existing = document.getElementById('invert-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.id = 'invert-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 14px;
    font-family: Arial, sans-serif;
    z-index: 10000;
    transition: opacity 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 2 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 2000);
}

// On page load, check stored state and apply if needed
chrome.storage.local.get(['isInverted'], (result) => {
  if (result.isInverted) {
    // Add a small delay to ensure the player is loaded
    setTimeout(() => {
      applyInvert();
    }, 1000);
  }
});
