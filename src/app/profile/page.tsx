"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile, BeltColor } from "@/lib/types";
import { getProfile, createProfile, updateProfile } from "@/lib/storage";
import { BELTS, getMaxStripes } from "@/lib/belts";
import BeltBadge from "@/components/BeltBadge";
import Breadcrumb from "@/components/Breadcrumb";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [belt, setBelt] = useState<BeltColor>("white");
  const [stripes, setStripes] = useState(0);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const maxStripes = getMaxStripes(belt);

  useEffect(() => {
    async function load() {
      const p = await getProfile();
      if (p) {
        setProfile(p);
        setName(p.name);
        setAcademyName(p.academyName ?? "");
        setBelt(p.currentBelt);
        setStripes(p.currentStripes);
      } else {
        setIsNew(true);
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    if (isNew) {
      const p = await createProfile({
        name: name.trim(),
        academyName: academyName.trim() || undefined,
      });
      // Update belt/stripes right after creation
      const updated = await updateProfile({
        currentBelt: belt,
        currentStripes: Math.min(stripes, maxStripes),
      });
      setProfile(updated);
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

  return (
    <div className="max-w-xl">
      <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: isNew ? "Set Up Profile" : "Profile" }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          {isNew ? "Set Up Your Profile" : "Profile"}
        </h1>
        <p className="text-zinc-500 text-sm">
          {isNew
            ? "Welcome! Let's get you set up."
            : "Manage your training profile."}
        </p>
      </div>

      {profile && !isNew && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
            Current Rank
          </p>
          <BeltBadge
            belt={profile.currentBelt}
            stripes={profile.currentStripes}
            size="lg"
          />
          <p className="text-xs text-zinc-600 mt-4">
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
            className="block text-sm font-medium text-zinc-300 mb-2"
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
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="academy"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            Academy Name
          </label>
          <input
            id="academy"
            type="text"
            value={academyName}
            onChange={(e) => setAcademyName(e.target.value)}
            placeholder="Your academy (optional)"
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Belt Selector */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
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
                    ? "border-zinc-500 bg-zinc-800"
                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                }`}
              >
                <div
                  className="w-full h-4 rounded-sm"
                  style={{
                    backgroundColor: b.hex,
                    border: b.color === "white" ? "1px solid #555" : "none",
                  }}
                />
                <span className="text-xs text-zinc-400 text-center leading-tight">
                  {b.label.replace(" Belt", "")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stripes / Degrees */}
        {maxStripes > 0 && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
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
                      ? "border-zinc-500 bg-zinc-800 text-white"
                      : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700"
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
          className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg text-sm font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : isNew ? "Get Started" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
