# GDPR Remove

Chrome extension (Manifest V3) that opens a pre-filled GDPR Article 17 data erasure email when the user closes a tab for any configured site.

## Project Structure

```
manifest.json       # Extension manifest (Manifest V3)
sites.js            # Tab-close site configuration — add new tracked sites here
removal-sites.js    # On-demand removal sites (people-search, data brokers)
mailto.js           # Shared mailto URL builder (used by background.js and popup.js)
background.js       # Service worker: tab tracking, confirmation popup on tab close
popup.html/js/css   # Toolbar popup: toggle + on-demand removal site list
confirm.html/js/css # Confirmation popup shown on tab close
privacy-policy.html # Privacy policy for Chrome Web Store
icons/              # Extension icons (16, 48, 128px)
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

### Tab-close tracking (sites.js)
1. `sites.js` defines which domains to track, with their GDPR contact details
2. `background.js` tracks tabs matching any configured site via `chrome.tabs.onUpdated`
3. On tab close (`chrome.tabs.onRemoved`), shows a confirmation popup
4. If confirmed, opens a `mailto:` link — user must manually send from their mail client

### On-demand removal (removal-sites.js)
1. `removal-sites.js` defines Swedish people-search and data broker sites
2. The popup lists these sites with action buttons
3. Email-type sites open a pre-filled GDPR erasure `mailto:` link
4. URL-type sites (requiring BankID/web forms) open the removal page in a new tab

## Key Design Decisions

- **`mailto:` over SMTP**: No credentials needed, fully transparent, user has control over sending
- **Shared `mailto.js`**: Email template builder used by both background.js and popup.js
- **Two site lists**: `sites.js` for tab-close tracking, `removal-sites.js` for on-demand removal — different use cases, different data shapes

## Development

No build step. Load as unpacked extension:

1. `chrome://extensions` → Developer mode → Load unpacked
2. Select this folder
3. Test: open a configured site, close the tab, verify Gmail compose opens

## Permissions

- `tabs` — detect tab URLs and closures
- `storage` — persist toggle state
- `host_permissions` — one entry per configured site in `sites.js`, required for `chrome.tabs.query` URL filtering
