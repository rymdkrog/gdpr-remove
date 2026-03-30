const toggle = document.getElementById("toggle");
const status = document.getElementById("status");
const countEl = document.getElementById("count");
const resetBtn = document.getElementById("reset");

function updateStatus(enabled) {
  status.textContent = enabled ? "Aktiverad" : "Inaktiverad";
}

chrome.storage.local.get({ enabled: true, count: 0 }, (result) => {
  toggle.checked = result.enabled;
  updateStatus(result.enabled);
  countEl.textContent = result.count;
});

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ enabled });
  updateStatus(enabled);
});

resetBtn.addEventListener("click", () => {
  chrome.storage.local.set({ count: 0 });
  countEl.textContent = "0";
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.count) {
    countEl.textContent = changes.count.newValue;
  }
});
