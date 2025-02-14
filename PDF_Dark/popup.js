document.addEventListener("DOMContentLoaded", () => {
    let toggleSwitch = document.getElementById("toggleSwitch");

    chrome.storage.local.get(["invertState"], (data) => {
        toggleSwitch.checked = data.invertState || false;
    });

    toggleSwitch.addEventListener("change", () => {
        let isChecked = toggleSwitch.checked;
        chrome.storage.local.set({ invertState: isChecked });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: (invert) => {
                        let embed = document.querySelector("embed");
                        if (embed) embed.style.filter = invert ? "invert(1)" : "none";
                    },
                    args: [isChecked]
                });
            }
        });
    });
});
