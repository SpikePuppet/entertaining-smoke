"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import type { UserProfile, BeltColor } from "@/lib/types";
import { getProfile, createProfile, updateProfile } from "@/lib/storage";
import { BELTS, getMaxStripes } from "@/lib/belts";
import BeltBadge from "@/components/BeltBadge";
import Breadcrumb from "@/components/Breadcrumb";
import StateCard from "@/components/StateCard";

export default function ProfilePage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [belt, setBelt] = useState<BeltColor>("white");
  const [stripes, setStripes] = useState(0);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const maxStripes = getMaxStripes(belt);

  useEffect(() => {
    if (!isLoaded) return;

    let isMounted = true;

    async function load() {
      setLoading(true);
      setLoadError(null);
      setProfile(null);

      if (!userId) {
        if (!isMounted) return;
        setName("");
        setAcademyName("");
        setBelt("white");
        setStripes(0);
        setIsNew(true);
        setLoading(false);
        return;
      }

      try {
        const p = await getProfile();
        if (!isMounted) return;

        if (p) {
          if (p.id !== userId) {
            setLoadError("Account mismatch detected. Please sign out and sign back in.");
            setIsNew(true);
            return;
          }
          setProfile(p);
          setName(p.name);
          setAcademyName(p.academyName ?? "");
          setBelt(p.currentBelt);
          setStripes(p.currentStripes);
          setIsNew(false);
        } else {
          setProfile(null);
          setName("");
          setAcademyName("");
          setBelt("white");
          setStripes(0);
          setIsNew(true);
        }
      } catch {
        if (!isMounted) return;
        setLoadError("We couldn't load your profile right now.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [reloadKey, userId, isLoaded]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    if (isNew) {
      const createdProfile = await createProfile({
        name: name.trim(),
        academyName: academyName.trim() || undefined,
        currentBelt: belt,
        currentStripes: Math.min(stripes, maxStripes),
      });
      setProfile(createdProfile);
      setIsNew(false);
      router.push("/");
    } else {
      const p = await updateProfile({
        name: name.trim(),
        academyName: academyName.trim() || undefined,
        currentBelt: belt,
        currentStripes: Math.min(stripes, maxStripes),
      });
      setProfile(p);
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-fg-muted">Loading...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-xl">
        <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Profile" }]} />
        <StateCard
          title="Profile unavailable"
          description={loadError}
          actionLabel="Try Again"
          onAction={() => setReloadKey((value) => value + 1)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: isNew ? "Set Up Profile" : "Profile" }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-fg mb-1">
          {isNew ? "Set Up Your Profile" : "Profile"}
        </h1>
        <p className="text-fg-muted text-sm">
          {isNew
            ? "Welcome! Let's get you set up."
            : "Manage your training profile."}
        </p>
      </div>

      {profile && !isNew && (
        <div className="bg-surface border border-border rounded-lg p-6 mb-8">
          <p className="text-xs text-fg-muted uppercase tracking-wider mb-3">
            Current Rank
          </p>
          <BeltBadge
            belt={profile.currentBelt}
            stripes={profile.currentStripes}
            size="lg"
          />
          <p className="text-xs text-fg-dim mt-4">
            Member since{" "}
            {new Date(profile.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-fg-secondary mb-2"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full px-3 py-2 bg-surface border border-border-strong rounded-lg text-fg text-sm placeholder:text-fg-dim focus:outline-none focus:border-border-focus transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="academy"
            className="block text-sm font-medium text-fg-secondary mb-2"
          >
            Academy Name
          </label>
          <input
            id="academy"
            type="text"
            value={academyName}
            onChange={(e) => setAcademyName(e.target.value)}
            placeholder="Your academy (optional)"
            className="w-full px-3 py-2 bg-surface border border-border-strong rounded-lg text-fg text-sm placeholder:text-fg-dim focus:outline-none focus:border-border-focus transition-colors"
          />
        </div>

        {/* Belt Selector */}
        <div>
          <label className="block text-sm font-medium text-fg-secondary mb-3">
            Current Belt
          </label>
          <div className="grid grid-cols-4 gap-2">
            {BELTS.map((b) => (
              <button
                key={b.color}
                type="button"
                onClick={() => {
                  setBelt(b.color);
                  setStripes(0);
                }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                  belt === b.color
                    ? "border-border-focus bg-active"
                    : "border-border bg-surface hover:border-border-strong"
                }`}
              >
                <div
                  className="w-full h-4 rounded-sm"
                  style={{
                    backgroundColor: b.hex,
                    border: b.color === "white" ? "1px solid #555" : "none",
                  }}
                />
                <span className="text-xs text-fg-tertiary text-center leading-tight">
                  {b.label.replace(" Belt", "")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stripes / Degrees */}
        {maxStripes > 0 && (
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-2">
              {belt === "black" ? "Degree" : "Stripes"}
            </label>
            <div className="flex gap-2">
              {Array.from({ length: maxStripes + 1 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStripes(i)}
                  className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all ${
                    stripes === i
                      ? "border-border-focus bg-active text-fg"
                      : "border-border bg-surface text-fg-muted hover:border-border-strong"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="px-4 py-2 bg-btn-primary-bg text-btn-primary-fg rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : isNew ? "Get Started" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
