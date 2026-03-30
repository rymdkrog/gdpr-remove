const AFTONBLADET_PATTERN = /^https?:\/\/([^/]*\.)?aftonbladet\.se/i;
const DEBOUNCE_ALARM = "gdpr-remove-debounce";
const DEBOUNCE_MS = 2000;
const MAILTO_ADDRESS = "annonsval@schibsted.se";

const trackedTabs = new Set();

function isAftonbladet(url) {
  return url && AFTONBLADET_PATTERN.test(url);
}

async function initTracking() {
  const tabs = await chrome.tabs.query({ url: "*://*.aftonbladet.se/*" });
  for (const tab of tabs) {
    trackedTabs.add(tab.id);
  }
}

function buildMailtoUrl(count) {
  const today = new Date().toISOString().split("T")[0];
  const subject = "Begäran om radering av personuppgifter enligt GDPR artikel 17";

  const visitNote =
    count > 1
      ? `Under denna session besökte jag er sajt ${count} gånger.\n\n`
      : "";

  const body = `Till Schibsted News Media AB (org.nr 559343-3666),

Jag utövar härmed min rätt till radering av personuppgifter i enlighet med artikel 17 i EU:s dataskyddsförordning (GDPR).

${visitNote}Jag begär att ni utan onödig fördröjning raderar samtliga personuppgifter som ni har samlat in och behandlat om mig i samband med mitt besök på aftonbladet.se, inklusive men inte begränsat till:

- Cookies och spårningsdata
- Annonsprofiler och riktad annonsdata
- Webbläsarhistorik och beteendedata
- Eventuella andra personuppgifter kopplade till min IP-adress eller enhet

Enligt artikel 17.1 har jag rätt till radering bland annat när:
(a) personuppgifterna inte längre är nödvändiga för de ändamål de samlades in
(d) personuppgifterna har behandlats på ett otillåtet sätt

Jag begär även att ni bekräftar raderingen skriftligen inom 30 dagar i enlighet med artikel 12.3 i GDPR.

Om ni anser att det finns skäl att avvisa denna begäran, ber jag er specificera den juridiska grunden för detta.

Med vänliga hälsningar,
[Ange ditt namn]

Datum: ${today}

---
Detta meddelande skickades automatiskt via tillägget "GDPR Remove".`;

  return `mailto:${MAILTO_ADDRESS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function isEnabled() {
  const result = await chrome.storage.local.get({ enabled: true });
  return result.enabled;
}

async function incrementCounter() {
  const result = await chrome.storage.local.get({ count: 0 });
  const current = typeof result.count === "number" ? result.count : 0;
  await chrome.storage.local.set({ count: current + 1 });
}

async function getPendingCount() {
  const result = await chrome.storage.session.get({ pendingCount: 0 });
  return typeof result.pendingCount === "number" ? result.pendingCount : 0;
}

async function setPendingCount(count) {
  await chrome.storage.session.set({ pendingCount: count });
}

async function flushPending() {
  const count = await getPendingCount();
  await setPendingCount(0);

  if (count === 0) return;

  const enabled = await isEnabled();
  if (!enabled) return;

  try {
    const mailtoUrl = buildMailtoUrl(count);
    await chrome.tabs.create({ url: mailtoUrl });
    await incrementCounter();
  } catch (_err) {
    // Restore count so it can be retried
    await setPendingCount(count);
  }
}

async function scheduleEmail() {
  const current = await getPendingCount();
  await setPendingCount(current + 1);

  await chrome.alarms.clear(DEBOUNCE_ALARM);
  await chrome.alarms.create(DEBOUNCE_ALARM, {
    delayInMinutes: DEBOUNCE_MS / 60000,
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === DEBOUNCE_ALARM) {
    flushPending();
  }
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    if (isAftonbladet(changeInfo.url)) {
      trackedTabs.add(tab.id);
    } else {
      trackedTabs.delete(tab.id);
    }
  } else if (changeInfo.status === "complete" && isAftonbladet(tab.url)) {
    trackedTabs.add(tab.id);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (trackedTabs.has(tabId)) {
    trackedTabs.delete(tabId);
    scheduleEmail();
  }
});

chrome.runtime.onStartup.addListener(initTracking);
chrome.runtime.onInstalled.addListener(initTracking);
