/**
 * Content script: removes cookie consent banners on tracked sites.
 * Injected only on domains listed in manifest.json content_scripts.
 */

(function () {
  const BANNER_SELECTORS = [
    // Sourcepoint
    'div[id^="sp_message_container"]',
    // CookieBot
    "#CybotCookiebotDialog",
    "#CybotCookiebotDialogBodyUnderlay",
    // OneTrust
    "#onetrust-consent-sdk",
    // Quantcast
    "#qc-cmp2-container",
    // Didomi
    "#didomi-popup",
    "#didomi-popup-backdrop",
    "#didomi-host",
    // TrustArc
    "#truste-consent-track",
    ".truste_box_overlay",
    // Cookie Script
    "#cookiescript_injected",
    // Complianz
    "#cmplz-cookiebanner-container",
    // Generic
    "#cookie-law-info-bar",
    "#cookie-notice",
    "#cookie-consent",
  ];

  function removeBanners() {
    let removed = false;
    for (const selector of BANNER_SELECTORS) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        el.remove();
        removed = true;
      }
    }
    return removed;
  }

  function restoreScrolling() {
    // Cookie walls typically set overflow:hidden and/or position:fixed on body/html
    const bodyStyle = getComputedStyle(document.body);
    const htmlStyle = getComputedStyle(document.documentElement);

    if (bodyStyle.overflow === "hidden") {
      document.body.style.setProperty("overflow", "auto", "important");
    }
    if (htmlStyle.overflow === "hidden") {
      document.documentElement.style.setProperty("overflow", "auto", "important");
    }
    if (bodyStyle.position === "fixed") {
      document.body.style.setProperty("position", "static", "important");
    }
  }

  function run() {
    if (removeBanners()) {
      restoreScrolling();
      return true;
    }
    return false;
  }

  chrome.storage.local.get({ bannerRemovalEnabled: true }, (result) => {
    if (!result.bannerRemovalEnabled) return;

    // Try immediately
    if (run()) return;

    // Watch for dynamically injected banners (max 5s)
    const observer = new MutationObserver(() => {
      if (run()) {
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => observer.disconnect(), 5000);
  });
})();
