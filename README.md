# GDPR Remove

Chrome extension that automatically opens a GDPR Article 17 (right to erasure) email request when you close a tab for a configured site.

## Why?

Some sites force you to either accept tracking cookies or pay to decline them. This extension helps you exercise your legal right under GDPR to request deletion of your personal data.

## Install

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select this folder

Make sure your browser handles `mailto:` links (e.g. configure Gmail as your mail handler in Chrome).

## Adding a New Site

1. Fork this repo
2. Edit `sites.js` and add an entry to the `SITES` array:

```js
{
  name: "Example Site",
  domain: "example.com",
  email: "gdpr@example.com",
  dataController: "Example AB",
  orgNumber: "123456-7890",
}
```

3. Add `"*://*.example.com/*"` to `host_permissions` in `manifest.json`
4. Open a PR with:
   - The site you're adding and why
   - Source for the GDPR contact email (e.g. link to their privacy policy)
   - The data controller name and org number

## How It Works

When you close a tab showing a configured site, the extension opens your email client with a pre-filled GDPR Article 17 erasure request addressed to that site's data protection contact. You review and send the email yourself — nothing is sent automatically.

## Disclaimer

This extension helps you exercise your legal rights under GDPR. You are responsible for ensuring your requests are legitimate. This is not legal advice.
