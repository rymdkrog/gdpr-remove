# GDPR Remove

Chrome extension (Manifest V3) that opens a pre-filled GDPR Article 17 data erasure email when the user closes a tab for any configured site.

## Project Structure

```
manifest.json      # Extension manifest (Manifest V3)
sites.js           # Site configuration — add new sites here
background.js      # Service worker: tab tracking, debounce via chrome.alarms, mailto trigger
popup.html/js/css  # Toolbar popup: toggle + counter + reset
privacy-policy.html # Privacy policy for Chrome Web Store
icons/             # Extension icons (16, 48, 128px)
```

## Adding a New Site

Edit `sites.js` and add an entry to the `SITES` array:

```js
{
  name: "Example Site",
  domain: "example.com",
  email: "gdpr@example.com",
  dataController: "Example AB",
  orgNumber: "123456-7890",
}
```

Then add `"*://*.example.com/*"` to `host_permissions` in `manifest.json`.

## How It Works

1. `sites.js` defines which domains to track, with their GDPR contact details
2. `background.js` tracks tabs matching any configured site via `chrome.tabs.onUpdated`
3. On tab close (`chrome.tabs.onRemoved`), schedules an email via `chrome.alarms` (2s debounce)
4. Multiple tab closures within the debounce window are grouped per site — one email per site
5. Opens a `mailto:` link — user must manually send from their mail client

## Key Design Decisions

- **`chrome.alarms` over `setTimeout`**: Service workers can be killed at any time; alarms survive restarts
- **`chrome.storage.session` for pending state**: Prevents silent data loss on service worker termination
- **`mailto:` over SMTP**: No credentials needed, fully transparent, user has control over sending
- **Per-site grouping**: Closing 3 Aftonbladet tabs and 2 other-site tabs sends 2 separate emails

## Development

No build step. Load as unpacked extension:

1. `chrome://extensions` → Developer mode → Load unpacked
2. Select this folder
3. Test: open a configured site, close the tab, verify Gmail compose opens

## Permissions

- `tabs` — detect tab URLs and closures
- `storage` — persist toggle state and counter
- `alarms` — debounce timer that survives service worker restarts
- `host_permissions` — one entry per configured site, required for `chrome.tabs.query` URL filtering
