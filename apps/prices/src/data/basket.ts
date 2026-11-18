import { STORES, STORE_BY_ID, getProduct, type Product, type Store, type StoreId, type StorePrice } from './catalog';

export type BasketItem = { qty: number; storeId: StoreId };

export const DELIVERY_FEE = 2.5;

export type BasketLine = {
  product: Product;
  qty: number;
  /** Offer at the chosen store (falls back to the cheapest if the store dropped it). */
  offer: StorePrice;
  cheapest: StorePrice;
  subtotal: number;
  /** Money saved per line if switched to the cheapest store. */
  potentialSaving: number;
};

export type StoreGroup = {
  store: Store;
  lines: BasketLine[];
  subtotal: number;
  delivery: number;
  /** Amount left to reach free delivery, if applicable. */
  toFreeDelivery: number | null;
};

export type StoreQuote = {
  store: Store;
  total: number;
  available: number;
  missing: number;
};

export function deliveryFor(store: Store, subtotal: number) {
  if (store.freeDeliveryFrom === undefined) return DELIVERY_FEE;
  return subtotal >= store.freeDeliveryFrom ? 0 : DELIVERY_FEE;
}

export function buildBasket(items: Record<string, BasketItem>) {
  const lines: BasketLine[] = [];
  for (const [id, item] of Object.entries(items)) {
    const product = getProduct(id);
    if (!product) continue;
    const sorted = [...product.prices].sort((a, b) => a.price - b.price);
    const cheapest = sorted[0];
    const offer = product.prices.find((p) => p.storeId === item.storeId) ?? cheapest;
    lines.push({
      product,
      qty: item.qty,
      offer,
      cheapest,
      subtotal: offer.price * item.qty,
      potentialSaving: (offer.price - cheapest.price) * item.qty,
    });
  }

  const groups: StoreGroup[] = STORES.map((store) => {
    const storeLines = lines.filter((l) => l.offer.storeId === store.id);
    const subtotal = storeLines.reduce((s, l) => s + l.subtotal, 0);
    const delivery = storeLines.length ? deliveryFor(store, subtotal) : 0;
    const toFreeDelivery =
      store.freeDeliveryFrom !== undefined && delivery > 0 ? store.freeDeliveryFrom - subtotal : null;
    return { store, lines: storeLines, subtotal, delivery, toFreeDelivery };
  }).filter((g) => g.lines.length > 0);

  const subtotal = groups.reduce((s, g) => s + g.subtotal, 0);
  const delivery = groups.reduce((s, g) => s + g.delivery, 0);
  const units = lines.reduce((s, l) => s + l.qty, 0);
  const optimizedSubtotal = lines.reduce((s, l) => s + l.cheapest.price * l.qty, 0);
  const potentialSaving = subtotal - optimizedSubtotal;

  // What would the whole basket cost at a single store?
  const quotes: StoreQuote[] = STORES.map((store) => {
    let total = 0;
    let available = 0;
    for (const l of lines) {
      const offer = l.product.prices.find((p) => p.storeId === store.id);
      if (offer) {
        total += offer.price * l.qty;
        available += 1;
      }
    }
    return { store, total: total + (available ? deliveryFor(store, total) : 0), available, missing: lines.length - available };
  })
    .filter((q) => q.available > 0)
    .sort((a, b) => b.available - a.available || a.total - b.total);

  return {
    lines,
    groups,
    subtotal,
    delivery,
    total: subtotal + delivery,
    units,
    potentialSaving,
    quotes,
  };
}

export const storeName = (id: StoreId) => STORE_BY_ID[id].name;
