# Story 6.A3: Play Store Submission & Android Listing

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a sailor on Android,
I want to find and download Bosco on the Google Play Store,
So that I can install it without technical knowledge.

## Acceptance Criteria

1. **Given** the Android app from Stories 6.1, 6.2, and 6.A4 is built and tested, **When** submitted to Google Play, **Then** a Google Play Developer account is created ($25 one-time fee).

2. **Given** a release keystore is created, **When** the release AAB is built, **Then** it is signed with the release key (not the debug keystore).

3. **Given** the signed AAB is uploaded to Play Console, **When** Google enrolls the app in Play App Signing, **Then** the **Play App Signing key** SHA256 fingerprint is retrieved from Console and added to `public/.well-known/assetlinks.json` alongside the existing debug fingerprint.

4. **Given** the store listing is created, **When** a user searches "sailing voyage tracker" or "Bosco" on Play Store, **Then** the listing shows: app name, short description, full description, screenshots (phone), feature graphic, and app icon.

5. **Given** the store listing, **When** reviewing keywords, **Then** the description is optimized for: "sailing", "voyage tracker", "GPS track", "logbook", "Navionics".

6. **Given** the data safety section, **When** filled out, **Then** it accurately declares: email collection (authentication), user profile data, GPX file processing, Sentry error reporting, no ads, no location tracking, no data sharing with third parties.

7. **Given** the content rating questionnaire (IARC), **When** completed, **Then** the app receives "Everyone" / PEGI 3 rating (no violent/sexual/gambling content).

8. **Given** the Internal Testing track, **When** an AAB is uploaded, **Then** at minimum 1 tester (Seb) can install from Play Store and validate the full flow: install → open → magic link auth → import GPX → view voyage.

9. **Given** internal testing passes, **When** promoted to Production track, **Then** the app is publicly available on Google Play Store.

## Tasks / Subtasks

- [x] Task 1: Create release keystore and configure signing (AC: #2)
  - [x] 1.1 Generate release keystore: `keytool -genkey -v -keystore bosco-release.keystore -alias bosco -keyalg RSA -keysize 2048 -validity 10000`
  - [x] 1.2 Store keystore securely outside the repo (e.g., `~/.android/bosco-release.keystore`) — **NEVER commit keystore to git**
  - [x] 1.3 Add `signingConfigs` block in `android/app/build.gradle` for release signing (using env vars or `keystore.properties`)
  - [x] 1.4 Add `keystore.properties` to `.gitignore`
  - [x] 1.5 Create `keystore.properties.example` with placeholder values for documentation

- [x] Task 2: Configure version and build for release (AC: #2)
  - [x] 2.1 Confirm `versionCode 1` and `versionName "1.0"` in `android/app/build.gradle` (already set)
  - [x] 2.2 Ensure `minSdkVersion 22`, `targetSdkVersion 34`, `compileSdkVersion 34` are appropriate (already set in `variables.gradle`)
  - [x] 2.3 Run `npm run build && npx cap sync` to ensure latest web assets are synced
  - [x] 2.4 Build release AAB: `cd android && ./gradlew bundleRelease`
  - [x] 2.5 Verify AAB is generated at `android/app/build/outputs/bundle/release/app-release.aab`

- [x] Task 3: Update `assetlinks.json` with production fingerprint (AC: #3)
  - [x] 3.1 After uploading AAB to Play Console, go to: **Play Console → Release → Setup → App signing → "App signing key certificate" → SHA-256 certificate fingerprint**
  - [x] 3.2 Add production fingerprint to `public/.well-known/assetlinks.json` `sha256_cert_fingerprints` array (keep debug fingerprint too)
  - [ ] 3.3 Deploy to Vercel (push to main) so updated `assetlinks.json` is live before production release
  - [ ] 3.4 Verify: `curl -I https://www.sailbosco.com/.well-known/assetlinks.json` → 200, `application/json`

- [x] Task 4: Google Play Console setup (AC: #1)
  - [x] 4.1 Create Google Play Developer account at https://play.google.com/console/signup ($25 one-time)
  - [x] 4.2 Complete developer identity verification (ID + address — can take 2-5 days)
  - [x] 4.3 Create new app → "Bosco" → Free → App category: Travel & Local

- [ ] Task 5: Store listing content (AC: #4, #5)
  - [ ] 5.1 App name: "Bosco — Sailing Voyage Tracker"
  - [ ] 5.2 Short description (80 chars max): "Track your sailing voyages on a map. Import from Navionics. Share your story."
  - [ ] 5.3 Full description (4000 chars max) — keyword-rich, covering: GPX import, voyage tracking, animated map playback, stopover detection, journal entries, photo markers, public sharing, Navionics integration
  - [ ] 5.4 Take phone screenshots (min 2, max 8) of key flows: landing page, voyage map with track, import preview, stopover panel, public voyage page
  - [ ] 5.5 Create feature graphic (1024×500 px) — app name + tagline + map visual
  - [ ] 5.6 App icon is already configured via `@mipmap/ic_launcher` in AndroidManifest.xml — verify it meets Play Store requirements (512×512 px PNG, no transparency)

- [ ] Task 6: Data safety section (AC: #6)
  - [ ] 6.1 Data collected: Email address (authentication via magic link)
  - [ ] 6.2 Data collected: Name/username, boat details (optional profile info)
  - [ ] 6.3 Data collected: Photos (user-uploaded journal attachments)
  - [ ] 6.4 Data collected: Files (GPX track files — processed client-side, GeoJSON stored server-side)
  - [ ] 6.5 Data collected: Crash logs and diagnostics (Sentry — `@sentry/nextjs`)
  - [ ] 6.6 Data NOT collected: Precise location (no GPS tracking in the app — GPX files are imported, not captured)
  - [ ] 6.7 Data NOT collected: No ads, no ad identifiers, no analytics tracking
  - [ ] 6.8 Data sharing: No data shared with third parties
  - [ ] 6.9 Data deletion: Users can delete their account and all associated data (FR-67, Story 5-5)
  - [ ] 6.10 Privacy policy URL: `https://www.sailbosco.com/legal/privacy`

- [ ] Task 7: Content rating & target audience (AC: #7)
  - [ ] 7.1 Complete IARC content rating questionnaire — no violence, no sexual content, no gambling, no controlled substances, no user-to-user communication (journal entries are per-user, not social)
  - [ ] 7.2 Expected rating: Everyone / PEGI 3 / USK 0
  - [ ] 7.3 Target audience: 18+ (general audience, not designed for children)

- [ ] Task 8: Internal testing release (AC: #8)
  - [ ] 8.1 Upload signed AAB to Internal Testing track
  - [ ] 8.2 Create internal testing group, add Seb's Google account as tester
  - [ ] 8.3 Accept tester invitation via email link
  - [ ] 8.4 Install from Play Store (Internal Testing) on emulator or device
  - [ ] 8.5 Validate: app opens → loads sailbosco.com → magic link auth works (deep link opens in app) → GPX share from file manager works → voyage displays correctly

- [ ] Task 9: Production release (AC: #9)
  - [ ] 9.1 After internal testing passes, promote release to Production track
  - [ ] 9.2 Set rollout percentage (100% — solo developer, no staged rollout needed)
  - [ ] 9.3 Wait for Google review (typically 1-3 days for new apps, can take up to 7)
  - [ ] 9.4 Verify app is searchable on Play Store after approval

## Dev Notes

### Nature of This Story

This story is **primarily manual/configuration work** with Play Console — not a heavy coding story. The code changes are minimal:
1. Release signing config in `build.gradle`
2. Production fingerprint added to `assetlinks.json`
3. Gitignore updates

The bulk of the work is in Play Console: account setup, store listing, data safety, content rating, screenshot capture, and release management.

### Architecture: Capacitor Remote URL = Zero Store Updates

The Capacitor config wraps `https://www.sailbosco.com` — the app is a native shell loading the live web app. **Any code change deployed to Vercel automatically updates the app experience without a Play Store update.** The only reason to push a new AAB is for:
- Native code changes (AndroidManifest, Java plugins, Capacitor plugins)
- Version bumps required by Play Store policy
- New native permissions

This means store review risk is minimal — the app content is already live and working.

[Source: capacitor.config.ts — `server.url: 'https://www.sailbosco.com'`]

### Release Signing — `build.gradle` Configuration

Current state: no signing config for release builds. Add a `keystore.properties`-based approach:

**`android/keystore.properties`** (gitignored):
```properties
storeFile=/Users/seb/.android/bosco-release.keystore
storePassword=YOUR_PASSWORD
keyAlias=bosco
keyPassword=YOUR_PASSWORD
```

**`android/app/build.gradle`** additions:
```groovy
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config ...

    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### `assetlinks.json` — Adding Production Fingerprint

Current file (`public/.well-known/assetlinks.json`) has only the debug fingerprint:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.sailbosco.app",
    "sha256_cert_fingerprints": [
      "94:42:E7:39:E6:78:9A:67:B1:9E:23:E8:DB:10:DD:04:64:8D:8F:CC:6E:E6:8D:02:DB:87:D5:BE:E3:F2:C4:43"
    ]
  }
}]
```

After uploading AAB to Play Console, add the Play App Signing fingerprint:
```json
"sha256_cert_fingerprints": [
  "94:42:E7:39:E6:78:9A:67:B1:9E:23:E8:DB:10:DD:04:64:8D:8F:CC:6E:E6:8D:02:DB:87:D5:BE:E3:F2:C4:43",
  "PRODUCTION_FINGERPRINT_FROM_PLAY_CONSOLE"
]
```

**Critical sequence:** assetlinks.json must be deployed to Vercel **before** the production release, otherwise deep linking (App Links from Story 6.A4) won't verify for production-signed installs.

[Source: 6-a4-android-app-links-deep-linking.md — "Production fingerprint (Story 6.A3)"]

### Play App Signing vs Upload Key

Google Play uses **Play App Signing** by default for new apps:
- **Upload key**: The keystore you create locally (`bosco-release.keystore`). Used to sign the AAB you upload.
- **Signing key**: Google generates this. Used to sign the final APK delivered to users.
- The **signing key** fingerprint (not the upload key) goes into `assetlinks.json` for deep link verification.

**Where to find it:** Play Console → Release → Setup → App signing → "App signing key certificate" → SHA-256 certificate fingerprint.

### Store Listing — Keyword Strategy

Target keywords based on PRD requirements and user journeys:
- Primary: "sailing voyage tracker", "sailing logbook"
- Secondary: "GPS track sailing", "Navionics export", "sailing map"
- Long-tail: "sailing route animation", "share sailing voyage"

Title: **Bosco — Sailing Voyage Tracker** (30 char limit)
Short description should pack in keywords naturally.

[Source: prd.md — "Store listing optimization: keywords sailing, voyage tracker, GPS track, logbook, Navionics"]

### Data Safety — Key Decisions

| Category | Declaration | Rationale |
|----------|-------------|-----------|
| Location | Not collected | GPX files are imported (not live GPS). App doesn't use `ACCESS_FINE_LOCATION` or `ACCESS_COARSE_LOCATION` permissions — only `INTERNET` declared in manifest |
| Email | Collected for authentication | Magic link sign-in via Supabase Auth |
| Photos | Collected (user-uploaded) | Journal photo attachments stored in Supabase Storage |
| Crash logs | Collected | Sentry error reporting (`@sentry/nextjs`) |
| Analytics | Not collected | No analytics SDK — Vercel Analytics is web-only, not in the native app |
| Ads | Not collected | No ads |
| Data deletion | Available | Account deletion with full cascade (Story 5-5, FR-67) |

Privacy policy URL: `https://www.sailbosco.com/legal/privacy` (Story 5-4 implemented this)

[Source: prd.md — "RGPD / GDPR Compliance" + "App Store Compliance" sections]

### Screenshots — What to Capture

Minimum 2, recommended 4-8 phone screenshots (16:9 ratio, min 320px, max 3840px per side). Capture from emulator or Chrome DevTools device mode on the live site:

1. **Landing page** — hero section with animated map demo
2. **Voyage map** — full-screen map with track, stopovers, photo markers
3. **Import preview** — GPX import dialog with track preview and stats
4. **Public voyage** — public page with animated route and stats bar
5. **Dashboard** — voyage cards overview

Feature graphic: 1024×500 px — required for Play Store listing. Shows on browse/search results.

### App Icon

The icon is configured via `@mipmap/ic_launcher` (Capacitor default). Before submission, verify:
- 512×512 px high-res icon uploaded to Play Console (separate from APK icon)
- No alpha/transparency (Play Store rejects transparent icons)
- Matches the current splash screen branding (`#1B2D4F` navy background from Capacitor config)

### Version Numbers

Current: `versionCode 1`, `versionName "1.0"` in `build.gradle`. These are correct for first submission. Future AAB uploads must increment `versionCode`.

### Permissions Audit

Current AndroidManifest.xml declares only:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

This is minimal and clean — no camera, location, storage, or contacts permissions. This simplifies the data safety declaration considerably.

### Build Command Sequence

```bash
# 1. Ensure web app is built and synced
npm run build && npx cap sync

# 2. Build release AAB (requires keystore.properties configured)
cd android && ./gradlew bundleRelease

# 3. AAB output location
# android/app/build/outputs/bundle/release/app-release.aab
```

### What NOT to Do

- **DO NOT** commit `bosco-release.keystore` or `keystore.properties` to git
- **DO NOT** use the debug keystore for release builds
- **DO NOT** submit to Production track before testing on Internal Testing track
- **DO NOT** deploy production release before updating `assetlinks.json` with the Play App Signing fingerprint
- **DO NOT** enable ProGuard/minification for the release build — the app is a WebView wrapper, there's nothing to optimize/obfuscate
- **DO NOT** create a separate `google-services.json` — not needed (no Firebase/FCM)

### Previous Story Learnings (6.1, 6.2, 6.A4)

- Package name: `com.sailbosco.app` — defined in `build.gradle`, used in Play Console
- `@capacitor/app@6.0.3` and `@capacitor/core@6.2.1` are installed — no new dependencies needed
- `npx cap sync` after any Android project changes
- Debug keystore fingerprint: `94:42:E7:39:E6:78:9A:67:B1:9E:23:E8:DB:10:DD:04:64:8D:8F:CC:6E:E6:8D:02:DB:87:D5:BE:E3:F2:C4:43`
- Deep link verification (Story 6.A4) depends on correct `assetlinks.json` — this story completes that by adding production fingerprint
- 457 tests pass, tsc clean, build OK — baseline regression check

### Existing Files — DO NOT Modify (unless specified)

- `capacitor.config.ts` — No changes needed
- `android/app/src/main/AndroidManifest.xml` — No changes needed (intent filters from 6.2 and 6.A4 are correct)
- `src/middleware.ts` — `.well-known` already excluded (Story 6.A4)
- `src/app/legal/privacy/page.tsx` — Privacy policy already live
- All native plugin files (`GpxReceivePlugin.java`, `deep-link-handler.ts`, etc.)

### File Placement

```
android/
├── keystore.properties              # NEW: Release signing config (GITIGNORED)
├── keystore.properties.example      # NEW: Template for documentation
└── app/
    └── build.gradle                 # MODIFIED: Add signingConfigs for release

public/.well-known/
└── assetlinks.json                  # MODIFIED: Add production SHA256 fingerprint

.gitignore                           # MODIFIED: Add keystore.properties
```

### References

- [Source: epics.md#Story 6.A3] — Acceptance criteria, keyword list
- [Source: sprint-change-proposal-2026-04-01.md] — Rationale for extracting 6.A3 from Epic 6B
- [Source: prd.md#FR-62] — "Users can download Bosco from the Google Play Store"
- [Source: prd.md#App Store Compliance] — Developer account cost, data safety, age rating
- [Source: prd.md#RGPD/GDPR] — Privacy policy, data handling requirements
- [Source: architecture.md#Capacitor Architecture] — Build pipeline, remote URL architecture
- [Source: 6-a4-android-app-links-deep-linking.md] — assetlinks.json current state, production fingerprint instructions
- [Source: 6-a4-android-app-links-deep-linking.md#What Story 6.A3 Will Need] — Explicit handoff notes
- [Source: ux-design-specification.md#Landing Page Redesign] — App store badges section

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Gradle 8.2.1 incompatible with Java 23 (major version 67) — resolved by using JAVA_HOME pointing to Corretto 21

### Completion Notes List

- Task 1: Release keystore created at ~/.android/bosco-release.keystore (O=Bosco, C=FR, alias=bosco). signingConfigs added to build.gradle using keystore.properties approach. keystore.properties and *.keystore added to .gitignore. keystore.properties.example created for documentation.
- Task 2: versionCode 1, versionName 1.0, SDK versions confirmed correct. Web assets built and synced. Release AAB built successfully (2.7 MB) at android/app/build/outputs/bundle/release/app-release.aab. 457 tests pass, tsc clean.

### File List

- android/app/build.gradle (MODIFIED: added signingConfigs for release)
- android/keystore.properties (NEW: release signing config — GITIGNORED)
- android/keystore.properties.example (NEW: template for documentation)
- .gitignore (MODIFIED: added keystore.properties and *.keystore)

### Change Log

- 2026-04-01: Task 1-2 complete — release signing configured, AAB built successfully
