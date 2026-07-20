// content.js
// Runs on every YouTube watch page. Applies/removes the invert filter for
// THIS TAB ONLY. Each tab keeps its own state — toggling one tab never
// affects any other open YouTube tab.

if (!window.__ytInvertInitialized) {
  window.__ytInvertInitialized = true;

  // This tab's current desired state. Set from the initial state fetched
  // from the background script (keyed by this tab's id) and updated
  // whenever the popup/shortcut sends a new toggle message.
  let desiredState = false;

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'invertOn') {
      desiredState = true;
      applyInvert(true);
    } else if (msg.action === 'invertOff') {
      desiredState = false;
      removeInvert(true);
    } else if (msg.action === 'ping') {
      // Lets the popup/background confirm the content script is alive.
      sendResponse({ ok: true });
    }
    return true;
  });

  function applyInvert(notify) {
    const playerDiv = document.getElementById('movie_player');
    if (!playerDiv) return false;

    playerDiv.setAttribute('data-inverted', 'true');
    playerDiv.style.filter = 'invert(1)';

    if (notify) showNotification('Video colors inverted');
    return true;
  }

  function removeInvert(notify) {
    const playerDiv = document.getElementById('movie_player');
    if (!playerDiv) return false;

    playerDiv.removeAttribute('data-inverted');
    playerDiv.style.filter = '';

    if (notify) showNotification('Video colors restored');
    return true;
  }

  // Re-apply this tab's own desired state to whatever player is on screen
  // right now (used on SPA navigation and as a safety net — never reads
  // any other tab's state).
  function syncPlayer() {
    if (desiredState) {
      applyInvert(false);
    } else {
      removeInvert(false);
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

  // 1) On load, ask the background script for THIS TAB's stored state
  //    (background looks it up by sender.tab.id, so it's always correct
  //    per-tab even across many open YouTube tabs).
  chrome.runtime.sendMessage({ action: 'getInitialState' }, (response) => {
    if (chrome.runtime.lastError) return;
    desiredState = !!(response && response.isInverted);
    syncPlayer();
  });

  // 2) YouTube is a single-page app: clicking a video, autoplay, or Shorts
  //    doesn't reload the page, it swaps the player in place. Re-apply this
  //    tab's own state so it survives that swap without a manual reload.
  document.addEventListener('yt-navigate-finish', () => {
    setTimeout(syncPlayer, 300);
  });

  // 3) Fallback safety net: if the player node itself gets replaced
  //    (theater mode, ads, mini-player, etc.) re-apply this tab's state.
  const target = document.body;
  if (target) {
    const observer = new MutationObserver(() => {
      const playerDiv = document.getElementById('movie_player');
      if (!playerDiv) return;
      const isInverted = playerDiv.getAttribute('data-inverted') === 'true';
      if (desiredState && !isInverted) {
        applyInvert(false);
      } else if (!desiredState && isInverted) {
        removeInvert(false);
      }
    });
    observer.observe(target, { childList: true, subtree: true });
  }
}
