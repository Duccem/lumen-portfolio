"use client";

import { useState } from "react";

import { useTween } from "@/components/motion/use-tween";
import type { Property } from "@/lib/data/properties";
import { formatPrice, monthlyPayment } from "@/lib/format";

const TERMS = [15, 20, 25, 30];

/** Set the deposit and the term, read the real monthly figure for this house. */
export function MortgageCalculator({ property: p }: { property: Property }) {
  const [depositPct, setDepositPct] = useState(30);
  const [years, setYears] = useState(25);
  const [rate, setRate] = useState(3.4);

  const deposit = Math.round((p.price * depositPct) / 100);
  const loan = p.price - deposit;
  const monthly = monthlyPayment(loan, rate, years);
  const interest = monthly * years * 12 - loan;

  const shownMonthly = useTween(monthly);
  const shownDeposit = useTween(deposit);

  const mail =
    `mailto:viewings@lintel.example?subject=${encodeURIComponent(`Financing ${p.name}`)}` +
    `&body=${encodeURIComponent(
      `Hello ${p.agent.name.split(" ")[0]},\n\nI am looking at ${p.name} in ${p.town} (${formatPrice(p.price)}) with a ${depositPct}% deposit over ${years} years at ${rate}%. That comes to about ${formatPrice(monthly)} a month.\n\nCould you put me in touch with a mortgage adviser?\n`,
    )}`;

  return (
    <div className="grid gap-10 bg-surface p-6 md:p-10 2xl:grid-cols-[1fr_auto] 2xl:gap-14">
      <div className="space-y-8">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="deposit" className="t-body font-medium">
              Deposit
            </label>
            <span className="tnum">
              {depositPct}% · {formatPrice(Math.round(shownDeposit))}
            </span>
          </div>
          <div className="relative mt-3">
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-surface-2" aria-hidden />
            <div
              className="pointer-events-none absolute left-0 top-1/2 h-[3px] w-full origin-left -translate-y-1/2 bg-ink transition-transform duration-200"
              style={{ transform: `translateY(-50%) scaleX(${(depositPct - 10) / 50})` }}
              aria-hidden
            />
            <input
              id="deposit"
              type="range"
              min={10}
              max={60}
              step={5}
              value={depositPct}
              onChange={(e) => setDepositPct(Number(e.target.value))}
              className="range-single relative"
            />
          </div>
        </div>

        <fieldset>
          <legend className="t-body mb-3 font-medium">Term</legend>
          <div className="grid grid-cols-4 gap-1">
            {TERMS.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={years === t}
                onClick={() => setYears(t)}
                className={`h-11 t-small transition-[background-color,color,transform] duration-200 active:scale-95 ${years === t ? "bg-ink text-bg" : "bg-bg hover:bg-surface-2"}`}
              >
                {t} years
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center justify-between gap-6">
          <label htmlFor="rate" className="t-body font-medium">
            Interest rate
          </label>
          <div className="flex items-center bg-bg">
            <button type="button" aria-label="Lower rate" onClick={() => setRate((r) => Math.max(0.5, +(r - 0.1).toFixed(1)))} className="size-11 transition-[background-color,transform] hover:bg-surface-2 active:scale-90">
              −
            </button>
            <input
              id="rate"
              type="number"
              inputMode="decimal"
              step={0.1}
              min={0.5}
              max={9}
              value={rate}
              onChange={(e) => setRate(Math.min(9, Math.max(0.5, Number(e.target.value) || 0)))}
              className="tnum h-11 w-16 bg-transparent text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button type="button" aria-label="Raise rate" onClick={() => setRate((r) => Math.min(9, +(r + 0.1).toFixed(1)))} className="size-11 transition-[background-color,transform] hover:bg-surface-2 active:scale-90">
              +
            </button>
            <span className="pr-3 t-small">%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between 2xl:min-w-[260px] 2xl:text-right">
        <div aria-live="polite">
          <p className="tnum t-head !leading-none">{formatPrice(Math.round(shownMonthly))}</p>
          <p className="t-body mt-2">a month</p>
          <p className="t-small mt-3 text-soft">
            Loan of {formatPrice(loan)}, about {formatPrice(Math.round(interest))} in interest over {years} years.
          </p>
        </div>
        <a href={mail} className="link mt-8 self-start t-small 2xl:self-end">
          Ask {p.agent.name.split(" ")[0]} about financing
        </a>
      </div>
    </div>
  );
}

/** For houses let by the year: what it costs to move in. */
export function MoveInCost({ property: p }: { property: Property }) {
  const rows = [
    { label: "First month", value: p.price },
    { label: "Security deposit, two months", value: p.price * 2 },
    { label: "Agency fee, one month plus VAT", value: Math.round(p.price * 1.23) },
  ];
  const total = rows.reduce((s, r) => s + r.value, 0);
  return (
    <div className="bg-surface p-6 md:p-10">
      <dl className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-6">
            <dt className="text-soft">{r.label}</dt>
            <dd className="tnum">{formatPrice(r.value)}</dd>
          </div>
        ))}
      </dl>
      <p className="tnum t-head mt-8 !leading-none">{formatPrice(total)}</p>
      <p className="t-body mt-2">to move in</p>
    </div>
  );
}
