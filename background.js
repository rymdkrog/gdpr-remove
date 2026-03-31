importScripts("sites.js");
importScripts("mailto.js");

// Map of tabId → site config for tracked tabs
const trackedTabs = new Map();

function matchSite(url) {
  if (!url) return null;
  for (const site of SITES) {
    const pattern = new RegExp(
      `^https?://([^/]*\\.)?${site.domain.replace(".", "\\.")}`,
      "i",
    );
    if (pattern.test(url)) return site;
  }
  return null;
}

function buildQueryPatterns() {
  return SITES.map((site) => `*://*.${site.domain}/*`);
}

async function initTracking() {
  const tabs = await chrome.tabs.query({ url: buildQueryPatterns() });
  for (const tab of tabs) {
    const site = matchSite(tab.url);
    if (site) {
      trackedTabs.set(tab.id, site);
    }
  }
}

// buildMailtoUrl is loaded from mailto.js via importScripts

async function isEnabled() {
  const result = await chrome.storage.local.get({ enabled: true });
  return result.enabled;
}

async function showConfirmation(site) {
  const enabled = await isEnabled();
  if (!enabled) return;

  const mailtoUrl = buildMailtoUrl(site);
  const confirmUrl =
    chrome.runtime.getURL("confirm.html") +
    `?name=${encodeURIComponent(site.name)}` +
    `&mailto=${encodeURIComponent(mailtoUrl)}`;

  await chrome.windows.create({
    url: confirmUrl,
    type: "popup",
    width: 380,
    height: 180,
    focused: true,
  });
}

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const site = matchSite(changeInfo.url);
    if (site) {
      trackedTabs.set(tab.id, site);
    } else {
      trackedTabs.delete(tab.id);
    }
  } else if (changeInfo.status === "complete") {
    const site = matchSite(tab.url);
    if (site) {
      trackedTabs.set(tab.id, site);
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  const site = trackedTabs.get(tabId);
  if (site) {
    trackedTabs.delete(tabId);
    showConfirmation(site);
  }
});

chrome.runtime.onStartup.addListener(initTracking);
chrome.runtime.onInstalled.addListener(initTracking);
