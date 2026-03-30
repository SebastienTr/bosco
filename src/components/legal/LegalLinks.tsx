import Link from "next/link";
import { clsx } from "clsx";
import type { LegalDocumentKey } from "@/lib/legal/content";

interface LegalLinksProps {
  currentPath?: `/legal/${LegalDocumentKey}`;
  labels?: {
    privacy: string;
    terms: string;
  };
  className?: string;
}

const linkItems = [
  { key: "privacy", href: "/legal/privacy", defaultLabel: "Privacy Policy" },
  { key: "terms", href: "/legal/terms", defaultLabel: "Terms of Service" },
] as const;

export function LegalLinks({
  currentPath,
  labels,
  className,
}: LegalLinksProps) {
  return (
    <nav aria-label="Legal links" className={clsx("flex flex-wrap gap-3", className)}>
      {linkItems.map((item) => {
        const label =
          item.key === "privacy"
            ? labels?.privacy ?? item.defaultLabel
            : labels?.terms ?? item.defaultLabel;
        const isCurrent = currentPath === item.href;
        const baseClassName =
          "inline-flex min-h-[44px] items-center rounded-full border border-ocean/20 px-4 py-2 text-small font-semibold transition-colors";

        if (isCurrent) {
          return (
            <span
              key={item.href}
              aria-current="page"
              className={clsx(baseClassName, "bg-ocean text-white")}
            >
              {label}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              baseClassName,
              "bg-white text-ocean hover:border-ocean hover:bg-ocean/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
