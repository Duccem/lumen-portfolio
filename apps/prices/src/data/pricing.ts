import {
  PRODUCTS,
  STORES,
  type CategoryId,
  type Product,
  type StoreId,
  type StorePrice,
} from './catalog';

export type SortOption = 'relevance' | 'price-asc' | 'savings' | 'drop';

export type Filters = {
  sort: SortOption;
  stores: StoreId[];
  maxPrice: number | null;
  onlyDeals: boolean;
};

export const DEFAULT_FILTERS: Filters = {
  sort: 'relevance',
  stores: [],
  maxPrice: null,
  onlyDeals: false,
};

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'relevance', label: 'Relevancia' },
  { id: 'price-asc', label: 'Menor precio' },
  { id: 'savings', label: 'Mayor ahorro' },
  { id: 'drop', label: 'Mayor baja' },
];

export const PRICE_LIMITS: { value: number | null; label: string }[] = [
  { value: null, label: 'Cualquiera' },
  { value: 2, label: 'Hasta $2' },
  { value: 5, label: 'Hasta $5' },
  { value: 10, label: 'Hasta $10' },
];

/** Derived pricing info for a product, optionally restricted to some stores. */
export type PriceSummary = {
  product: Product;
  offers: StorePrice[];
  best: StorePrice;
  highest: StorePrice;
  /** Percent you save buying at the cheapest store vs the most expensive. */
  savingsPct: number;
  /** Largest weekly drop among offers, as a positive percent (0 if none). */
  dropPct: number;
  dropOffer?: StorePrice;
};

export function summarize(product: Product, stores: StoreId[] = []): PriceSummary | null {
  const offers = [
    ...(stores.length ? product.prices.filter((p) => stores.includes(p.storeId)) : product.prices)
  ].sort((a, b) => a.price - b.price);
  if (!offers.length) return null;

  const best = offers[0];
  const highest = offers[offers.length - 1];
  let dropPct = 0;
  let dropOffer: StorePrice | undefined;
  for (const offer of offers) {
    if (!offer.previousPrice || offer.previousPrice <= offer.price) continue;
    const pct = ((offer.previousPrice - offer.price) / offer.previousPrice) * 100;
    if (pct > dropPct) {
      dropPct = pct;
      dropOffer = offer;
    }
  }

  return {
    product,
    offers,
    best,
    highest,
    savingsPct: highest.price > 0 ? ((highest.price - best.price) / highest.price) * 100 : 0,
    dropPct,
    dropOffer,
  };
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export function searchProducts(query: string, category: CategoryId, filters: Filters) {
  const q = normalize(query);

  const results = [...PRODUCTS].filter((p) => category === 'all' || p.category === category)
    .filter((p) => !q || normalize(`${p.name} ${p.brand ?? ''}`).includes(q))
    .map((p) => summarize(p, filters.stores))
    .filter((s): s is PriceSummary => s !== null)
    .filter((s) => filters.maxPrice === null || s.best.price <= filters.maxPrice)
    .filter((s) => !filters.onlyDeals || s.dropPct > 0);

  switch (filters.sort) {
    case 'price-asc':
      return results.sort((a, b) => a.best.price - b.best.price);
    case 'savings':
      return results.sort((a, b) => b.savingsPct - a.savingsPct);
    case 'drop':
      return results.sort((a, b) => b.dropPct - a.dropPct);
    default:
      // Relevance: name-prefix matches first, then popular items.
      return results.sort((a, b) => {
        if (q) {
          const aPrefix = normalize(a.product.name).startsWith(q) ? 0 : 1;
          const bPrefix = normalize(b.product.name).startsWith(q) ? 0 : 1;
          if (aPrefix !== bPrefix) return aPrefix - bPrefix;
        }
        return Number(!!b.product.popular) - Number(!!a.product.popular);
      });
  }
}

export function recentDrops(category: CategoryId) {
  return [...PRODUCTS].filter((p) => category === 'all' || p.category === category)
    .map((p) => summarize(p))
    .filter((s): s is PriceSummary => s !== null && s.dropPct > 0)
    .sort((a, b) => b.dropPct - a.dropPct);
}

/** How many products each store has the lowest price for. */
export function storeLeaderboard() {
  const wins = new Map<StoreId, number>();
  for (const product of PRODUCTS) {
    const s = summarize(product);
    if (s) wins.set(s.best.storeId, (wins.get(s.best.storeId) ?? 0) + 1);
  }
  return STORES.map((store) => ({ store, wins: wins.get(store.id) ?? 0 })).sort(
    (a, b) => b.wins - a.wins,
  );
}

/** Mock "weekly savings" figure: buying every popular item at its cheapest store. */
export function weeklySavings() {
  let total = 0;
  for (const product of [...PRODUCTS].filter((p) => p.popular)) {
    const s = summarize(product);
    if (s) total += s.highest.price - s.best.price;
  }
  return total;
}

export function activeFilterCount(filters: Filters) {
  return (
    (filters.sort !== 'relevance' ? 1 : 0) +
    (filters.stores.length ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.onlyDeals ? 1 : 0)
  );
}

export const formatPrice = (value: number) => `$${value.toFixed(2)}`;

/** "$4.20/kg"-style unit price, or null when the unit isn't weight/volume. */
export function unitPrice(price: number, unit: string): string | null {
  const m = unit.trim().toLowerCase().match(/^([\d.,]+)\s*(kg|g|l|ml)$/);
  if (!m) return null;
  const amount = Number(m[1].replace(',', '.'));
  if (!amount) return null;
  const [base, label] =
    m[2] === 'kg' ? [amount, 'kg'] : m[2] === 'g' ? [amount / 1000, 'kg'] : m[2] === 'l' ? [amount, 'L'] : [amount / 1000, 'L'];
  if (base === 1) return null; // already per kg / L
  return `${formatPrice(price / base)}/${label}`;
}
