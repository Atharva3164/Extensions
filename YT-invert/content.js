// This content script runs on every YouTube page load.
// It listens for messages from popup.js.

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
  // Add a data-attribute or class so we can remove it later
  playerDiv.setAttribute('data-inverted', 'true');
  // Ensure we don’t keep appending the same style
  playerDiv.style.filter = 'invert(1)';
}

// Helper: remove the CSS invert filter
function removeInvert() {
  const playerDiv = document.getElementById('movie_player');
  if (!playerDiv) return;
  if (playerDiv.getAttribute('data-inverted') === 'true') {
    playerDiv.removeAttribute('data-inverted');
    playerDiv.style.filter = ''; // Clear inline filter
  }
}

// (Optional) If the user reloads the page and stored state is “inverted,” re-apply:
chrome.storage.local.get(['isInverted'], (result) => {
  if (result.isInverted) {
    applyInvert();
  }
});
