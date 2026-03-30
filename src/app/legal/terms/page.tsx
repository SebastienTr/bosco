import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { legalDocuments } from "@/lib/legal/content";
import { siteUrl } from "@/lib/utils/site-url";

const document = legalDocuments.terms;

export const metadata: Metadata = {
  title: `Bosco — ${document.title}`,
  description: document.description,
  alternates: {
    canonical: `${siteUrl}${document.path}`,
  },
};

export default function TermsOfServicePage() {
  return <LegalDocument document={document} />;
}
