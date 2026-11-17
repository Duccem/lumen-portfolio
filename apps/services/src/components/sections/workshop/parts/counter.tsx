"use client";

import { ArrowRight, Minus, Plus, Search, X } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { addToCart, cartDetail, cartStore, setQty } from "@/lib/cart";
import { PART_CATEGORIES, PARTS } from "@/lib/data/parts";
import { formatMoney } from "@/lib/format";
import { newId, type PartsTicket, ticketStore } from "@/lib/tickets";

export function Counter() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const cat = PART_CATEGORIES.find((c) => c.id === params.get("c")) ?? null;
  const [q, setQ] = useState("");
  const lines = cartStore.useValue();
  const inCart = new Map(lines.map((l) => [l.sku, l.qty]));

  const pick = (id: string | null) => {
    const url = id ? `${pathname}?c=${id}` : pathname;
    router.replace(url as Route, { scroll: false });
  };

  const needle = q.trim().toLowerCase();
  const list = PARTS.filter(
    (p) =>
      (!cat || p.category === cat.id) &&
      (!needle || `${p.name} ${p.sku} ${p.fits}`.toLowerCase().includes(needle)),
  );

  const hero = cat ?? PART_CATEGORIES[0];

  return (
    <div className="grid gap-2 lg:grid-cols-12">
      <div className="grid gap-2 lg:col-span-8">
        {/* The chosen category as a photograph, the others as bars beside it */}
        <div className="grid gap-2 md:grid-cols-8">
          <div className="tile tile-photo relative aspect-[4/3] md:col-span-5 md:aspect-auto md:min-h-[360px]">
            <Image key={hero.id} src={hero.image.src} alt={hero.image.alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="enter object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-black/55 p-5">
              <div>
                <p className="t-lead font-medium text-white">{cat ? cat.name : "All parts"}</p>
                <p className="t-small text-white/85">{cat ? cat.line : `${PARTS.length} lines on the shelf, ready in about 25 minutes`}</p>
              </div>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-1.5 md:col-span-3 md:grid-cols-1" aria-label="Categories">
            {[{ id: null, name: "All parts" }, ...PART_CATEGORIES].map((c) => {
              const on = (cat?.id ?? null) === c.id;
              return (
                <li key={c.name}>
                  <button
                    type="button"
                    onClick={() => pick(c.id)}
                    aria-pressed={on}
                    className={`flex h-full min-h-12 w-full items-center justify-between rounded-tile px-4 text-left t-small font-medium transition-[background-color,transform] duration-200 active:scale-[0.97] ${
                      on ? "bg-crimson text-white" : "bg-surface hover:bg-surface-2"
                    }`}
                  >
                    {c.name}
                    <span className="tnum opacity-70">{c.id ? PARTS.filter((p) => p.category === c.id).length : PARTS.length}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Search */}
        <label className="relative block">
          <span className="sr-only">Search parts by name, part number or car</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-soft" strokeWidth={1.8} aria-hidden />
          <input className="field !min-h-14 !pl-12" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by part, number or car, e.g. Golf" />
        </label>

        {/* The shelf */}
        <ul className="grid gap-1.5" aria-label="Parts">
          {list.map((p, i) => {
            const qty = inCart.get(p.sku) ?? 0;
            return (
              <li
                key={p.sku}
                className="enter grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 rounded-tile bg-surface px-5 py-4 md:grid-cols-[1fr_120px_150px] md:px-6"
                style={{ ["--i" as string]: Math.min(i, 8) }}
              >
                <div className="min-w-0">
                  <p className="t-body font-medium">{p.name}</p>
                  <p className="mt-0.5 t-body">
                    <span className="tnum text-soft">{p.sku}</span> · Fits {p.fits}
                  </p>
                </div>
                <div className="text-right md:text-left">
                  <p className="tnum t-body">{formatMoney(p.price)}</p>
                  <p className={`t-small ${p.stock <= 2 ? "text-[#ff6b7d]" : "text-soft"}`}>{p.stock <= 2 ? `Only ${p.stock} left` : `${p.stock} on the shelf`}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  {qty ? (
                    <Stepper sku={p.sku} qty={qty} max={p.stock} />
                  ) : (
                    <button
                      type="button"
                      className="btn btn-quiet w-full"
                      onClick={() => {
                        addToCart(p.sku);
                        toast(`${p.name} added to your basket`);
                      }}
                    >
                      Reserve
                    </button>
                  )}
                </div>
              </li>
            );
          })}
          {list.length === 0 ? (
            <li className="rounded-tile bg-surface p-6 t-body">
              Nothing on the shelf matches “{q}”. Call the desk: most parts arrive from our suppliers the same afternoon.
            </li>
          ) : null}
        </ul>
      </div>

      <Basket />
    </div>
  );
}

function Stepper({ sku, qty, max, light = false }: { sku: string; qty: number; max: number; light?: boolean }) {
  const bg = light ? "bg-[#dcdcdc] hover:bg-[#cfcfcf]" : "bg-surface-2 hover:bg-surface-3";
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Quantity">
      <button type="button" className={`grid size-12 place-items-center rounded-full transition-[background-color,transform] active:scale-90 ${bg}`} onClick={() => setQty(sku, qty - 1)} aria-label="One less">
        <Minus className="size-4" strokeWidth={2} />
      </button>
      <span key={qty} className="bump tnum min-w-[3ch] text-center text-[17px]">
        {qty}
      </span>
      <button
        type="button"
        disabled={qty >= max}
        className={`grid size-12 place-items-center rounded-full transition-[background-color,transform] active:scale-90 disabled:opacity-40 ${bg}`}
        onClick={() => setQty(sku, qty + 1)}
        aria-label="One more"
      >
        <Plus className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

function Basket() {
  const router = useRouter();
  const lines = cartStore.useValue();
  const own = ticketStore.useValue();
  const { rows, count, total } = cartDetail(lines);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tried, setTried] = useState(false);
  const ok = name.trim().length > 1 && phone.replace(/\D/g, "").length >= 7;

  const reserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ok) {
      setTried(true);
      return;
    }
    const ticket: PartsTicket = {
      kind: "parts",
      id: newId("P7", own.map((t) => t.id)),
      createdAt: Date.now(),
      items: rows.map((r) => ({ sku: r.sku, name: r.name, price: r.price, qty: r.qty })),
      customer: { name: name.trim(), phone: phone.trim() },
    };
    ticketStore.set((l) => [ticket, ...l]);
    cartStore.set([]);
    router.push(`/track?t=${ticket.id}` as Route);
  };

  return (
    <aside id="basket" className="on-field rounded-tile bg-field p-5 text-field-ink md:p-7 lg:sticky lg:top-20 lg:col-span-4 lg:self-start" aria-labelledby="basket-title">
      <div className="flex items-baseline justify-between">
        <h2 id="basket-title" className="t-lead font-medium">
          Basket
        </h2>
        <span className="tnum t-small text-field-soft">{count} items</span>
      </div>
      {rows.length === 0 ? (
        <p className="mt-4 t-body text-field-soft">Nothing reserved yet. Parts you reserve are held at the counter under one number.</p>
      ) : (
        <>
          <ul className="mt-5 space-y-1.5">
            {rows.map((r) => (
              <li key={r.sku} className="enter rounded-[6px] bg-[#e2e2e2] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="t-small font-medium">{r.name}</p>
                  <button type="button" className="-mr-2 -mt-1 grid size-8 shrink-0 place-items-center rounded-full hover:bg-[#d0d0d0]" onClick={() => setQty(r.sku, 0)} aria-label={`Remove ${r.name}`}>
                    <X className="size-4" strokeWidth={1.8} />
                  </button>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <Stepper sku={r.sku} qty={r.qty} max={r.stock} light />
                  <span className="tnum">{formatMoney(r.line)}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between">
            <span>To pay at the counter</span>
            <span className="tnum t-lead">{formatMoney(total)}</span>
          </div>
          <form onSubmit={reserve} className="mt-6 grid gap-3" noValidate>
            <label className="grid gap-1.5">
              <span className="t-small font-medium">
                Name{tried && name.trim().length < 2 ? <span className="ml-2 text-crimson">needed</span> : null}
              </span>
              <input className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <span className="t-small font-medium">
                Phone{tried && phone.replace(/\D/g, "").length < 7 ? <span className="ml-2 text-crimson">needed</span> : null}
              </span>
              <input className="field tnum" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <button type="submit" className="btn group mt-2 w-full">
              Reserve for pickup
              <ArrowRight className="arrow size-4" strokeWidth={1.8} aria-hidden />
            </button>
            <p className="t-small text-field-soft">Nothing is charged online. Pay by card or cash when you collect.</p>
          </form>
        </>
      )}
    </aside>
  );
}
