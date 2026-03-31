interface AppStoreBadgesMessages {
  appStore: string;
  googlePlay: string;
  comingSoon: string;
}

interface AppStoreBadgesProps {
  messages: AppStoreBadgesMessages;
}

export function AppStoreBadges({ messages }: AppStoreBadgesProps) {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <span className="text-small text-mist">{messages.comingSoon}</span>
      <div className="flex gap-3">
        {/* App Store badge */}
        <a
          href="#"
          aria-label={messages.appStore}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-navy px-4 text-white opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          <div className="flex flex-col leading-tight">
            <span className="text-[9px]">Download on the</span>
            <span className="text-small font-semibold">App Store</span>
          </div>
        </a>

        {/* Google Play badge */}
        <a
          href="#"
          aria-label={messages.googlePlay}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-navy px-4 text-white opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
            <path d="M3.18 23.49c-.35-.18-.6-.52-.63-.92L2.5 1.47c0-.4.22-.76.56-.95l9.97 11.5L3.18 23.49zM14.78 13.75l-2.81-3.24 8.1-4.68c.4-.23.88-.2 1.24.04.37.24.6.66.56 1.1l-.02.1L14.78 13.75zm-2.81-3.24L4.2.6l10.82 6.25-3.05 3.66zm0 0l-8.54 9.85 11.79-6.81-3.25-3.04z" />
          </svg>
          <div className="flex flex-col leading-tight">
            <span className="text-[9px]">GET IT ON</span>
            <span className="text-small font-semibold">Google Play</span>
          </div>
        </a>
      </div>
    </div>
  );
}
