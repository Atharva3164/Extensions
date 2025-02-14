chrome.storage.local.get(["invertState"], (data) => {
    let isInverted = data.invertState ?? false; // Use default if undefined
    let embed = document.querySelector("embed");
    if (embed) embed.style.filter = isInverted ? "invert(1)" : "none";
});
