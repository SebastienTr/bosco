"use client";

import { useState, useRef, useEffect } from "react";
import { type Lang, langLabels } from "@/app/landing-messages";
import { ChevronDown } from "lucide-react";

const langs = Object.entries(langLabels) as [Lang, (typeof langLabels)[Lang]][];

/** Gwenn-ha-du — 9 stripes + ermine canton */
function BretonFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 14" className={className} aria-label="Gwenn-ha-du">
      {Array.from({ length: 9 }, (_, i) => (
        <rect
          key={i}
          x="0"
          y={i * (14 / 9)}
          width="20"
          height={14 / 9 + 0.1}
          fill={i % 2 === 0 ? "#000" : "#fff"}
        />
      ))}
      <rect x="0" y="0" width="8" height="7" fill="#fff" />
      <g fill="#000">
        <circle cx="2" cy="1.8" r="0.45" />
        <line x1="2" y1="2.3" x2="2" y2="3.2" stroke="#000" strokeWidth="0.35" />
        <circle cx="5.5" cy="1.8" r="0.45" />
        <line x1="5.5" y1="2.3" x2="5.5" y2="3.2" stroke="#000" strokeWidth="0.35" />
        <circle cx="3.8" cy="4.2" r="0.45" />
        <line x1="3.8" y1="4.7" x2="3.8" y2="5.6" stroke="#000" strokeWidth="0.35" />
      </g>
    </svg>
  );
}

function FlagIcon({ lang }: { lang: Lang }) {
  if (lang === "br") {
    return <BretonFlag className="h-3.5 w-5 shrink-0 rounded-[1px]" />;
  }
  return <span className="text-body leading-none">{langLabels[lang].flag}</span>;
}

export function LanguageSelector({
  value,
  onChange,
}: {
  value: Lang;
  onChange: (lang: Lang) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(lang: Lang) {
    onChange(lang);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border border-foam bg-white px-3 py-1.5 text-small text-slate transition-colors hover:border-mist focus:outline-none focus:ring-2 focus:ring-ocean/30"
      >
        <FlagIcon lang={value} />
        <span>{langLabels[value].label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-mist transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-[var(--radius-card)] border border-foam bg-white py-1 shadow-overlay">
          {langs.map(([code, { label }]) => (
            <button
              key={code}
              type="button"
              onClick={() => select(code)}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-small transition-colors ${
                code === value
                  ? "bg-ocean/10 font-semibold text-navy"
                  : "text-slate hover:bg-foam"
              }`}
            >
              <FlagIcon lang={code} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
