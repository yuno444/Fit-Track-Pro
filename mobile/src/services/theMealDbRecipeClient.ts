import type { EdamamNormalizedRecipe, RecipeSearchFilters } from "../types/edamamRecipe";

const BASE = "https://www.themealDB.com/api/json/v1/1";

type RawMeal = Record<string, unknown>;

function mealString(m: RawMeal, key: string): string {
  const v = m[key];
  return typeof v === "string" ? v : "";
}

function buildIngredientLines(m: RawMeal): string[] {
  const lines: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = mealString(m, `strIngredient${i}`).trim();
    if (!ing) continue;
    const meas = mealString(m, `strMeasure${i}`).trim();
    lines.push(meas ? `${meas} ${ing}` : ing);
  }
  return lines;
}

function parseYieldServings(m: RawMeal): number {
  const y = mealString(m, "strYield").trim();
  if (!y) return 1;
  const n = parseInt(y.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function mealPageUrl(id: string): string {
  return `https://www.themealDB.com/meal/${id}`;
}

export function lookupSelfHrefForId(id: string): string {
  return `${BASE}/lookup.php?i=${encodeURIComponent(id)}`;
}

function rawMealToNormalized(m: RawMeal): EdamamNormalizedRecipe | null {
  const id = mealString(m, "idMeal").trim();
  const label = mealString(m, "strMeal").trim();
  if (!id || !label) return null;
  const area = mealString(m, "strArea").trim();
  const cat = mealString(m, "strCategory").trim();
  const sourceBits = ["TheMealDB", area, cat].filter(Boolean);
  const source = sourceBits.join(" · ");
  const extUrl = mealString(m, "strSource").trim();
  const url = extUrl || mealPageUrl(id);
  const image = mealString(m, "strMealThumb").trim() || undefined;
  const selfHref = lookupSelfHrefForId(id);

  return {
    uri: `themealdb:${id}`,
    label,
    image,
    source,
    url,
    yieldServings: parseYieldServings(m),
    ingredientLines: buildIngredientLines(m),
    calories: undefined,
    proteinG: undefined,
    carbsG: undefined,
    fatG: undefined,
    selfHref,
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TheMealDB request failed (${res.status}).`);
  }
  return res.json();
}

export async function lookupMealById(id: string): Promise<RawMeal | null> {
  const json = (await fetchJson(lookupSelfHrefForId(id))) as { meals?: RawMeal[] | null };
  const meal = json.meals?.[0];
  return meal && typeof meal === "object" ? meal : null;
}

export type RecipeSearchResult = {
  hits: EdamamNormalizedRecipe[];
  count: number;
};

async function idsFromIngredientFilter(token: string): Promise<Set<string>> {
  const q = token.trim();
  const out = new Set<string>();
  if (!q) return out;

  const filterJson = (await fetchJson(`${BASE}/filter.php?i=${encodeURIComponent(q)}`)) as {
    meals?: RawMeal[] | null;
  };
  const thin = Array.isArray(filterJson.meals) ? filterJson.meals : [];
  for (const row of thin) {
    if (!row || typeof row !== "object") continue;
    const id = mealString(row as RawMeal, "idMeal").trim();
    if (id) out.add(id);
  }
  return out;
}

function intersectSets(sets: Set<string>[]): Set<string> {
  if (sets.length === 0) return new Set();
  let acc = sets[0]!;
  for (let i = 1; i < sets.length; i++) {
    const next = new Set<string>();
    for (const id of acc) {
      if (sets[i]!.has(id)) next.add(id);
    }
    acc = next;
    if (acc.size === 0) break;
  }
  return acc;
}

async function searchRecipesSingleKeyword(keyword: string): Promise<Map<string, EdamamNormalizedRecipe>> {
  const q = keyword.trim();
  const byId = new Map<string, EdamamNormalizedRecipe>();
  if (!q) return byId;

  const searchJson = (await fetchJson(`${BASE}/search.php?s=${encodeURIComponent(q)}`)) as {
    meals?: RawMeal[] | null;
  };
  const searchMeals = Array.isArray(searchJson.meals) ? searchJson.meals : [];

  for (const raw of searchMeals) {
    if (!raw || typeof raw !== "object") continue;
    const norm = rawMealToNormalized(raw as RawMeal);
    const idKey = mealString(raw as RawMeal, "idMeal");
    if (norm && idKey) byId.set(idKey, norm);
  }

  if (byId.size === 0) {
    const filterIds = await idsFromIngredientFilter(q);
    const ids = [...filterIds].slice(0, 25);
    const fullRows = await Promise.all(ids.map((id) => lookupMealById(id)));
    for (const raw of fullRows) {
      if (!raw) continue;
      const norm = rawMealToNormalized(raw);
      if (norm) byId.set(mealString(raw, "idMeal"), norm);
    }
  }

  return byId;
}

/** When pantry is empty, Discover still runs a broad browse search via TheMealDB (`search.php`). */
export const DISCOVER_FALLBACK_TERM = "chicken";

/** Joined pantry string for UI labels only (not for API queries). */
export function pantryJoinedQuery(pantryNames: string[]): string {
  return pantryNames.map((n) => n.trim()).filter(Boolean).join(" ").trim();
}

/** One token per pantry ingredient — used so TheMealDB can match each filter; empty pantry → `[DISCOVER_FALLBACK_TERM]`. */
export function discoverSearchTokensFromPantry(pantryNames: string[]): string[] {
  const parts = pantryNames.map((n) => n.trim()).filter(Boolean);
  const cleaned = dedupeTokens(parts);
  if (cleaned.length === 0) return [DISCOVER_FALLBACK_TERM];
  return cleaned;
}

function dedupeTokens(tokens: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const raw of tokens) {
    const t = raw.trim();
    if (!t) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push(t);
  }
  return unique;
}

/**
 * Search TheMealDB. Multiple tokens are intersected through `filter.php?i=` (meals containing every ingredient).
 */
export async function searchRecipesFromTokens(tokens: string[], _filters: RecipeSearchFilters = {}): Promise<RecipeSearchResult> {
  const cleaned = dedupeTokens(tokens);

  void _filters;

  if (cleaned.length === 0) {
    return { hits: [], count: 0 };
  }

  if (cleaned.length === 1) {
    const map = await searchRecipesSingleKeyword(cleaned[0]!);
    const hits = [...map.values()];
    return { hits, count: hits.length };
  }

  const idLists = await Promise.all(cleaned.map((t) => idsFromIngredientFilter(t)));
  const overlap = intersectSets(idLists);

  if (overlap.size === 0 && cleaned.length > 1) {
    const map = await searchRecipesSingleKeyword(cleaned[0]!);
    const hitsWide = [...map.values()];
    return { hits: hitsWide, count: hitsWide.length };
  }

  const ids = [...overlap].slice(0, 35);

  if (ids.length === 0) {
    return { hits: [], count: 0 };
  }

  const fullRows = await Promise.all(ids.map((id) => lookupMealById(id)));
  const hits: EdamamNormalizedRecipe[] = [];
  for (const raw of fullRows) {
    if (!raw) continue;
    const norm = rawMealToNormalized(raw);
    if (norm) hits.push(norm);
  }

  return { hits, count: hits.length };
}

/**
 * Search TheMealDB instead of Edamam (since MealDB is a free public API that doesn't require API keys). `filters` is ignored.
 * Treats the whole string as a single phrase/keyword search.
 */
export async function searchRecipes(query: string, filters: RecipeSearchFilters = {}): Promise<RecipeSearchResult> {
  void filters;
  const q = query.trim();
  if (!q) return { hits: [], count: 0 };
  const map = await searchRecipesSingleKeyword(q);
  return { hits: [...map.values()], count: map.size };
}

function extractIdFromHref(href: string): string | null {
  try {
    const u = new URL(href);
    const i = u.searchParams.get("i");
    if (i?.trim()) return i.trim();
  } catch {
    /* fall through */
  }
  const m = href.match(/[?&]i=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Fetch full meal by TheMealDB `lookup.php?i=` URL or compatible href. */
export async function fetchRecipeBySelfHref(selfHref: string): Promise<EdamamNormalizedRecipe | null> {
  const fromQuery = extractIdFromHref(selfHref);
  if (fromQuery) {
    const raw = await lookupMealById(fromQuery);
    return raw ? rawMealToNormalized(raw) : null;
  }
  return null;
}
