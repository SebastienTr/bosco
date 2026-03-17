export function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero-screenshot.png"
        alt="Sailing track traced on a map showing a voyage with stopovers"
        className="w-full rounded-[var(--radius-card)] shadow-card"
      />
      {/* Decorative glow behind the card */}
      <div className="absolute -inset-4 -z-10 rounded-2xl bg-ocean/5 blur-2xl" />
    </div>
  );
}
