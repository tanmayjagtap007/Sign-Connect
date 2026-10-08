"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Hand,
  MessageSquareText,
  Link2,
  Settings as SettingsIcon,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/communication", label: "Communication", icon: Hand },
  { href: "/gestures", label: "My Gestures", icon: Hand },
  { href: "/phrases", label: "Quick Phrases", icon: MessageSquareText },
  { href: "/integrations", label: "Integrations", icon: Link2 },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors ${
              active
                ? "bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-200"
                : "text-muted hover:bg-surface hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark"
            }`}
          >
            <Icon size={19} strokeWidth={2} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 dark:bg-surface-dark dark:border-border-dark md:hidden">
        <span className="text-[17px] font-semibold tracking-tight">SignConnect</span>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 hover:bg-canvas dark:hover:bg-canvas-dark"
        >
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-surface p-4 dark:bg-surface-dark">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[17px] font-semibold tracking-tight">SignConnect</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-lg p-2 hover:bg-canvas dark:hover:bg-canvas-dark"
              >
                <X size={20} />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface p-4 dark:bg-surface-dark dark:border-border-dark md:flex md:flex-col">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
            <Hand size={17} />
          </div>
          <span className="text-[17px] font-semibold tracking-tight">SignConnect</span>
        </div>
        <NavLinks />
      </aside>
    </>
  );
}
