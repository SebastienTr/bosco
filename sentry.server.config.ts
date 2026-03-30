import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1,
  debug: false,
  beforeSend(event) {
    // Strip PII from error extras (no email, no GPS coordinates)
    if (event.extra) {
      for (const key of Object.keys(event.extra)) {
        const val = event.extra[key];
        if (typeof val === "string") {
          // Redact email-like values
          if (/@/.test(val)) {
            event.extra[key] = "[REDACTED_EMAIL]";
          }
        }
        // Redact GPS coordinate fields
        if (/latitude|longitude|lat|lng|lon/i.test(key)) {
          event.extra[key] = "[REDACTED_COORDS]";
        }
      }
    }
    return event;
  },
});
