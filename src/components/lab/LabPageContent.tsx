"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import FadeInSection from "@/components/FadeInSection";
import {
  CATEGORY_LABELS,
  CONFIDENCE_LABELS,
  DIFFICULTY_LABELS,
  labSites,
  type LabSite,
} from "@/data/lab-sites";
import { readLabFavorites, readLabFavoritesOnly, sortByLabFavorites, writeLabFavorites, writeLabFavoritesOnly } from "@/lib/lab-favorites";
import { useLocale } from "@/i18n/LocaleProvider";
import { UI } from "@/i18n/strings";
import type { Locale } from "@/i18n/config";

const CATEGORY_ORDER: LabSite["category"][] = [
  "interactive-portfolio",
  "brand-experience",
  "b2b-tech",
  "data-viz",
];

const difficultyColor: Record<LabSite["difficulty"], string> = {
  high: "bg-red-500/10 text-red-400 border-red-500/30",
  mid: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/10 text-green-400 border-green-500/30",
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
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

function FavoritesOnlyToggle({
  enabled,
  onChange,
  count,
  locale,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
  count: number;
  locale: Locale;
}) {
  return (
    <label className="flex shrink-0 cursor-pointer select-none items-center gap-2.5 rounded-full border border-border bg-bg-secondary px-3 py-2 text-sm text-text-secondary transition-colors hover:border-accent/40">
      <span className={`${enabled ? "text-amber-400" : "text-text-muted"}`}>
        <StarIcon filled={enabled} />
      </span>
      <span className="whitespace-nowrap text-xs sm:text-sm">{UI.featuredOnly[locale]}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={UI.featuredOnlyAria[locale]}
        onClick={() => onChange(!enabled)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          enabled ? "bg-accent" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      {enabled ? (
        <span className="font-mono text-[10px] tabular-nums text-text-muted">{count}</span>
      ) : null}
    </label>
  );
}

function FavoriteButton({
  active,
  onToggle,
  locale,
}: {
  active: boolean;
  onToggle: () => void;
  locale: Locale;
}) {
  return (
    <button
      type="button"
      aria-label={active ? UI.removeFavorite[locale] : UI.addFavorite[locale]}
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
  locale,
}: {
  site: LabSite;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
  locale: Locale;
}) {
  return (
    <Link
      href={`/lab/${site.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-bg-secondary p-5 transition-colors hover:border-accent"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-text-primary group-hover:text-accent">{site.title}</h3>
        <div className="flex shrink-0 items-center gap-1">
          <FavoriteButton active={isFavorite} onToggle={() => onToggleFavorite(site.slug)} locale={locale} />
          <span
            className={`rounded-full border px-2 py-0.5 text-xs ${difficultyColor[site.difficulty]}`}
          >
            {DIFFICULTY_LABELS[site.difficulty][locale]}
          </span>
        </div>
      </div>
      <span className="mt-1 inline-block w-fit rounded-full border border-border px-2 py-0.5 text-xs text-text-muted">
        {CONFIDENCE_LABELS[site.confidence][locale]}
      </span>
      <p className="mt-3 line-clamp-2 text-sm text-text-secondary">{site.concept[locale]}</p>
    </Link>
  );
}

async function fetchFavorites(): Promise<string[]> {
  const res = await fetch("/api/favorites");
  if (!res.ok) return [];
  const data = (await res.json()) as { favorites: string[] };
  return data.favorites ?? [];
}

async function saveFavorites(favorites: string[]): Promise<void> {
  await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ favorites }),
  });
}

export default function LabPageContent() {
  const { locale } = useLocale();
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const syncedRef = useRef(false);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    setFavoritesOnly(readLabFavoritesOnly());
  }, []);

  // 로그인 상태가 결정되면 즐겨찾기 로드
  useEffect(() => {
    if (status === "loading") return;

    if (isLoggedIn && !syncedRef.current) {
      syncedRef.current = true;
      void fetchFavorites().then((serverFavorites) => {
        // 서버에 저장된 것이 없으면 localStorage를 마이그레이션
        if (serverFavorites.length === 0) {
          const local = readLabFavorites();
          if (local.length > 0) {
            void saveFavorites(local);
            setFavorites(local);
            return;
          }
        }
        setFavorites(serverFavorites);
        writeLabFavorites(serverFavorites);
      });
    } else if (!isLoggedIn) {
      setFavorites(readLabFavorites());
    }
  }, [status, isLoggedIn]);

  const handleToggleFavorite = useCallback(
    (slug: string) => {
      setFavorites((prev) => {
        const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
        if (isLoggedIn) {
          void saveFavorites(next);
        } else {
          writeLabFavorites(next);
        }
        return next;
      });
    },
    [isLoggedIn],
  );

  const handleFavoritesOnlyChange = useCallback((enabled: boolean) => {
    setFavoritesOnly(enabled);
    writeLabFavoritesOnly(enabled);
  }, []);

  const grouped = useMemo(() => {
    const favoriteSet = new Set(favorites);
    return CATEGORY_ORDER.map((category) => ({
      category,
      categoryLabel: CATEGORY_LABELS[category],
      sites: sortByLabFavorites(
        labSites.filter(
          (site) =>
            site.category === category && (!favoritesOnly || favoriteSet.has(site.slug)),
        ),
        favorites,
      ),
    })).filter((group) => !favoritesOnly || group.sites.length > 0);
  }, [favorites, favoritesOnly]);

  const favoriteCount = favorites.length;

  return (
    <>
      <section className="mx-auto w-full max-w-[1200px] px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-5xl">
            Lab
          </h1>
          <FavoritesOnlyToggle
            enabled={favoritesOnly}
            onChange={handleFavoritesOnlyChange}
            count={favoriteCount}
            locale={locale}
          />
        </div>
        <p className="mt-6 max-w-2xl text-text-secondary">{UI.labIntro[locale]}</p>
      </section>

      {favoritesOnly && grouped.length === 0 ? (
        <section className="mx-auto w-full max-w-[1200px] px-6 pb-16">
          <p className="rounded-lg border border-border bg-bg-secondary px-5 py-8 text-center text-sm text-text-secondary">
            {UI.noFavorites[locale]}
          </p>
        </section>
      ) : (
        grouped.map(({ category, categoryLabel, sites }) => (
          <FadeInSection
            key={category}
            className="mx-auto w-full max-w-[1200px] px-6 py-12"
          >
            <h2 className="text-xl font-bold text-text-primary">{categoryLabel[locale]}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sites.map((site) => (
                <LabSiteCard
                  key={site.slug}
                  site={site}
                  isFavorite={favorites.includes(site.slug)}
                  onToggleFavorite={handleToggleFavorite}
                  locale={locale}
                />
              ))}
            </div>
          </FadeInSection>
        ))
      )}
    </>
  );
}
