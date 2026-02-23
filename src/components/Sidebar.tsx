"use client";

import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/lib/types";
import { getProfile } from "@/lib/storage";
import BeltBadge from "./BeltBadge";
import ThemeToggle from "./ThemeToggle";

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    dashboard: <path d="M2 2h5v6H2V2Zm7 0h5v4H9V2ZM2 10h5v4H2v-4Zm7-2h5v6H9V8Z" />,
    journal: <path d="M4 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4Zm1.5 3h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1Zm0 2.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1Zm0 2.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1Z" />,
    promotions: <path d="M8 1.5l2 4.5h5l-4 3.5 1.5 5L8 11.5 3.5 14.5 5 9.5 1 6h5l2-4.5Z" />,
    profile: <><circle cx="8" cy="5" r="3" /><path d="M2 14a6 6 0 0 1 12 0H2Z" /></>,
    about: <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 3.5a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM7.25 7a.75.75 0 0 1 1.5 0v4a.75.75 0 0 1-1.5 0V7Z" />,
  };
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      {paths[name]}
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/journal", label: "Journal", icon: "journal" },
  { href: "/promotions", label: "Promotions", icon: "promotions" },
  { href: "/profile", label: "Profile", icon: "profile" },
  { href: "/about", label: "About", icon: "about" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoadError, setProfileLoadError] = useState(false);

  // Re-check profile on pathname change (in case it was just created).
  useEffect(() => {
    let isMounted = true;

    void getProfile()
      .then((currentProfile) => {
        if (!isMounted) return;
        setProfile(currentProfile);
        setProfileLoadError(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setProfile(null);
        setProfileLoadError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-border flex flex-col z-50">
      <div className="p-6 border-b border-border">
        <h1 className="text-lg font-bold text-fg tracking-tight">
          Ground Karate
        </h1>
        <p className="text-xs text-fg-muted mt-0.5">BJJ Training Journal</p>
      </div>

      {profile && (
        <div className="px-6 py-4 border-b border-border">
          <p className="text-xs text-fg-muted mb-2 uppercase tracking-wider">
            Current Rank
          </p>
          <BeltBadge
            belt={profile.currentBelt}
            stripes={profile.currentStripes}
            size="sm"
          />
        </div>
      )}

      <nav className="flex-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                isActive
                  ? "bg-active text-fg"
                  : "text-fg-tertiary hover:text-fg hover:bg-active/50"
              }`}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <p className="text-xs text-fg-dim px-3 mb-1">
          {profileLoadError ? "Profile unavailable" : profile?.name ?? "Set up your profile"}
        </p>
        <ThemeToggle />
        <SignOutButton>
          <button
            type="button"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-fg-tertiary hover:text-fg hover:bg-active/50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0V2a1 1 0 0 1 1-1ZM4.35 3.76a1 1 0 0 1-.11 1.41A5 5 0 1 0 13 8a5 5 0 0 0-2.24-4.17 1 1 0 1 1 1.11-1.66A7 7 0 1 1 3.76 3.24a1 1 0 0 1 .59.52Z" />
            </svg>
            Sign Out
          </button>
        </SignOutButton>
        <p className="text-xs text-fg-dim px-3 mt-3">&copy; 2026 Rhys Johns</p>
      </div>
    </aside>
  );
}
