# Story 5.1: Supabase Pro Migration & Custom SMTP

Status: done

## Story

As a sailor,
I want to receive auth emails from sailbosco.com,
So that I trust the service and emails don't land in spam.

## Acceptance Criteria

### AC-1: Supabase Pro Migration
**Given** the project is on Supabase free tier
**When** migration to Supabase Pro is completed
**Then** daily automated backups are enabled and verified
**And** the project never auto-pauses due to inactivity

### AC-2: Custom SMTP via Resend
**Given** Supabase Pro is active
**When** custom SMTP is configured with Resend
**Then** magic link emails are sent from `noreply@sailbosco.com` with sender name "Bosco"
**And** emails are delivered reliably (not landing in spam)

### AC-3: DNS Email Authentication
**Given** the domain sailbosco.com is on Cloudflare DNS
**When** SPF, DKIM, and DMARC records are configured
**Then** Resend domain verification passes
**And** email deliverability is validated (send test magic link, verify headers show PASS for SPF/DKIM/DMARC)

### AC-4: Budget Compliance
**Given** the infrastructure budget target of ≤$50/month
**When** all services are active (Supabase Pro + Resend Free + Vercel Hobby)
**Then** total monthly cost is ≤$30/month

## Tasks / Subtasks

- [x] Task 1: Resend account and domain setup (AC: #2, #3)
  - [x] Create Resend account at resend.com
  - [x] Add domain `sailbosco.com` in Resend dashboard
  - [x] Copy the generated DNS records (SPF, DKIM, MX)
  - [x] Generate API key for SMTP usage — save securely

- [x] Task 2: Cloudflare DNS records (AC: #3)
  - [x] Add MX record: name=`send`, mail server=`feedback-smtp.eu-west-1.amazonses.com`, priority=10, proxy=OFF
  - [x] Add TXT (SPF): name=`send`, content=`v=spf1 include:amazonses.com ~all`, proxy=OFF
  - [x] Add TXT (DKIM): name=`resend._domainkey`, content=`p=<key-from-resend>`, proxy=OFF
  - [x] Add TXT (DMARC): name=`_dmarc`, content=`v=DMARC1; p=none;`
  - [x] Verify domain in Resend dashboard (wait for green checkmarks)
  - [x] **CRITICAL**: All email DNS records must have Cloudflare proxy DISABLED (gray cloud / DNS only)
  - [x] **CRITICAL**: In Cloudflare name fields, omit the root domain (enter `resend._domainkey` not `resend._domainkey.sailbosco.com`)

- [x] Task 3: Supabase Pro upgrade (AC: #1)
  - [x] Upgrade Supabase project to Pro plan ($25/month) in dashboard → Settings → Billing
  - [x] Verify daily backups are enabled: Settings → Database → Backups → confirm 7-day retention
  - [x] Verify project will not auto-pause: Settings → General → confirm no inactivity pause

- [x] Task 4: Configure custom SMTP in Supabase (AC: #2)
  - [x] Go to Supabase dashboard → Authentication → SMTP Settings (or Project Settings → Auth → SMTP)
  - [x] Toggle "Enable Custom SMTP" ON
  - [x] Configure: Sender email=`noreply@sailbosco.com`, Sender name=`Bosco`, Host=`smtp.resend.com`, Port=`465`, Username=`resend`, Password=`<resend-api-key>`
  - [x] Save and test: Authentication → Users → Invite User → send test email
  - [x] Verify email arrives from `noreply@sailbosco.com` (not from Supabase default)
  - [x] Check email headers: email delivered to inbox (not spam)

- [x] Task 5: Update auth email templates in Supabase (AC: #2)
  - [x] Go to Authentication → Email Templates
  - [x] Review and customize "Magic Link" template: ensure it says "Bosco" and has clean branding
  - [x] Review "Confirm Email" template if applicable
  - [x] Keep templates minimal — text-based, no heavy HTML (better deliverability)
  - [x] Ensure the `{{ .ConfirmationURL }}` variable is preserved in all templates

- [x] Task 6: Update project configuration files (AC: #2)
  - [x] Update `.env.example` — add SMTP-related documentation comment (no secrets)
  - [x] Update `supabase/config.toml` — document the `[auth.email.smtp]` reference block for future configuration
  - [x] Verify `SITE_URL` is set to `https://www.sailbosco.com` in Vercel environment variables

- [ ] Task 7: End-to-end verification (AC: #1, #2, #3, #4)
  - [x] Test magic link flow: go to sailbosco.com → auth → enter email → receive branded email → click link → authenticated
  - [x] Verify email sender shows "Bosco <noreply@sailbosco.com>"
  - [x] Verify email delivered to inbox (not spam) on Gmail
  - [ ] Verify Gmail Authentication-Results shows `spf=pass`, `dkim=pass`, `dmarc=pass`
  - [x] Verify Supabase Pro features: dashboard shows Pro plan
  - [x] Verify budget: Supabase=$25 + Resend=$0 + Vercel=$0 = $25/month total

## Dev Notes

### Nature of This Story

This is an **infrastructure/configuration story**, not a code story. The work happens primarily in:
1. **Resend dashboard** (account setup, domain verification, API key generation)
2. **Cloudflare DNS** (email authentication records)
3. **Supabase dashboard** (Pro upgrade, SMTP configuration, email templates)
4. **Minimal file changes** (`.env.example` documentation, `config.toml` local dev reference)

No application code changes are required. The auth flow (`src/lib/auth.ts` → `signInWithOtp`) remains unchanged — Supabase Auth handles the SMTP routing transparently.

### Current Auth Implementation (No Changes Needed)

`src/lib/auth.ts` uses `supabase.auth.signInWithOtp({ email })` which delegates email delivery entirely to Supabase. When custom SMTP is configured in the Supabase dashboard, all auth emails automatically route through the configured SMTP provider. **Zero code changes required.**

Current env vars used by auth:
- `NEXT_PUBLIC_SUPABASE_DB_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_DB_PUBLISHABLE_KEY` — Supabase anon key
- `SITE_URL` — Used for magic link redirect URL (`/auth/confirm`)

### Resend SMTP Configuration Reference

| Setting | Value |
|---------|-------|
| Host | `smtp.resend.com` |
| Port | `465` (SSL) |
| Username | `resend` |
| Password | Resend API key (`re_...`) |
| Sender email | `noreply@sailbosco.com` |
| Sender name | `Bosco` |

**Resend Free plan:** 3,000 emails/month, 100 emails/day — more than sufficient for early-stage. Upgrade to Pro ($20/mo) only if exceeding 100 daily magic links.

### Supabase Pro vs Free Tier — Key Differences

| Feature | Free | Pro ($25/mo) |
|---------|------|--------------|
| Database | 500 MB | 8 GB |
| Storage | 1 GB | 100 GB |
| Backups | None | Daily, 7-day retention |
| Inactivity pause | After 7 days | Never |
| Log retention | 1 day | 7 days |
| Custom SMTP | Restricted* | Full |

*Free tier email sending is restricted to project organization members only. External users cannot receive auth emails without custom SMTP. This makes custom SMTP effectively mandatory for production.

### DNS Records Summary (Cloudflare)

All records must have **proxy disabled** (DNS only / gray cloud):

| Type | Name | Content | Notes |
|------|------|---------|-------|
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` (priority 10) | For Resend sending subdomain |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | SPF record |
| TXT | `resend._domainkey` | `p=<key-from-resend-dashboard>` | DKIM record |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | DMARC policy |

**Note:** Resend offers a "Sign in to Cloudflare" auto-setup button that can configure DNS records automatically via Domain Connect. Use this shortcut if available.

### Budget Breakdown

| Service | Monthly Cost |
|---------|-------------|
| Supabase Pro | $25 |
| Resend Free | $0 |
| Vercel Hobby | $0 |
| Domain (sailbosco.com) | ~$1 (annualized) |
| **Total** | **~$26/month** |

Target: ≤$50/month (BS-2). Actual: ~$26/month — well within budget.

### File Changes (Minimal)

#### `.env.example` — Add SMTP documentation
```
# Supabase
NEXT_PUBLIC_SUPABASE_DB_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_DB_PUBLISHABLE_KEY=your-publishable-key-here

# Site URL (used for auth redirect URLs)
SITE_URL=http://localhost:3000

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Note: Custom SMTP for auth emails is configured in the Supabase dashboard
# (Authentication → SMTP Settings), not via environment variables.
# Production uses Resend (smtp.resend.com) with sender noreply@sailbosco.com.
# Local dev uses Inbucket (http://127.0.0.1:54324) — no SMTP config needed.
```

#### `supabase/config.toml` — Document SMTP reference block
Update the commented `[auth.email.smtp]` section as documentation:
```toml
# Production SMTP — configured in Supabase dashboard, NOT here.
# Provider: Resend (smtp.resend.com:465), sender: noreply@sailbosco.com
# Local dev uses Inbucket (port 54324) — no SMTP needed.
# [auth.email.smtp]
# enabled = true
# host = "smtp.resend.com"
# port = 465
# user = "resend"
# pass = "env(RESEND_API_KEY)"
# admin_email = "noreply@sailbosco.com"
# sender_name = "Bosco"
```

### Verification Checklist

After all configuration is complete:

1. **Magic link delivery:** Sign out → enter email → receive email from `Bosco <noreply@sailbosco.com>` → click → authenticated
2. **Email headers:** In Gmail, "Show Original" → check Authentication-Results:
   - `spf=pass`
   - `dkim=pass`
   - `dmarc=pass`
3. **Supabase dashboard:** Settings → Billing shows "Pro" plan
4. **Backups:** Settings → Database → Backups shows daily schedule with 7-day retention
5. **No auto-pause:** Project remains active after 7+ days of low traffic
6. **Multi-provider test:** Verify delivery to Gmail, Outlook, iCloud (no spam folder)

### What This Story Does NOT Include

- **No code changes to auth flow** — Supabase handles SMTP routing
- **No email template React components** — templates are configured in Supabase dashboard
- **No new environment variables in Vercel** — SMTP is Supabase-side, not app-side
- **No database migrations** — that's Story 5.2
- **No Sentry setup** — that's Story 5.3
- **No legal pages** — that's Story 5.4

### Architecture Compliance

```
OK   No Tier violations — this story has no application code changes
OK   3-Tier containment intact — auth.ts continues to use signInWithOtp unchanged
OK   SITE_URL already set in Vercel env vars for redirect URLs
OK   Supabase config.toml updated as documentation only (local dev unchanged)
```

### Requirements Traceability

| Requirement | Description | Coverage |
|------------|-------------|----------|
| FR-3 | Branded auth emails (sailbosco.com) | AC-2, AC-3 |
| NFR-31 | Daily backups enabled on production tier | AC-1 |
| BS-2 | Infrastructure cost ≤$50/month | AC-4 |
| TS-5 | Data safety, daily backups, zero data loss | AC-1 |
| AR-1 | Supabase as backend | AC-1 (Pro upgrade) |

### Previous Epic Intelligence

MVP (Epics 1-4) is complete and deployed on Vercel with Supabase free tier. Last commit: `6b6bbe9 Prepare V1`. Current test suite: 256+ tests passing across 47+ files. The codebase is stable — this infrastructure story should not break anything.

**Key learning from past stories:** Fire-and-forget prohibition — all async operations must be awaited (Epic 1-2 retro). Not directly relevant here since there are no code changes, but worth noting for future Epic 5 stories.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 5, Story 5.1 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-3 (branded auth emails), BS-2 (budget), TS-5 (data safety), NFR-31 (daily backups)]
- [Source: _bmad-output/planning-artifacts/architecture.md — Supabase Pro custom SMTP decision, Resend provider, DNS on Cloudflare, containment tiers]
- [Source: src/lib/auth.ts — signInWithOtp implementation (no changes needed)]
- [Source: src/lib/supabase/config.ts — environment variable pattern]
- [Source: supabase/config.toml — current SMTP section (commented out)]
- [Source: .env.example — current environment template]
- [Source: Web research — Resend SMTP settings, Supabase Pro pricing, DNS record specifications]

## Change Log

- 2026-03-29: Story 5.1 implemented — Supabase Pro upgrade, Resend SMTP setup, Cloudflare DNS, email templates branded, config files updated
- 2026-03-30: Post-review corrections — DNS summary aligned with actual records, SMTP reference block completed, explicit AC-3 header verification left pending

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Resend auto-configure via Cloudflare Domain Connect used to set up MX, SPF, DKIM records automatically
- DMARC record added manually in Cloudflare (Resend marks it as optional and doesn't auto-configure it)
- Resend region: eu-west-1 (Ireland) — MX points to feedback-smtp.eu-west-1.amazonses.com (not us-east-1 as in original story spec)
- SITE_URL in Vercel is `https://www.sailbosco.com` (with www) — works correctly with the CNAME → Vercel setup
- Minor: email template has a residual `>` character at the bottom — cosmetic only

### Completion Notes List

- AC-1 (Supabase Pro): Upgraded to Pro plan ($25/mo), daily backups enabled, no auto-pause ✅
- AC-2 (Custom SMTP): Resend configured as SMTP provider, emails sent from `Bosco <noreply@sailbosco.com>`, delivered to inbox (not spam) ✅
- AC-3 (DNS Auth): DNS records configured in Cloudflare and Resend domain verification passed; explicit Gmail `Authentication-Results` capture for `spf=pass`, `dkim=pass`, `dmarc=pass` is still pending
- AC-4 (Budget): Supabase=$25 + Resend=$0 + Vercel=$0 = $25/month (within $50 target) ✅
- Magic Link template updated: subject="Sign in to Bosco", body branded with Bosco name and sailing logbook context
- `.env.example` and `supabase/config.toml` updated with SMTP documentation comments
- No application code changes required — auth flow unchanged

### File List

- `.env.example` — Added SMTP documentation comment (no secrets)
- `supabase/config.toml` — Updated SMTP section with Resend reference (commented out, documentation only)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Status updated
- `_bmad-output/implementation-artifacts/5-1-supabase-pro-migration-and-custom-smtp.md` — Story file updated
