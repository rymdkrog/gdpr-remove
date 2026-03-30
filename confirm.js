const params = new URLSearchParams(window.location.search);
const siteName = params.get("name");
const mailtoUrl = params.get("mailto");

document.getElementById("site-name").textContent = siteName;

document.getElementById("send").addEventListener("click", async () => {
  await chrome.tabs.create({ url: mailtoUrl });
  const result = await chrome.storage.local.get({ count: 0 });
  const current = typeof result.count === "number" ? result.count : 0;
  await chrome.storage.local.set({ count: current + 1 });
  window.close();
});

document.getElementById("cancel").addEventListener("click", () => {
  window.close();
});
