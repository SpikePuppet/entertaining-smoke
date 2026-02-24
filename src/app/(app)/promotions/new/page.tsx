"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { BeltColor } from "@/lib/types";
import { BELTS, getMaxStripes } from "@/lib/belts";
import { getLocalDateInputValue } from "@/lib/dates";
import { createPromotion, getProfile } from "@/lib/storage";
import Breadcrumb from "@/components/Breadcrumb";

export default function NewPromotionPage() {
  const router = useRouter();
  const [belt, setBelt] = useState<BeltColor>("white");
  const [stripes, setStripes] = useState(0);
  const [date, setDate] = useState(getLocalDateInputValue);
  const [notes, setNotes] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [saving, setSaving] = useState(false);

  const maxStripes = getMaxStripes(belt);

  useEffect(() => {
    let isMounted = true;

    async function loadProfileAcademy() {
      try {
        const profile = await getProfile();
        if (!isMounted || !profile?.academyName) return;
        setAcademyName(profile.academyName);
      } catch {
        // Ignore prefill errors and keep field empty/editable.
      }
    }

    loadProfileAcademy();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await createPromotion({
      belt,
      stripes: Math.min(stripes, maxStripes),
      date,
      notes: notes.trim() || undefined,
      academyName: academyName.trim() || undefined,
    });
    router.push("/promotions");
  }

  return (
    <div className="max-w-xl">
      <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Promotions", href: "/promotions" }, { label: "Record Promotion" }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-fg">Record Promotion</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Belt Selector */}
        <div>
          <label className="block text-sm font-medium text-fg-secondary mb-3">
            Belt
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

        {/* Date */}
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-fg-secondary mb-2"
          >
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-border-strong rounded-lg text-fg text-sm focus:outline-none focus:border-border-focus transition-colors"
          />
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-fg-secondary mb-2"
          >
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this promotion..."
            rows={3}
            className="w-full px-3 py-2 bg-surface border border-border-strong rounded-lg text-fg text-sm placeholder:text-fg-dim focus:outline-none focus:border-border-focus transition-colors resize-none"
          />
        </div>

        {/* School */}
        <div>
          <label
            htmlFor="academyName"
            className="block text-sm font-medium text-fg-secondary mb-2"
          >
            School / Academy
          </label>
          <input
            id="academyName"
            type="text"
            value={academyName}
            onChange={(e) => setAcademyName(e.target.value)}
            placeholder="Where did this promotion happen?"
            className="w-full px-3 py-2 bg-surface border border-border-strong rounded-lg text-fg text-sm placeholder:text-fg-dim focus:outline-none focus:border-border-focus transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-btn-primary-bg text-btn-primary-fg rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Promotion"}
          </button>
          <Link
            href="/promotions"
            className="px-4 py-2 text-fg-tertiary hover:text-fg text-sm transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
