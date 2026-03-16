"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    isActive: (pathname: string) => pathname === "/dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    label: "Voyage",
    href: "/voyage",
    isActive: (pathname: string) => pathname.startsWith("/voyage"),
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    isActive: (pathname: string) => pathname.startsWith("/dashboard/profile"),
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="5" />
        <path d="M20 21a8 8 0 0 0-16 0" />
      </svg>
    ),
  },
];

export function NavigationBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-navy/10 bg-white shadow-card lg:hidden"
        aria-label="Main navigation"
      >
        <ul className="flex h-16 items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const active = item.isActive(pathname);
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 px-3 py-2 text-tiny font-semibold transition-colors ${
                    active ? "text-ocean" : "text-mist hover:text-navy"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop side navigation */}
      <nav
        className="hidden w-60 shrink-0 border-r border-navy/10 bg-white lg:block"
        aria-label="Main navigation"
      >
        <div className="sticky top-0 px-4 pt-8">
          <p className="mb-8 font-heading text-h2 text-navy">Bosco</p>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = item.isActive(pathname);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex min-h-[44px] items-center gap-3 rounded-[var(--radius-button)] px-4 py-3 text-body font-semibold transition-colors ${
                      active
                        ? "bg-ocean/10 text-ocean"
                        : "text-mist hover:bg-foam hover:text-navy"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
