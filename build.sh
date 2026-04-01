#!/usr/bin/env bash
set -euo pipefail

VERSION=$(grep '"version"' manifest.json | sed 's/.*: "\(.*\)".*/\1/')
OUT="gdpr-remove-v${VERSION}.zip"

rm -f "$OUT"

zip -r "$OUT" \
  manifest.json \
  background.js \
  sites.js \
  removal-sites.js \
  mailto.js \
  settings.js \
  popup.html \
  popup.js \
  popup.css \
  options.html \
  options.js \
  options.css \
  confirm.html \
  confirm.js \
  confirm.css \
  privacy-policy.html \
  icons/

echo "Created $OUT"
