"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import FadeInSection from "@/components/FadeInSection";
import { labSites, type LabSite } from "@/data/lab-sites";
import { readLabFavorites, sortByLabFavorites, toggleLabFavorite } from "@/lib/lab-favorites";

const CATEGORY_ORDER: LabSite["category"][] = [
  "interactive-portfolio",
  "brand-experience",
  "b2b-tech",
  "data-viz",
];

const difficultyColor: Record<LabSite["difficulty"], string> = {
  상: "bg-red-500/10 text-red-400 border-red-500/30",
  중: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  하: "bg-green-500/10 text-green-400 border-green-500/30",
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2.5l2.55 5.87 6.37.55-4.82 4.18 1.45 6.22L12 16.9l-5.55 2.92 1.45-6.22-4.82-4.18 6.37-.55L12 2.5z" />
    </svg>
  );
}

function FavoriteButton({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={active ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={`rounded-md p-1 transition-colors ${
        active
          ? "text-amber-400 hover:text-amber-300"
          : "text-text-muted hover:text-amber-400/80"
      }`}
    >
      <StarIcon filled={active} />
    </button>
  );
}

function LabSiteCard({
  site,
  isFavorite,
  onToggleFavorite,
}: {
  site: LabSite;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
}) {
  return (
    <Link
      href={`/lab/${site.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-bg-secondary p-5 transition-colors hover:border-accent"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-text-primary group-hover:text-accent">{site.title}</h3>
        <div className="flex shrink-0 items-center gap-1">
          <FavoriteButton active={isFavorite} onToggle={() => onToggleFavorite(site.slug)} />
          <span
            className={`rounded-full border px-2 py-0.5 text-xs ${difficultyColor[site.difficulty]}`}
          >
            {site.difficulty}
          </span>
        </div>
      </div>
      <span className="mt-1 inline-block w-fit rounded-full border border-border px-2 py-0.5 text-xs text-text-muted">
        {site.confidence}
      </span>
      <p className="mt-3 line-clamp-2 text-sm text-text-secondary">{site.concept}</p>
    </Link>
  );
}

export default function LabSiteGrid() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readLabFavorites());
  }, []);

  const handleToggleFavorite = useCallback((slug: string) => {
    setFavorites(toggleLabFavorite(slug));
  }, []);

  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        categoryLabel:
          labSites.find((site) => site.category === category)?.categoryLabel ?? category,
        sites: sortByLabFavorites(
          labSites.filter((site) => site.category === category),
          favorites,
        ),
      })),
    [favorites],
  );

  return (
    <>
      {grouped.map(({ category, categoryLabel, sites }) => (
        <FadeInSection
          key={category}
          className="mx-auto w-full max-w-[1200px] px-6 py-12"
        >
          <h2 className="text-xl font-bold text-text-primary">{categoryLabel}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <LabSiteCard
                key={site.slug}
                site={site}
                isFavorite={favorites.includes(site.slug)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        </FadeInSection>
      ))}
    </>
  );
}
