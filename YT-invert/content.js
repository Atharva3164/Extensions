chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'invertOn') {
    applyInvert();
  } else if (msg.action === 'invertOff') {
    removeInvert();
  }
});

function applyInvert() {
  const playerDiv = document.getElementById('movie_player');
  if (!playerDiv) return;
  

  playerDiv.setAttribute('data-inverted', 'true');

  playerDiv.style.filter = 'invert(1)';
  

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


function showNotification(message) {

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
  

  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 2000);
}


chrome.storage.local.get(['isInverted'], (result) => {
  if (result.isInverted) {

    setTimeout(() => {
      applyInvert();
    }, 1000);
  }
});
