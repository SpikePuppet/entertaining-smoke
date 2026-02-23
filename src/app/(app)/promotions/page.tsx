"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PromotionEntry } from "@/lib/types";
import { getPromotions } from "@/lib/storage";
import PromotionCard from "@/components/PromotionCard";
import Breadcrumb from "@/components/Breadcrumb";
import StateCard from "@/components/StateCard";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setLoadError(null);

      try {
        const p = await getPromotions();
        if (!isMounted) return;
        setPromotions(p.sort((a, b) => b.date.localeCompare(a.date)));
      } catch {
        if (!isMounted) return;
        setLoadError("We couldn't load your promotions right now.");
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
  }, [reloadKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-3xl">
        <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Promotions" }]} />
        <StateCard
          title="Promotions unavailable"
          description={loadError}
          actionLabel="Try Again"
          onAction={() => setReloadKey((value) => value + 1)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Promotions" }]} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Promotions</h1>
          <p className="text-zinc-500 text-sm">Your belt progression timeline</p>
        </div>
        <Link
          href="/promotions/new"
          className="text-sm px-4 py-2 rounded-md bg-zinc-100 text-zinc-900 font-medium hover:bg-white transition-colors"
        >
          + Record Promotion
        </Link>
      </div>

      {promotions.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-500 text-sm mb-4">
            No promotions recorded yet. Track your belt journey!
          </p>
          <Link
            href="/promotions/new"
            className="text-sm px-4 py-2 rounded-md bg-zinc-800 text-white hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            Record Promotion
          </Link>
        </div>
      ) : (
        <div className="mt-4">
          {promotions.map((promo, i) => (
            <PromotionCard
              key={promo.id}
              promotion={promo}
              isLast={i === promotions.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
