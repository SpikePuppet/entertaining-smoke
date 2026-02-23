"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { BeltColor } from "@/lib/types";
import { BELTS, getMaxStripes } from "@/lib/belts";
import { createPromotion } from "@/lib/storage";
import Breadcrumb from "@/components/Breadcrumb";

export default function NewPromotionPage() {
  const router = useRouter();
  const [belt, setBelt] = useState<BeltColor>("white");
  const [stripes, setStripes] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const maxStripes = getMaxStripes(belt);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await createPromotion({
      belt,
      stripes: Math.min(stripes, maxStripes),
      date,
      notes: notes.trim() || undefined,
    });
    router.push("/promotions");
  }

  return (
    <div className="max-w-xl">
      <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Promotions", href: "/promotions" }, { label: "Record Promotion" }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Record Promotion</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Belt Selector */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
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

        {/* Date */}
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this promotion..."
            rows={3}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg text-sm font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Promotion"}
          </button>
          <Link
            href="/promotions"
            className="px-4 py-2 text-zinc-400 hover:text-white text-sm transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
