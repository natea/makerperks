#!/usr/bin/env bash
#
# One-shot setup for the MakerPerks contribute Worker: convert the GitHub App private
# key to PKCS#8, deploy, and set all five secrets. The values are NEVER committed —
# they're read from your environment or prompted for, and piped straight to wrangler.
#
# Prereqs (maintainer-only — see worker/README.md):
#   - The makerperks-bot GitHub App created + installed on natea/makerperks
#   - A Turnstile widget (site + secret keys)
#   - An Anthropic API key
#   - The App's private-key .pem downloaded
#
# Usage:
#   cd worker
#   # provide values via env (recommended) ...
#   export ANTHROPIC_API_KEY=sk-ant-...
#   export TURNSTILE_SECRET=0x...
#   export GH_APP_ID=123456
#   export GH_APP_INSTALLATION_ID=87654321
#   export GH_APP_PRIVATE_KEY_PEM=/path/to/makerperks-bot.private-key.pem
#   ./setup.sh
#   # ... or run with no env set and it prompts for each.
set -euo pipefail
cd "$(dirname "$0")"

prompt() { # prompt VAR "label" [secret]
  local var="$1" label="$2" secret="${3:-}"
  if [ -z "${!var:-}" ]; then
    if [ "$secret" = "secret" ]; then read -rs -p "$label: " "$var"; echo; else read -r -p "$label: " "$var"; fi
  fi
}

prompt ANTHROPIC_API_KEY "Anthropic API key (sk-ant-...)" secret
prompt TURNSTILE_SECRET "Turnstile SECRET key" secret
prompt GH_APP_ID "GitHub App ID (numeric)"
prompt GH_APP_INSTALLATION_ID "GitHub App installation id (numeric)"
prompt GH_APP_PRIVATE_KEY_PEM "Path to the App private-key .pem"

if [ ! -f "$GH_APP_PRIVATE_KEY_PEM" ]; then
  echo "✗ private key not found: $GH_APP_PRIVATE_KEY_PEM" >&2; exit 1
fi

# Convert PKCS#1 (GitHub default) → PKCS#8 (Web Crypto). No-op if already PKCS#8.
PK8="$(mktemp)"; trap 'rm -f "$PK8"' EXIT
if grep -q "BEGIN RSA PRIVATE KEY" "$GH_APP_PRIVATE_KEY_PEM"; then
  openssl pkcs8 -topk8 -nocrypt -in "$GH_APP_PRIVATE_KEY_PEM" -out "$PK8"
else
  cp "$GH_APP_PRIVATE_KEY_PEM" "$PK8"
fi

echo "→ Deploying Worker (creates it if new)…"
npx wrangler deploy

echo "→ Setting secrets…"
printf '%s' "$ANTHROPIC_API_KEY"      | npx wrangler secret put ANTHROPIC_API_KEY
printf '%s' "$TURNSTILE_SECRET"       | npx wrangler secret put TURNSTILE_SECRET
printf '%s' "$GH_APP_ID"              | npx wrangler secret put GH_APP_ID
printf '%s' "$GH_APP_INSTALLATION_ID" | npx wrangler secret put GH_APP_INSTALLATION_ID
npx wrangler secret put GH_APP_PRIVATE_KEY < "$PK8"

echo
echo "✓ Deployed + secrets set."
echo "  Smoke test:  curl https://makerperks-contribute.natejaune.workers.dev/"
echo "  Then set in the site's Pages build env:"
echo "    PUBLIC_CONTRIBUTE_API=https://makerperks-contribute.natejaune.workers.dev"
echo "    PUBLIC_TURNSTILE_SITE_KEY=<your Turnstile SITE key>"
