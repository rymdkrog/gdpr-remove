# GDPR Remove - Aftonbladet

Chrome extension (Manifest V3) that opens a pre-filled GDPR Article 17 data erasure email to Aftonbladet whenever the user closes an aftonbladet.se tab.

## Project Structure

```
manifest.json      # Extension manifest (Manifest V3)
background.js      # Service worker: tab tracking, debounce via chrome.alarms, mailto trigger
popup.html/js/css  # Toolbar popup: toggle + counter + reset
privacy-policy.html # Privacy policy for Chrome Web Store
icons/             # Extension icons (16, 48, 128px)
```

## How It Works

1. `background.js` tracks tabs showing aftonbladet.se via `chrome.tabs.onUpdated`
2. On tab close (`chrome.tabs.onRemoved`), schedules an email via `chrome.alarms` (2s debounce)
3. Multiple tab closures within the debounce window are batched into a single email
4. Opens a `mailto:annonsval@schibsted.se` link — user must manually send from their mail client

## Key Design Decisions

- **`chrome.alarms` over `setTimeout`**: Service workers can be killed at any time; alarms survive restarts
- **`chrome.storage.session` for pending count**: Prevents silent data loss on service worker termination
- **`mailto:` over SMTP**: No credentials needed, fully transparent, user has control over sending
- **Swedish only**: Target audience is Swedish Aftonbladet users

## Development

No build step. Load as unpacked extension:

1. `chrome://extensions` → Developer mode → Load unpacked
2. Select this folder
3. Test: open aftonbladet.se, close the tab, verify Gmail compose opens

## Permissions

- `tabs` — detect tab URLs and closures
- `storage` — persist toggle state and counter
- `alarms` — debounce timer that survives service worker restarts
- `host_permissions: *://*.aftonbladet.se/*` — required for `chrome.tabs.query` URL filtering
