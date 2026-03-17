import Link from "next/link";
import { Navigation, Anchor, Globe, FileDown, Upload, Share2 } from "lucide-react";
import { HeroIllustration } from "@/components/landing/HeroIllustration";
import { messages } from "./messages";

const steps = [
  { icon: FileDown, ...messages.howItWorks.steps.export },
  { icon: Upload, ...messages.howItWorks.steps.import },
  { icon: Share2, ...messages.howItWorks.steps.share },
];

const features = [
  { icon: Navigation, ...messages.features.track },
  { icon: Anchor, ...messages.features.stopovers },
  { icon: Globe, ...messages.features.share },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 sm:px-8">
        <span className="font-heading text-h1 text-navy">Bosco</span>
        <Link
          href="/auth"
          className="text-body font-semibold text-ocean transition-colors hover:text-ocean/80"
        >
          {messages.nav.signIn}
        </Link>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center gap-12 px-4 py-12 sm:px-6 lg:flex-row lg:gap-16 lg:px-16 lg:py-20">
        {/* Text */}
        <div className="flex max-w-xl flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="font-heading text-display text-navy sm:text-[2.5rem] lg:text-[3rem]">
            {messages.hero.title}
          </h1>
          <p className="mt-6 text-h3 leading-relaxed text-slate">
            {messages.hero.subtitle}
          </p>
          <div className="mt-8">
            <Link
              href="/auth"
              className="inline-flex min-h-[44px] items-center rounded-[var(--radius-button)] bg-coral px-8 py-3 text-body font-semibold text-white shadow-card transition-colors hover:bg-coral/90"
            >
              {messages.hero.cta}
            </Link>
          </div>
        </div>

        {/* Illustration */}
        <div className="w-full max-w-lg flex-1">
          <HeroIllustration />
        </div>
      </main>

      {/* How it works */}
      <section className="bg-sand px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-h1 text-navy sm:text-display">
          {messages.howItWorks.title}
        </h2>
        <div className="mx-auto mt-12 grid max-w-3xl gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-coral/10">
                <step.icon className="h-6 w-6 text-coral" />
              </div>
              <span className="mt-1 text-small font-bold text-coral">
                {i + 1}
              </span>
              <h3 className="mt-2 font-heading text-h2 text-navy">
                {step.title}
              </h3>
              <p className="mt-2 text-body text-slate">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={i}
              className="rounded-[var(--radius-card)] bg-foam p-6 shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean/10">
                <feature.icon className="h-5 w-5 text-ocean" />
              </div>
              <h3 className="mt-4 font-heading text-h2 text-navy">
                {feature.title}
              </h3>
              <p className="mt-2 text-body text-slate">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foam px-4 py-8 text-center">
        <span className="font-heading text-h3 text-navy">Bosco</span>
        <p className="mt-1 text-small text-mist">{messages.footer.tagline}</p>
      </footer>
    </div>
  );
}
