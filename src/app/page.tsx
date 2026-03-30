"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Navigation,
  Anchor,
  Globe,
  FileDown,
  Upload,
  Share2,
} from "lucide-react";
import { HeroIllustration } from "@/components/landing/HeroIllustration";
import { LanguageSelector } from "@/components/landing/LanguageSelector";
import {
  type Lang,
  defaultLang,
  landingMessages,
} from "./landing-messages";
import { LegalLinks } from "@/components/legal/LegalLinks";

const LANG_KEY = "bosco-lang";

const stepIcons = [FileDown, Upload, Share2];
const featureIcons = [Navigation, Anchor, Globe];
const featureKeys = ["track", "stopovers", "share"] as const;

function getInitialLang(): Lang {
  if (typeof window === "undefined") {
    return defaultLang;
  }

  const stored = window.localStorage.getItem(LANG_KEY);

  if (stored && stored in landingMessages) {
    return stored as Lang;
  }

  return defaultLang;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const searchParams = useSearchParams();

  function changeLang(next: Lang) {
    setLang(next);
    localStorage.setItem(LANG_KEY, next);
  }

  const t = landingMessages[lang];
  const showAccountDeleted = searchParams.get("accountDeleted") === "1";
  const steps = [t.howItWorks.steps.export, t.howItWorks.steps.import, t.howItWorks.steps.share];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 sm:px-8">
        <span className="font-heading text-h1 text-navy">Bosco</span>
        <div className="flex items-center gap-4">
          <LanguageSelector value={lang} onChange={changeLang} />
          <Link
            href="/auth"
            className="text-body font-semibold text-ocean transition-colors hover:text-ocean/80"
          >
            {t.nav.signIn}
          </Link>
        </div>
      </nav>

      {showAccountDeleted ? (
        <div className="px-4 pt-2 sm:px-6 lg:px-16">
          <div
            role="status"
            className="mx-auto max-w-5xl rounded-[var(--radius-card)] border border-success/30 bg-success/10 px-4 py-3 text-small font-semibold text-navy"
          >
            {t.alerts.accountDeleted}
          </div>
        </div>
      ) : null}

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center gap-12 px-4 py-12 sm:px-6 lg:flex-row lg:gap-16 lg:px-16 lg:py-20">
        <div className="flex max-w-xl flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="font-heading text-display text-navy sm:text-[2.5rem] lg:text-[3rem]">
            {t.hero.title}
          </h1>
          <p className="mt-6 text-h3 leading-relaxed text-slate">
            {t.hero.subtitle}
          </p>
          <div className="mt-8">
            <Link
              href="/auth"
              className="inline-flex min-h-[44px] items-center rounded-[var(--radius-button)] bg-coral px-8 py-3 text-body font-semibold text-white shadow-card transition-colors hover:bg-coral/90"
            >
              {t.hero.cta}
            </Link>
          </div>
        </div>
        <div className="w-full max-w-lg flex-1">
          <HeroIllustration />
        </div>
      </main>

      {/* How it works */}
      <section className="bg-sand px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-h1 text-navy sm:text-display">
          {t.howItWorks.title}
        </h2>
        <div className="mx-auto mt-12 grid max-w-3xl gap-8 sm:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-coral/10">
                  <Icon className="h-6 w-6 text-coral" />
                </div>
                <span className="mt-1 text-small font-bold text-coral">
                  {i + 1}
                </span>
                <h3 className="mt-2 font-heading text-h2 text-navy">
                  {step.title}
                </h3>
                <p className="mt-2 text-body text-slate">{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {featureKeys.map((key, i) => {
            const Icon = featureIcons[i];
            const feature = t.features[key];
            return (
              <div
                key={key}
                className="rounded-[var(--radius-card)] bg-foam p-6 shadow-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean/10">
                  <Icon className="h-5 w-5 text-ocean" />
                </div>
                <h3 className="mt-4 font-heading text-h2 text-navy">
                  {feature.title}
                </h3>
                <p className="mt-2 text-body text-slate">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foam px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <span className="font-heading text-h3 text-navy">Bosco</span>
            <p className="mt-1 text-small text-mist">{t.footer.tagline}</p>
          </div>
          <LegalLinks
            labels={{
              privacy: t.footer.privacy,
              terms: t.footer.terms,
            }}
            className="justify-center sm:justify-end"
          />
        </div>
      </footer>
    </div>
  );
}
