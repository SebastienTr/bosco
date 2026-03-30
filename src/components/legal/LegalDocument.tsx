import { LegalLinks } from "./LegalLinks";
import type { LegalDocumentContent } from "@/lib/legal/content";

interface LegalDocumentProps {
  document: LegalDocumentContent;
}

export function LegalDocument({ document }: LegalDocumentProps) {
  return (
    <main className="min-h-screen bg-foam px-4 py-12 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-white p-8 shadow-card sm:p-10">
        <p className="text-small font-semibold uppercase tracking-[0.2em] text-ocean">
          Legal
        </p>
        <h1 className="mt-4 font-heading text-display text-navy">
          {document.title}
        </h1>
        <p className="mt-3 text-body leading-relaxed text-slate">
          {document.description}
        </p>

        <div className="mt-6 rounded-2xl bg-sand px-5 py-4">
          <p className="text-tiny font-semibold uppercase tracking-[0.2em] text-ocean">
            Effective Date
          </p>
          <p className="mt-2 text-small text-slate">{document.effectiveDate}</p>
          {document.publicationStatusNote ? (
            <p className="mt-3 text-small text-slate">
              {document.publicationStatusNote}
            </p>
          ) : null}
        </div>

        <div className="mt-6">
          <p className="text-tiny font-semibold uppercase tracking-[0.2em] text-ocean">
            Related Legal Pages
          </p>
          <p className="mt-2 text-small text-slate">
            The app stores only expose a privacy-policy URL, so Bosco keeps both
            legal pages linked from the public web and from inside the app.
          </p>
          <LegalLinks currentPath={document.path} className="mt-4" />
        </div>

        <div className="mt-8 space-y-4 text-body leading-relaxed text-slate">
          {document.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 space-y-10">
          {document.sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-heading text-h2 text-navy">{section.title}</h2>
              <div className="mt-3 space-y-4 text-body leading-relaxed text-slate">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets?.length ? (
                <ul className="mt-4 space-y-3 pl-6 text-body text-slate marker:text-ocean">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

      </article>
    </main>
  );
}
