"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { StopoverList } from "./StopoverList";
import type { StopoverListItem } from "./StopoverList";

interface PortsPanelProps<T extends StopoverListItem> {
  stopovers: T[];
  isOpen: boolean;
  onClose: () => void;
  onSelectStopover: (stopover: T) => void;
  messages: {
    header: string;
    ariaLabel: string;
    closeLabel: string;
    emptyState: string;
  };
}

export function PortsPanel<T extends StopoverListItem>({
  stopovers,
  isOpen,
  onClose,
  onSelectStopover,
  messages,
}: PortsPanelProps<T>) {
  const touchStartX = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      if (deltaX < -80) onClose();
    },
    [onClose],
  );

  // Escape key handler for mobile overlay
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleArrowKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

      const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>(
        "ul button",
      );
      if (buttons.length === 0) return;

      const currentIndex = Array.from(buttons).findIndex(
        (btn) => btn === document.activeElement,
      );
      if (currentIndex === -1) return;

      e.preventDefault();
      if (e.key === "ArrowDown" && currentIndex < buttons.length - 1) {
        buttons[currentIndex + 1].focus();
      } else if (e.key === "ArrowUp" && currentIndex > 0) {
        buttons[currentIndex - 1].focus();
      }
    },
    [],
  );

  return (
    <>
      {/* Mobile overlay panel */}
      <div
        className={`fixed inset-y-0 right-0 z-[450] w-[280px] lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-200 ease-out ${
          isOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 -z-10 bg-navy/30"
            onClick={onClose}
            aria-hidden="true"
          />
        )}

        <nav
          role="navigation"
          aria-label={messages.ariaLabel}
          className="flex h-full flex-col bg-navy/75 backdrop-blur-[12px]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onKeyDown={handleArrowKeyDown}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h2 className="font-heading text-h3 text-white">
              {messages.header}
            </h2>
            <button
              onClick={onClose}
              aria-label={messages.closeLabel}
              className="rounded-full p-1.5 text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-ocean focus-visible:outline-offset-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>

          {/* Stopover list */}
          <div className="flex-1 overflow-y-auto pb-20 [&_summary]:text-white/90 [&_span]:text-white/70 [&_button]:text-white/80 [&_button:hover]:bg-white/10">
            {stopovers.length > 0 ? (
              <StopoverList
                stopovers={stopovers}
                onSelect={onSelectStopover}
              />
            ) : (
              <p className="p-4 text-sm text-white/60">{messages.emptyState}</p>
            )}
          </div>
        </nav>
      </div>

      {/* Desktop persistent sidebar */}
      <nav
        role="navigation"
        aria-label={messages.ariaLabel}
        className="hidden h-full w-[280px] shrink-0 flex-col overflow-y-auto bg-sand lg:flex"
        onKeyDown={handleArrowKeyDown}
      >
        <div className="border-b border-navy/10 px-4 py-3">
          <h2 className="font-heading text-h3 text-navy">{messages.header}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {stopovers.length > 0 ? (
            <StopoverList
              stopovers={stopovers}
              onSelect={onSelectStopover}
            />
          ) : (
            <p className="p-4 text-sm text-mist">{messages.emptyState}</p>
          )}
        </div>
      </nav>
    </>
  );
}
