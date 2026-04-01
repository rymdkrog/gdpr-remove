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

// Progress tracking
function updateProgressBadge(badgeEl, items, progress) {
  const done = items.filter((item) => progress[item.name]).length;
  badgeEl.textContent = `${done}/${items.length}`;
  badgeEl.classList.toggle("all-done", done === items.length);
}

function saveProgress(progress) {
  chrome.storage.local.set({ progress });
}

chrome.storage.local.get({ progress: {} }, (result) => {
  const progress = result.progress;

  renderRemovalList(progress);
  renderPreventionList(progress);
});

function renderRemovalList(progress) {
  const list = document.getElementById("removal-list");
  const badge = document.getElementById("removal-progress");

  for (const site of REMOVAL_SITES) {
    const li = document.createElement("li");
    li.className = "removal-item";
    if (progress[site.name]) {
      li.classList.add("done");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "progress-check";
    checkbox.checked = !!progress[site.name];
    checkbox.addEventListener("change", () => {
      const updated = { ...progress, [site.name]: checkbox.checked };
      Object.assign(progress, updated);
      li.classList.toggle("done", checkbox.checked);
      saveProgress(updated);
      updateProgressBadge(badge, REMOVAL_SITES, updated);
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
        const mailtoUrl = buildMailtoUrl(site);
        chrome.tabs.create({ url: mailtoUrl });
      } else {
        chrome.tabs.create({ url: site.url });
      }
    });

    li.appendChild(checkbox);
    li.appendChild(info);
    li.appendChild(btn);
    list.appendChild(li);
  }

  updateProgressBadge(badge, REMOVAL_SITES, progress);
}

function renderPreventionList(progress) {
  const list = document.getElementById("prevention-list");
  const badge = document.getElementById("prevention-progress");

  for (const site of PREVENTION_SITES) {
    const li = document.createElement("li");
    li.className = "prevention-item";
    if (progress[site.name]) {
      li.classList.add("done");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "progress-check";
    checkbox.checked = !!progress[site.name];
    checkbox.addEventListener("change", () => {
      const updated = { ...progress, [site.name]: checkbox.checked };
      Object.assign(progress, updated);
      li.classList.toggle("done", checkbox.checked);
      saveProgress(updated);
      updateProgressBadge(badge, PREVENTION_SITES, updated);
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
      chrome.tabs.create({ url: site.url });
    });

    li.appendChild(checkbox);
    li.appendChild(info);
    li.appendChild(btn);
    list.appendChild(li);
  }

  updateProgressBadge(badge, PREVENTION_SITES, progress);
}

document.getElementById("kofi-link").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "https://ko-fi.com/rymdkrog" });
});
