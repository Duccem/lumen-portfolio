/**
 * Shopping lists: free-form lists ("2 leches, pan, tomates…") that can be
 * matched against the catalog and converted into a priced basket.
 */
import { buildBasket, type BasketItem } from './basket';
import { CATEGORY_BY_ID, PRODUCTS, STORES, getProduct, type Product, type StoreId } from './catalog';

export type ListEntry = {
  id: string;
  text: string;
  qty: number;
  checked: boolean;
  /** Set when the user explicitly picked a catalog product. */
  productId?: string;
};

export type ShoppingList = {
  id: string;
  name: string;
  emoji: string;
  entries: ListEntry[];
  createdAt: number;
};

export const LIST_EMOJIS = ['🛒', '🥗', '🍝', '🔥', '🎉', '🧁', '🥐', '🏠'];

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// ─── Matching ────────────────────────────────────────────────────────────────

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .trim();

const STOPWORDS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'para', 'con', 'y', 'kg', 'g', 'gr', 'l', 'lt', 'ml']);

/** Very small Spanish singularizer: tomates → tomate, limones → limon, huevos → huevo. */
const singular = (w: string) => {
  if (w.length > 4 && w.endsWith('es') && /[lnrdz]es$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s')) return w.slice(0, -1);
  return w;
};

const tokens = (value: string) =>
  normalize(value)
    .split(/\s+/)
    .filter((t) => t && !STOPWORDS.has(t) && !/^\d+$/.test(t))
    .map(singular);

/** Extra words that should find each product. */
const SYNONYMS: Record<string, string> = {
  avocado: 'aguacate palta',
  banana: 'platano banano',
  spaghetti: 'pasta fideo tallarin',
  beef: 'carne picada molida vacuna',
  chicken: 'pollo pechuga',
  'orange-juice': 'zumo jugo naranja',
  coffee: 'cafe',
  eggs: 'huevo',
  milk: 'leche',
  yogurt: 'yogurt yoghurt',
  'olive-oil': 'aceite oliva',
  bread: 'pan lactal molde',
  baguette: 'pan frances',
  salmon: 'pescado',
  mozzarella: 'queso muzzarella',
  chili: 'aji picante condimento',
  tomato: 'tomate',
};

const INDEX = PRODUCTS.map((p) => ({
  product: p,
  words: new Set(tokens(`${p.name} ${p.brand ?? ''} ${SYNONYMS[p.id] ?? ''} ${CATEGORY_BY_ID[p.category].label}`)),
  name: normalize(p.name),
}));

export type MatchCandidate = { product: Product; score: number };

/** Ranked catalog products for a free-text item. */
export function matchCandidates(text: string, limit = 4): MatchCandidate[] {
  const q = tokens(text);
  if (!q.length) return [];
  const qNorm = normalize(text);

  return INDEX.map(({ product, words, name }) => {
    let hits = 0;
    for (const t of q) {
      if (words.has(t)) hits += 1;
      else if (t.length >= 3 && [...words].some((w) => w.startsWith(t) || t.startsWith(w))) hits += 0.7;
    }
    let score = hits / q.length;
    if (score > 0 && name.startsWith(qNorm)) score += 0.3;
    if (score > 0 && product.popular) score += 0.05;
    return { product, score };
  })
    .filter((m) => m.score >= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** The product an entry resolves to (explicit pick wins over auto-match). */
export function resolveEntry(entry: ListEntry): Product | undefined {
  if (entry.productId) return getProduct(entry.productId);
  return matchCandidates(entry.text, 1)[0]?.product;
}

// ─── Parsing pasted text ─────────────────────────────────────────────────────

/** "2 leches, pan\n3x tomate, huevos x12" → entries. */
export function parseListText(raw: string): ListEntry[] {
  return raw
    .split(/[\n,;•]+|\s+y\s+/i)
    .map((part) => part.replace(/^[-*·\s]+/, '').trim())
    .filter(Boolean)
    .map((part) => {
      let qty = 1;
      let text = part;
      const lead = text.match(/^(\d{1,2})\s*(?:x|u|un|unid\.?|unidades)?\s+(.+)$/i);
      const trail = text.match(/^(.+?)\s+x\s?(\d{1,2})$/i);
      if (lead) {
        qty = Number(lead[1]);
        text = lead[2];
      } else if (trail) {
        text = trail[1];
        qty = Number(trail[2]);
      }
      text = text.charAt(0).toUpperCase() + text.slice(1);
      return { id: newId(), text, qty: Math.max(1, Math.min(99, qty)), checked: false };
    });
}

// ─── Conversion to basket ────────────────────────────────────────────────────

export type Strategy = 'best' | 'single';

export type ConversionLine = { entry: ListEntry; product: Product; storeId: StoreId };

export function convertList(
  list: ShoppingList,
  strategy: Strategy,
  /** For 'single': force a store; otherwise the best one is picked. */
  forcedStore?: StoreId,
) {
  const matched: { entry: ListEntry; product: Product }[] = [];
  const unmatched: ListEntry[] = [];
  for (const entry of list.entries) {
    const product = resolveEntry(entry);
    if (product) matched.push({ entry, product });
    else unmatched.push(entry);
  }

  // Merge duplicate products (e.g. "leche" twice) into one line.
  const qtyByProduct = new Map<string, { product: Product; qty: number; entries: ListEntry[] }>();
  for (const m of matched) {
    const prev = qtyByProduct.get(m.product.id);
    if (prev) {
      prev.qty += m.entry.qty;
      prev.entries.push(m.entry);
    } else qtyByProduct.set(m.product.id, { product: m.product, qty: m.entry.qty, entries: [m.entry] });
  }
  const merged = [...qtyByProduct.values()];

  const cheapest = (p: Product) => [...p.prices].sort((a, b) => a.price - b.price)[0].storeId;

  // Best single store: most products available, then lowest total.
  const storeRanking = STORES.map((store) => {
    let total = 0;
    let available = 0;
    for (const m of merged) {
      const offer = m.product.prices.find((o) => o.storeId === store.id);
      if (offer) {
        total += offer.price * m.qty;
        available += 1;
      }
    }
    return { store, total, available };
  })
    .filter((r) => r.available > 0)
    .sort((a, b) => b.available - a.available || a.total - b.total);

  const singleStore = forcedStore ?? storeRanking[0]?.store.id;

  const items: Record<string, BasketItem> = {};
  for (const m of merged) {
    const atSingle = singleStore && m.product.prices.some((o) => o.storeId === singleStore);
    const storeId = strategy === 'single' && atSingle ? singleStore! : cheapest(m.product);
    items[m.product.id] = { qty: m.qty, storeId };
  }

  const basket = buildBasket(items);

  // Reference: what you'd pay buying each item at its most expensive store.
  const worst = merged.reduce(
    (s, m) => s + Math.max(...m.product.prices.map((o) => o.price)) * m.qty,
    0,
  );

  return {
    items,
    basket,
    merged,
    unmatched,
    storeRanking,
    singleStore,
    savingsVsWorst: Math.max(0, worst - basket.subtotal),
  };
}

/** Cheapest-possible estimate for a list card. */
export function estimateList(list: ShoppingList) {
  const result = convertList(list, 'best');
  return {
    total: result.basket.subtotal,
    matched: list.entries.length - result.unmatched.length,
    count: list.entries.length,
    checked: list.entries.filter((e) => e.checked).length,
  };
}

export const SEED_LISTS: ShoppingList[] = [
  {
    id: 'semanal',
    name: 'Compra semanal',
    emoji: '🛒',
    createdAt: 0,
    entries: [
      { id: 's1', text: 'Leche', qty: 2, checked: false },
      { id: 's2', text: 'Huevos', qty: 1, checked: false },
      { id: 's3', text: 'Tomates', qty: 1, checked: true },
      { id: 's4', text: 'Pan lactal', qty: 1, checked: false },
      { id: 's5', text: 'Bananas', qty: 1, checked: false },
      { id: 's6', text: 'Café', qty: 1, checked: false },
      { id: 's7', text: 'Detergente', qty: 1, checked: false },
    ],
  },
  {
    id: 'pasta',
    name: 'Noche de pastas',
    emoji: '🍝',
    createdAt: 1,
    entries: [
      { id: 'p1', text: 'Fideos', qty: 2, checked: false },
      { id: 'p2', text: 'Tomate', qty: 1, checked: false },
      { id: 'p3', text: 'Ajo', qty: 1, checked: false },
      { id: 'p4', text: 'Aceite de oliva', qty: 1, checked: false },
      { id: 'p5', text: 'Queso', qty: 1, checked: false },
      { id: 'p6', text: 'Carne picada', qty: 1, checked: false },
    ],
  },
];
