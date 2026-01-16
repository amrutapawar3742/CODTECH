let activeTab = null;
let startTime = null;

const productiveSites = ["leetcode.com", "github.com", "stackoverflow.com"];
const unproductiveSites = ["facebook.com", "instagram.com", "youtube.com"];

function getCategory(url) {
    if (productiveSites.some(site => url.includes(site))) return "productive";
    if (unproductiveSites.some(site => url.includes(site))) return "unproductive";
    return "neutral";
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    if (activeTab && startTime) {
        saveTime();
    }

    let tab = await chrome.tabs.get(activeInfo.tabId);
    activeTab = tab.url;
    startTime = Date.now();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        if (activeTab && startTime) {
            saveTime();
        }
        activeTab = tab.url;
        startTime = Date.now();
    }
});

function saveTime() {
    let timeSpent = Math.floor((Date.now() - startTime) / 1000);
    let category = getCategory(activeTab);

    fetch("http://127.0.0.1:5000/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            website: activeTab,
            time: timeSpent,
            category: category
        })
    });

    startTime = Date.now();
}
