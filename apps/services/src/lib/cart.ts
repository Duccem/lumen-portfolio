"use client";

import { getPart } from "./data/parts";
import { createStore } from "./store";

export type CartLine = { sku: string; qty: number };

export const cartStore = createStore<CartLine[]>("bayseven.basket", []);

export function addToCart(sku: string, qty = 1) {
  const part = getPart(sku);
  if (!part) return;
  cartStore.set((lines) => {
    const found = lines.find((l) => l.sku === sku);
    if (found) return lines.map((l) => (l.sku === sku ? { ...l, qty: Math.min(part.stock, l.qty + qty) } : l));
    return [...lines, { sku, qty: Math.min(part.stock, qty) }];
  });
}

export function setQty(sku: string, qty: number) {
  const part = getPart(sku);
  if (!part) return;
  cartStore.set((lines) =>
    qty <= 0 ? lines.filter((l) => l.sku !== sku) : lines.map((l) => (l.sku === sku ? { ...l, qty: Math.min(part.stock, qty) } : l)),
  );
}

export function cartDetail(lines: CartLine[]) {
  const rows = lines
    .map((l) => {
      const p = getPart(l.sku);
      return p ? { ...p, qty: l.qty, line: p.price * l.qty } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  return { rows, count: rows.reduce((s, r) => s + r.qty, 0), total: rows.reduce((s, r) => s + r.line, 0) };
}
