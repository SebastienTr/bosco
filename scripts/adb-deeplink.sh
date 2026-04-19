#!/bin/bash
# Open a deep link in the Bosco Android app on the emulator.
# Usage: ./scripts/adb-deeplink.sh <url>
# Example: ./scripts/adb-deeplink.sh "https://www.sailbosco.com/auth/confirm?token_hash=pkce_abc123&type=magiclink"

if [ -z "$1" ]; then
  echo "Usage: $0 <url>"
  echo "Paste the magic link URL from your email."
  exit 1
fi

adb shell am start -W -a android.intent.action.VIEW \
  -c android.intent.category.BROWSABLE \
  -d "$1" \
  com.sailbosco.app
