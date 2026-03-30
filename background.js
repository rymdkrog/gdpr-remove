importScripts("sites.js");

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

function buildMailtoUrl(site) {
  const today = new Date().toISOString().split("T")[0];
  const subject =
    "Begäran om radering av personuppgifter enligt GDPR artikel 17";

  const body = `Till ${site.dataController} (org.nr ${site.orgNumber}),

Jag utövar härmed min rätt till radering av personuppgifter i enlighet med artikel 17 i EU:s dataskyddsförordning (GDPR).

Jag begär att ni utan onödig fördröjning raderar samtliga personuppgifter som ni har samlat in och behandlat om mig i samband med mitt besök på ${site.domain}, inklusive men inte begränsat till:

- Cookies och spårningsdata
- Annonsprofiler och riktad annonsdata
- Webbläsarhistorik och beteendedata
- Eventuella andra personuppgifter kopplade till min IP-adress eller enhet

Enligt artikel 17.1 har jag rätt till radering bland annat när:
(a) personuppgifterna inte längre är nödvändiga för de ändamål de samlades in
(d) personuppgifterna har behandlats på ett otillåtet sätt

Jag begär även att ni bekräftar raderingen skriftligen inom 30 dagar i enlighet med artikel 12.3 i GDPR.

Om ni anser att det finns skäl att avvisa denna begäran, ber jag er att specificera den juridiska grunden för detta.

Med vänliga hälsningar,
**[ANGE DITT NAMN]**

Datum: ${today}

---
Detta meddelande skickades automatiskt via tillägget "GDPR Remove".`;

  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

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
