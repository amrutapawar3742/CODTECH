let currentTab = null;
let startTime = Date.now();

chrome.tabs.onActivated.addListener((activeInfo) => {
  trackTime();
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    currentTab = tab;
    startTime = Date.now();
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === "complete") {
    trackTime();
    currentTab = tab;
    startTime = Date.now();
  }
});

function trackTime() {
  if (!currentTab || !currentTab.url) return;

  const site = new URL(currentTab.url).hostname;
  const timeSpent = Date.now() - startTime;

  fetch("http://localhost:5000/save", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      site: site,
      time: timeSpent,
    }),
  }).catch((err) => console.log("Save failed:", err));
}
