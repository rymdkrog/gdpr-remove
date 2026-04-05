const userNameInput = document.getElementById("user-name");
const subjectInput = document.getElementById("email-subject");
const bodyInput = document.getElementById("email-body");
const resetBtn = document.getElementById("reset-template");
const saveIndicator = document.getElementById("save-indicator");

let saveTimeout = null;
let debounceTimer = null;

function getDefaultBodyWithPlaceholders() {
  return buildDefaultBody("{{mottagare}}", "{{datum}}", "{{namn}}");
}

function showSaved() {
  saveIndicator.classList.remove("hidden");
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveIndicator.classList.add("hidden");
  }, 1500);
}

function save(updates) {
  chrome.storage.local.set(updates, showSaved);
}

// ---- Email template ----

function debounceSaveTemplate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const subject = subjectInput.value === DEFAULT_SUBJECT ? null : subjectInput.value;
    const body = bodyInput.value === getDefaultBodyWithPlaceholders() ? null : bodyInput.value;
    save({
      userName: userNameInput.value.trim(),
      emailTemplate: { subject, body },
    });
  }, 500);
}

userNameInput.addEventListener("input", debounceSaveTemplate);
subjectInput.addEventListener("input", debounceSaveTemplate);
bodyInput.addEventListener("input", debounceSaveTemplate);

resetBtn.addEventListener("click", () => {
  subjectInput.value = DEFAULT_SUBJECT;
  bodyInput.value = getDefaultBodyWithPlaceholders();
  save({ emailTemplate: { subject: null, body: null } });
});

// ---- Removal sites (visibility toggles) ----

let hiddenRemovalSites = [];

function renderDefaultRemovalSites() {
  const list = document.getElementById("default-removal-list");
  list.innerHTML = "";

  for (const site of REMOVAL_SITES) {
    const hidden = hiddenRemovalSites.includes(site.name);
    const li = document.createElement("li");
    li.className = "site-list-item" + (hidden ? " hidden-site" : "");

    const info = document.createElement("div");
    info.className = "site-info";

    const name = document.createElement("span");
    name.className = "site-name";
    name.textContent = site.name;

    const desc = document.createElement("span");
    desc.className = "site-desc";
    desc.textContent = site.description;

    info.appendChild(name);
    info.appendChild(desc);

    const toggleLabel = document.createElement("label");
    toggleLabel.className = "site-toggle";

    const toggleInput = document.createElement("input");
    toggleInput.type = "checkbox";
    toggleInput.checked = !hidden;
    toggleInput.addEventListener("change", () => {
      if (toggleInput.checked) {
        hiddenRemovalSites = hiddenRemovalSites.filter((n) => n !== site.name);
      } else {
        hiddenRemovalSites = [...hiddenRemovalSites, site.name];
      }
      save({ hiddenRemovalSites });
      renderDefaultRemovalSites();
    });

    const slider = document.createElement("span");
    slider.className = "toggle-slider";

    toggleLabel.appendChild(toggleInput);
    toggleLabel.appendChild(slider);

    li.appendChild(info);
    li.appendChild(toggleLabel);
    list.appendChild(li);
  }
}

// ---- Tracked sites ----

let hiddenTrackedSites = [];
let customTrackedSites = [];

function renderDefaultTrackedSites() {
  const list = document.getElementById("default-tracked-list");
  list.innerHTML = "";

  for (const site of SITES) {
    const hidden = hiddenTrackedSites.includes(site.name);
    const li = document.createElement("li");
    li.className = "site-list-item" + (hidden ? " hidden-site" : "");

    const info = document.createElement("div");
    info.className = "site-info";

    const name = document.createElement("span");
    name.className = "site-name";
    name.textContent = site.name;

    const desc = document.createElement("span");
    desc.className = "site-desc";
    desc.textContent = `${site.domain} — ${site.dataController}`;

    info.appendChild(name);
    info.appendChild(desc);

    const toggleLabel = document.createElement("label");
    toggleLabel.className = "site-toggle";

    const toggleInput = document.createElement("input");
    toggleInput.type = "checkbox";
    toggleInput.checked = !hidden;
    toggleInput.addEventListener("change", () => {
      if (toggleInput.checked) {
        hiddenTrackedSites = hiddenTrackedSites.filter((n) => n !== site.name);
      } else {
        hiddenTrackedSites = [...hiddenTrackedSites, site.name];
      }
      save({ hiddenTrackedSites });
      renderDefaultTrackedSites();
    });

    const slider = document.createElement("span");
    slider.className = "toggle-slider";

    toggleLabel.appendChild(toggleInput);
    toggleLabel.appendChild(slider);

    li.appendChild(info);
    li.appendChild(toggleLabel);
    list.appendChild(li);
  }
}

function renderCustomTrackedSites() {
  const list = document.getElementById("custom-tracked-list");
  const emptyMsg = document.getElementById("no-custom-tracked");
  list.innerHTML = "";

  emptyMsg.classList.toggle("hidden", customTrackedSites.length > 0);

  for (let i = 0; i < customTrackedSites.length; i++) {
    const site = customTrackedSites[i];
    const li = document.createElement("li");
    li.className = "site-list-item";

    const info = document.createElement("div");
    info.className = "site-info";

    const name = document.createElement("span");
    name.className = "site-name";
    name.textContent = site.domain;

    const desc = document.createElement("span");
    desc.className = "site-desc";
    desc.textContent = `${site.email} — ${site.dataController}`;

    info.appendChild(name);
    info.appendChild(desc);

    const actions = document.createElement("div");
    actions.className = "site-actions";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn danger";
    deleteBtn.textContent = "Ta bort";
    deleteBtn.addEventListener("click", async () => {
      const origin = `*://*.${site.domain}/*`;
      await chrome.permissions.remove({ origins: [origin] });
      customTrackedSites = customTrackedSites.filter((_, idx) => idx !== i);
      save({ customTrackedSites });
      renderCustomTrackedSites();
    });

    actions.appendChild(deleteBtn);
    li.appendChild(info);
    li.appendChild(actions);
    list.appendChild(li);
  }
}

// Add tracked site
document.getElementById("add-tracked-btn").addEventListener("click", async () => {
  const errorEl = document.getElementById("tracked-error");
  errorEl.classList.add("hidden");

  const domain = document.getElementById("tracked-domain").value.trim().toLowerCase();
  const email = document.getElementById("tracked-email").value.trim();
  const controller = document.getElementById("tracked-controller").value.trim();
  const org = document.getElementById("tracked-org").value.trim();

  if (!domain || !domain.includes(".")) {
    errorEl.textContent = "Ogiltig domän.";
    errorEl.classList.remove("hidden");
    return;
  }

  if (!isSafeEmail(email)) {
    errorEl.textContent = "Ogiltig e-postadress.";
    errorEl.classList.remove("hidden");
    return;
  }

  const newSite = {
    name: domain,
    domain,
    email,
    dataController: controller,
    orgNumber: org,
  };

  if (!isValidTrackedSite(newSite)) {
    errorEl.textContent = "Kontrollera att alla fält är korrekt ifyllda.";
    errorEl.classList.remove("hidden");
    return;
  }

  // Request host permission
  const origin = `*://*.${domain}/*`;
  let granted;
  try {
    granted = await chrome.permissions.request({ origins: [origin] });
  } catch {
    errorEl.textContent = "Kunde inte begära behörighet.";
    errorEl.classList.remove("hidden");
    return;
  }

  if (!granted) {
    errorEl.textContent = "Behörighet nekades av webbläsaren.";
    errorEl.classList.remove("hidden");
    return;
  }

  customTrackedSites = [...customTrackedSites, newSite];
  save({ customTrackedSites });
  renderCustomTrackedSites();

  // Clear form
  document.getElementById("tracked-domain").value = "";
  document.getElementById("tracked-email").value = "";
  document.getElementById("tracked-controller").value = "";
  document.getElementById("tracked-org").value = "";
});

// ---- IMY complaint ----

const imySiteSelect = document.getElementById("imy-site");
const emailSites = REMOVAL_SITES.filter((s) => s.type === "email");

for (const site of emailSites) {
  const option = document.createElement("option");
  option.value = site.name;
  option.textContent = site.name;
  imySiteSelect.appendChild(option);
}

document.getElementById("imy-btn").addEventListener("click", () => {
  const selected = emailSites.find((s) => s.name === imySiteSelect.value);
  if (!selected) return;

  const templateSettings = {
    userName: userNameInput.value.trim(),
  };
  const imyUrl = buildImyComplaintUrl(selected, templateSettings);
  if (isMailtoUrl(imyUrl)) {
    chrome.tabs.create({ url: imyUrl });
  }
});

// ---- Banner removal toggle ----

const bannerRemovalToggle = document.getElementById("banner-removal-toggle");

bannerRemovalToggle.addEventListener("change", () => {
  save({ bannerRemovalEnabled: bannerRemovalToggle.checked });
});

// ---- Load everything ----

getSettings().then((settings) => {
  userNameInput.value = settings.userName;
  subjectInput.value = settings.emailTemplate.subject || DEFAULT_SUBJECT;
  bodyInput.value = settings.emailTemplate.body || getDefaultBodyWithPlaceholders();

  bannerRemovalToggle.checked = settings.bannerRemovalEnabled;

  hiddenRemovalSites = settings.hiddenRemovalSites;
  hiddenTrackedSites = settings.hiddenTrackedSites;
  customTrackedSites = settings.customTrackedSites;

  renderDefaultRemovalSites();
  renderDefaultTrackedSites();
  renderCustomTrackedSites();
});
