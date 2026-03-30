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
