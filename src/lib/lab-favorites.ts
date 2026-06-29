const STORAGE_KEY = "lab-favorites";

export function readLabFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function writeLabFavorites(slugs: string[]): string[] {
  if (typeof window === "undefined") return slugs;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  return slugs;
}

export function toggleLabFavorite(slug: string): string[] {
  const current = readLabFavorites();
  const index = current.indexOf(slug);
  const next = index >= 0 ? current.filter((s) => s !== slug) : [...current, slug];
  return writeLabFavorites(next);
}

export function sortByLabFavorites<T extends { slug: string }>(items: T[], favorites: string[]): T[] {
  const favoriteSet = new Set(favorites);
  const favorited = favorites
    .map((slug) => items.find((item) => item.slug === slug))
    .filter((item): item is T => item !== undefined);
  const rest = items.filter((item) => !favoriteSet.has(item.slug));
  return [...favorited, ...rest];
}
