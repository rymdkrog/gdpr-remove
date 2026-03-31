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

// Render on-demand removal site list
const removalList = document.getElementById("removal-list");

for (const site of REMOVAL_SITES) {
  const li = document.createElement("li");
  li.className = "removal-item";

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

  li.appendChild(info);
  li.appendChild(btn);
  removalList.appendChild(li);
}
