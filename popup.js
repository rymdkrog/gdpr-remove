const toggle = document.getElementById("toggle");
const status = document.getElementById("status");

function updateStatus(enabled) {
  status.textContent = enabled ? "Aktiverad" : "Inaktiverad";
}

chrome.storage.local.get({ enabled: true }, (result) => {
  toggle.checked = result.enabled;
  updateStatus(result.enabled);
});

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ enabled });
  updateStatus(enabled);
});

// Populate configured sites tooltip
const sitesList = document.getElementById("sites-list");
sitesList.textContent = SITES.map((s) => s.name).join(", ");

// Prevention sites data
const PREVENTION_SITES = [
  {
    name: "SPAR — Reklamspärr",
    url: "https://www.statenspersonadressregister.se/master/start/personuppgifter/behandling-av-personuppgifter/e-tjaenst-reklamspaerr/",
    description: "Spärra din adress i Statens personadressregister. Stoppar utlämnande till personsök och direktreklam.",
  },
  {
    name: "NIX Telefon",
    url: "https://www.nixtelefon.org/jag-vill",
    description: "Slipp oönskade telefonsamtal i marknadsföringssyfte.",
  },
  {
    name: "NIX Adresserat",
    url: "https://www.swedma.se/reklamsparr/nix-adresserat/nix-adresserat-konsumentinformation/",
    description: "Slipp adresserad direktreklam per post.",
  },
];

// Progress tracking — use a mutable ref object so closures share state
const progressRef = { current: {} };

function updateProgressBadge(badgeEl, items) {
  const done = items.filter((item) => progressRef.current[item.name]).length;
  badgeEl.textContent = `${done}/${items.length}`;
  badgeEl.classList.toggle("all-done", done === items.length);
}

function saveProgress() {
  chrome.storage.local.set({ progress: progressRef.current });
}

// Load settings and render
let cachedTemplateSettings = null;

getSettings().then((settings) => {
  progressRef.current = settings.progress;
  cachedTemplateSettings = getTemplateSettings(settings);

  renderRemovalList(getEffectiveRemovalSites(settings), cachedTemplateSettings);
  renderPreventionList();
});

function renderRemovalList(sites, templateSettings) {
  const list = document.getElementById("removal-list");
  const badge = document.getElementById("removal-progress");

  for (const site of sites) {
    const li = document.createElement("li");
    li.className = "removal-item";
    if (progressRef.current[site.name]) {
      li.classList.add("done");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "progress-check";
    checkbox.checked = !!progressRef.current[site.name];
    checkbox.addEventListener("change", () => {
      progressRef.current = { ...progressRef.current, [site.name]: checkbox.checked };
      li.classList.toggle("done", checkbox.checked);
      saveProgress();
      updateProgressBadge(badge, sites);
    });

    const info = document.createElement("div");
    info.className = "removal-info";

    const name = document.createElement("span");
    name.className = "removal-name";
    name.textContent = site.name;

    const desc = document.createElement("span");
    desc.className = "removal-desc";
    desc.textContent = site.description;

    info.appendChild(name);
    info.appendChild(desc);

    const btn = document.createElement("button");
    btn.className = site.type === "email" ? "removal-btn email" : "removal-btn url";
    btn.textContent = site.type === "email" ? "Skicka" : "Öppna";

    btn.addEventListener("click", () => {
      if (site.type === "email") {
        const mailtoUrl = buildMailtoUrl(site, templateSettings);
        if (isMailtoUrl(mailtoUrl)) {
          chrome.tabs.create({ url: mailtoUrl });
        }
      } else if (isHttpsUrl(site.url)) {
        chrome.tabs.create({ url: site.url });
      }
    });

    li.appendChild(checkbox);
    li.appendChild(info);
    li.appendChild(btn);
    list.appendChild(li);
  }

  updateProgressBadge(badge, sites);
}

function renderPreventionList() {
  const list = document.getElementById("prevention-list");
  const badge = document.getElementById("prevention-progress");

  for (const site of PREVENTION_SITES) {
    const li = document.createElement("li");
    li.className = "prevention-item";
    if (progressRef.current[site.name]) {
      li.classList.add("done");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "progress-check";
    checkbox.checked = !!progressRef.current[site.name];
    checkbox.addEventListener("change", () => {
      progressRef.current = { ...progressRef.current, [site.name]: checkbox.checked };
      li.classList.toggle("done", checkbox.checked);
      saveProgress();
      updateProgressBadge(badge, PREVENTION_SITES);
    });

    const info = document.createElement("div");
    info.className = "prevention-info";

    const name = document.createElement("span");
    name.className = "prevention-name";
    name.textContent = site.name;

    const desc = document.createElement("span");
    desc.className = "prevention-desc";
    desc.textContent = site.description;

    info.appendChild(name);
    info.appendChild(desc);

    const btn = document.createElement("button");
    btn.className = "removal-btn url";
    btn.textContent = "Öppna";
    btn.addEventListener("click", () => {
      if (isHttpsUrl(site.url)) {
        chrome.tabs.create({ url: site.url });
      }
    });

    li.appendChild(checkbox);
    li.appendChild(info);
    li.appendChild(btn);
    list.appendChild(li);
  }

  updateProgressBadge(badge, PREVENTION_SITES);
}

// Copy email template
document.getElementById("copy-template-btn").addEventListener("click", async () => {
  const btn = document.getElementById("copy-template-btn");
  const settings = cachedTemplateSettings || getTemplateSettings(await getSettings());
  const today = new Date().toISOString().split("T")[0];
  const userName = settings.userName || "[ANGE DITT NAMN]";
  const body = settings.body
    ? settings.body
        .replace("{{mottagare}}", "[MOTTAGARE]")
        .replace("{{datum}}", today)
        .replace("{{namn}}", userName)
    : buildDefaultBody("[MOTTAGARE]", today, settings.userName);

  await navigator.clipboard.writeText(body);
  btn.textContent = "Kopierad!";
  setTimeout(() => {
    btn.textContent = "Kopiera e-postmall";
  }, 1500);
});

// Settings button
document.getElementById("settings-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
});

document.getElementById("kofi-link").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "https://ko-fi.com/rymdkrog" });
});
