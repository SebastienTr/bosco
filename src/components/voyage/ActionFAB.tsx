"use client";

interface ActionFABProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: {
    openLabel: string;
    closeLabel: string;
  };
}

export function ActionFAB({ isOpen, onToggle, messages }: ActionFABProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isOpen ? messages.closeLabel : messages.openLabel}
      className="absolute bottom-20 right-4 z-[400] flex h-12 w-12 items-center justify-center rounded-full bg-coral text-white shadow-overlay transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-ocean focus-visible:outline-offset-2 lg:hidden"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="transition-transform duration-200"
      >
        {isOpen ? (
          <>
            <path d="M4 4l12 12" />
            <path d="M16 4L4 16" />
          </>
        ) : (
          <>
            {/* List/compass icon */}
            <path d="M4 6h12" />
            <path d="M4 10h12" />
            <path d="M4 14h8" />
          </>
        )}
      </svg>
    </button>
  );
}
