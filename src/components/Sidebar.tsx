"use client";

import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/lib/types";
import { getProfile } from "@/lib/storage";
import BeltBadge from "./BeltBadge";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "◉" },
  { href: "/journal", label: "Journal", icon: "✎" },
  { href: "/promotions", label: "Promotions", icon: "▲" },
  { href: "/profile", label: "Profile", icon: "●" },
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
    <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col z-50">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-lg font-bold text-white tracking-tight">
          Ground Karate
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">BJJ Training Journal</p>
      </div>

      {profile && (
        <div className="px-6 py-4 border-b border-zinc-800">
          <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">
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
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-600 px-3 mb-1">
          {profileLoadError ? "Profile unavailable" : profile?.name ?? "Set up your profile"}
        </p>
        <SignOutButton>
          <button
            type="button"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            <span className="text-base">⏻</span>
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
