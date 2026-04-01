const params = new URLSearchParams(window.location.search);
const siteName = params.get("name");
const mailtoUrl = params.get("mailto");

document.getElementById("site-name").textContent = siteName;

document.getElementById("send").addEventListener("click", async () => {
  if (!mailtoUrl || !isMailtoUrl(mailtoUrl)) return;
  await chrome.tabs.create({ url: mailtoUrl });
  window.close();
});

document.getElementById("cancel").addEventListener("click", () => {
  window.close();
});
