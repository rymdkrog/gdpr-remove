/**
 * Shared settings module.
 * Loaded by popup.js, background.js, and options.js.
 */

const SETTINGS_DEFAULTS = {
  enabled: true,
  progress: {},
  userName: "",
  emailTemplate: {
    subject: null,
    body: null,
  },
  hiddenRemovalSites: [],
  hiddenTrackedSites: [],
  customTrackedSites: [],
};

async function getSettings() {
  const result = await chrome.storage.local.get(SETTINGS_DEFAULTS);
  return result;
}

function getTemplateSettings(settings) {
  return {
    userName: settings.userName || "",
    subject: settings.emailTemplate.subject,
    body: settings.emailTemplate.body,
  };
}

// --- Validation helpers ---

function isMailtoUrl(url) {
  try {
    return new URL(url).protocol === "mailto:";
  } catch {
    return false;
  }
}

function isHttpsUrl(url) {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeEmail(email) {
  return typeof email === "string" && !(/[?&#]/).test(email) && email.includes("@");
}

function isValidTrackedSite(site) {
  if (!site || typeof site !== "object") return false;
  return typeof site.name === "string" && site.name &&
    typeof site.domain === "string" && site.domain &&
    isSafeEmail(site.email) &&
    typeof site.dataController === "string" &&
    typeof site.orgNumber === "string";
}

// --- Effective site lists ---

function getEffectiveRemovalSites(settings) {
  const hidden = new Set(settings.hiddenRemovalSites);
  return REMOVAL_SITES.filter((site) => !hidden.has(site.name));
}

function getEffectiveTrackedSites(settings) {
  const hidden = new Set(settings.hiddenTrackedSites);
  const defaults = SITES.filter((site) => !hidden.has(site.name));
  const validCustom = settings.customTrackedSites.filter(isValidTrackedSite);
  return [...defaults, ...validCustom];
}
