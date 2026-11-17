"use client";

import { Check, Minus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { formatDayTime, formatMoney, formatRelative, formatTime } from "@/lib/format";
import { useNow } from "@/lib/store";
import {
  decisionStore,
  demoTickets,
  findTicket,
  type PartsTicket,
  partsStatus,
  type RepairTicket,
  repairStatus,
  type TimelineStage,
  ticketStore,
} from "@/lib/tickets";

import { KeyTag } from "../key-tag";
import { TrackerForm } from "../tracker-form";

export function Tracker() {
  const params = useSearchParams();
  const query = params.get("t") ?? "";
  const now = useNow(10000);
  const own = ticketStore.useValue();
  const ticket = now && query ? findTicket(query, own) : null;

  return (
    <div className="grid gap-2 lg:grid-cols-12">
      <div className="flex flex-col gap-2 lg:col-span-4">
        <div className="tile bg-field text-field-ink">
          <h2 className="t-lead mb-5 font-medium">Find a car</h2>
          <TrackerForm key={query} initial={query} showTag={false} />
        </div>
        <YourTickets own={own} now={now} current={ticket?.id} />
      </div>

      <div className="lg:col-span-8">
        {!query ? (
          <Empty />
        ) : now === null ? (
          <div className="h-[560px] rounded-tile bg-surface" />
        ) : ticket ? (
          ticket.kind === "repair" ? (
            <RepairCard key={ticket.id} ticket={ticket} now={now} />
          ) : (
            <PartsCard key={ticket.id} ticket={ticket} now={now} />
          )
        ) : (
          <NotFound query={query} />
        )}
      </div>
    </div>
  );
}

/* ---------- Repair job card ---------- */

function RepairCard({ ticket, now }: { ticket: RepairTicket; now: number }) {
  const decisions = decisionStore.useValue();
  const status = repairStatus(ticket, now, decisions[ticket.id]);
  const stage = status.current >= 0 ? status.stages[status.current] : null;

  const headline =
    status.current < 0
      ? "Booked"
      : status.awaitingApproval
        ? "Waiting for your answer"
        : stage!.id === "quote" && ticket.price === null
          ? status.declined
            ? "Quote declined"
            : "Quote approved"
          : stage!.name;
  const sub =
    status.current < 0
      ? `Drop-off ${formatDayTime(ticket.appointment)}, ${formatRelative(ticket.appointment, now)}.`
      : stage?.id === "ready"
        ? status.declined
          ? "Quote declined. The car is ready to collect, no work done."
          : "Keys are at the desk. Bring your tag number."
        : status.readyAt
          ? `Expected ready about ${formatTime(status.readyAt)}, ${formatRelative(status.readyAt, now)}.`
          : "The ready time depends on your answer to the quote.";

  const decide = (approved: boolean) => {
    decisionStore.set((d) => ({ ...d, [ticket.id]: { approved, at: Date.now() } }));
    toast(approved ? `Quote approved for ${ticket.id}. Parts are being ordered.` : `Quote declined for ${ticket.id}. No work will be done.`);
  };

  return (
    <article className="grid gap-2" aria-labelledby="card-title">
      {/* Header tile */}
      <div className="enter grid items-center gap-6 rounded-tile bg-surface p-6 md:grid-cols-[auto_1fr] md:gap-10 md:px-8 md:py-[76px]">
        <KeyTag id={ticket.id} tone={stage?.id === "ready" ? "paper" : "crimson"} swing className="w-[72px] md:w-[96px]" />
        <div>
          <h2 id="card-title" className="t-head flex items-center gap-4">
            {stage && stage.id !== "ready" ? <span className="pulse-dot size-3 shrink-0 rounded-full bg-crimson" aria-hidden /> : null}
            {headline}
          </h2>
          <p className="mt-3 t-body">{sub}</p>
          <p className="mt-5 t-body">
            <span className="tnum font-medium">{ticket.id}</span>, {ticket.car.make} {ticket.car.model}, {ticket.car.year},
            plate <span className="tnum">{ticket.car.plate}</span>
          </p>
        </div>
      </div>

      {/* Facts */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-tile bg-surface p-6 md:grid-cols-4 md:p-8">
        <Fact label="Job" value={ticket.serviceName} i={1} />
        <Fact label="Price" value={status.total === null ? "After inspection" : formatMoney(status.total)} i={2} />
        <Fact label="Drop-off" value={formatDayTime(ticket.appointment)} i={3} />
        <Fact label="Mileage" value={ticket.car.mileage ?? "Not given"} i={4} />
      </dl>

      {/* Quote, when it needs an answer or has one */}
      {ticket.quote && status.current >= 2 ? (
        <section
          className={`enter rounded-tile p-6 md:p-8 ${status.awaitingApproval ? "bg-field text-field-ink" : "bg-surface"}`}
          aria-labelledby="quote-title"
          style={{ ["--i" as string]: 2 }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 id="quote-title" className="t-lead font-medium">
              Quote
            </h3>
            {!status.awaitingApproval ? (
              <span className="t-small text-soft">{status.declined ? "Declined" : "Approved"}</span>
            ) : null}
          </div>
          <table className="mt-5 w-full t-body">
            <tbody>
              {ticket.quote.map((l) => (
                <tr key={l.label}>
                  <td className="py-1.5 pr-4">{l.label}</td>
                  <td className="tnum py-1.5 text-right">{formatMoney(l.price)}</td>
                </tr>
              ))}
              <tr className="font-medium">
                <td className="pt-4">Total</td>
                <td className="tnum pt-4 text-right">{formatMoney(ticket.quote.reduce((s, l) => s + l.price, 0))}</td>
              </tr>
            </tbody>
          </table>
          {status.awaitingApproval ? (
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" className="btn" onClick={() => decide(true)}>
                <Check className="size-4" strokeWidth={2} aria-hidden />
                Approve the work
              </button>
              <button type="button" className="btn btn-quiet !bg-[#dcdcdc] !text-field-ink hover:!bg-[#cfcfcf]" onClick={() => decide(false)}>
                Decline, just collect
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      <Stages stages={status.stages} current={status.current} now={now} />

      {ticket.notes ? (
        <p className="rounded-tile bg-surface p-6 t-body md:p-8">
          <span className="t-small text-soft">Your note at booking</span>
          <br />
          {ticket.notes}
        </p>
      ) : null}
    </article>
  );
}

/* ---------- Parts job card ---------- */

function PartsCard({ ticket, now }: { ticket: PartsTicket; now: number }) {
  const status = partsStatus(ticket, now);
  const stage = status.stages[status.current];
  const total = ticket.items.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <article className="grid gap-2" aria-labelledby="card-title">
      <div className="enter grid items-center gap-6 rounded-tile bg-surface p-6 md:grid-cols-[auto_1fr] md:gap-10 md:px-8 md:py-[76px]">
        <KeyTag id={ticket.id} tone={stage.id === "ready" ? "paper" : "crimson"} swing className="w-[72px] md:w-[96px]" />
        <div>
          <h2 id="card-title" className="t-head flex items-center gap-4">
            {stage.id !== "ready" ? <span className="pulse-dot size-3 shrink-0 rounded-full bg-crimson" aria-hidden /> : null}
            {stage.name}
          </h2>
          <p className="mt-3 t-body">
            {stage.id === "ready"
              ? "Pay and collect at the parts counter. Bring this number."
              : `Ready at the counter about ${formatTime(status.readyAt)}, ${formatRelative(status.readyAt, now)}.`}
          </p>
          <p className="mt-5 t-body">
            <span className="tnum font-medium">{ticket.id}</span>, parts reserved {formatDayTime(ticket.createdAt)}
          </p>
        </div>
      </div>
      <section className="enter rounded-tile bg-surface p-6 md:p-8" style={{ ["--i" as string]: 1 }} aria-label="Reserved parts">
        <table className="w-full t-body">
          <tbody>
            {ticket.items.map((i) => (
              <tr key={i.sku}>
                <td className="py-1.5 pr-4">
                  {i.name}
                  <span className="tnum t-small text-soft"> · {i.sku}</span>
                </td>
                <td className="tnum py-1.5 pr-4 text-right text-soft">× {i.qty}</td>
                <td className="tnum py-1.5 text-right">{formatMoney(i.price * i.qty)}</td>
              </tr>
            ))}
            <tr className="font-medium">
              <td className="pt-4" colSpan={2}>
                To pay at the counter
              </td>
              <td className="tnum pt-4 text-right">{formatMoney(total)}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <Stages stages={status.stages} current={status.current} now={now} />
    </article>
  );
}

/* ---------- Shared ---------- */

function Stages({ stages, current, now }: { stages: TimelineStage[]; current: number; now: number }) {
  return (
    <ol className="grid gap-1.5" aria-label="Stages">
      {stages.map((s, i) => {
        const tone =
          s.state === "current"
            ? "bg-crimson text-white"
            : s.state === "done"
              ? "bg-surface-2"
              : s.state === "skipped"
                ? "bg-surface text-soft line-through decoration-1"
                : "bg-surface text-soft";
        return (
          <li
            key={s.id}
            className={`enter grid grid-cols-[28px_1fr] gap-x-4 rounded-tile px-5 py-4 md:grid-cols-[28px_1fr_auto] md:px-6 ${tone}`}
            style={{ ["--i" as string]: i + 2 }}
            aria-current={s.state === "current" ? "step" : undefined}
          >
            <span className="mt-0.5 grid size-7 place-items-center rounded-full bg-black/25" aria-hidden>
              {s.state === "done" ? <span className="size-2.5 rounded-full bg-ink" /> : s.state === "skipped" ? <Minus className="size-4" /> : null}
              {s.state === "current" ? <span className="size-2.5 rounded-full bg-white" /> : null}
            </span>
            <div>
              <p className="text-[18px] font-medium">{s.name}</p>
              <p className={`mt-0.5 t-body ${s.state === "next" || s.state === "skipped" ? "text-soft" : ""}`}>{s.line}</p>
              {s.note && (s.state === "done" || s.state === "current") ? (
                <p className={`mt-2 t-body ${s.state === "current" ? "" : "text-ink"}`}>{s.note}</p>
              ) : null}
            </div>
            <p className="col-start-2 mt-2 t-small tnum md:col-start-3 md:mt-0 md:text-right">
              {s.at === null ? "" : s.at <= now ? formatTime(s.at) : `about ${formatTime(s.at)}`}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function Fact({ label, value, i }: { label: string; value: string; i: number }) {
  return (
    <div className="enter" style={{ ["--i" as string]: i }}>
      <dt className="t-small text-soft">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}

function YourTickets({ own, now, current }: { own: (RepairTicket | PartsTicket)[]; now: number | null; current?: string }) {
  const decisions = decisionStore.useValue();
  const list = now ? [...own, ...demoTickets()] : [];
  if (!list.length) return null;
  return (
    <section className="tile bg-surface" aria-labelledby="tickets-title">
      <h2 id="tickets-title" className="t-lead mb-4 font-medium">
        On the board
      </h2>
      <ul className="space-y-1.5">
        {list.map((t) => {
          const label =
            t.kind === "repair"
              ? (() => {
                  const s = repairStatus(t, now!, decisions[t.id]);
                  return s.current < 0 ? "Booked" : s.awaitingApproval ? "Quote waiting" : s.stages[s.current].name;
                })()
              : PARTS_LABEL(partsStatus(t, now!).current);
          const on = t.id === current;
          return (
            <li key={t.id}>
              <Link
                href={{ pathname: "/track", query: { t: t.id } }}
                className={`flex items-center justify-between gap-3 rounded-tile px-4 py-3 transition-[background-color,transform] duration-200 active:scale-[0.98] ${
                  on ? "bg-crimson text-white" : "bg-surface-2 hover:bg-surface-3"
                }`}
              >
                <span>
                  <span className="tnum font-medium">{t.id}</span>
                  <span className={`block t-small ${on ? "text-white/85" : "text-soft"}`}>
                    {t.kind === "repair" ? `${t.car.make} ${t.car.model}` : `${t.items.length} parts`}
                    {"demo" in t && t.demo ? " · sample" : ""}
                  </span>
                </span>
                <span className="t-small text-right">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const PARTS_LABEL = (i: number) => ["Reserved", "Being picked", "At the counter"][i];

function Empty() {
  return (
    <div className="enter flex min-h-[420px] flex-col justify-end rounded-tile bg-surface p-6 md:min-h-[560px] md:p-10">
      <KeyTag id="B7-2048" tone="dark" className="mb-auto w-[110px] self-end" />
      <h2 className="t-head max-w-[14ch]">Every car hangs on the board by its tag</h2>
      <p className="mt-4 max-w-[52ch] t-body">
        You get the number when you book, and it's written on the tag that holds your keys. Type it here to see the
        stage, the mechanic's notes and the quote waiting for your answer.
      </p>
    </div>
  );
}

function NotFound({ query }: { query: string }) {
  return (
    <div className="enter flex min-h-[420px] flex-col justify-end rounded-tile bg-surface p-6 md:p-10">
      <h2 className="t-head max-w-[16ch]">No tag with that number</h2>
      <p className="mt-4 max-w-[52ch] t-body">
        We couldn't find <span className="tnum font-medium">{query}</span> on the board. Numbers look like B7-2048
        for a repair or P7-1234 for parts. Bookings made on another phone or browser are not visible here; call the
        desk and we'll read it out.
      </p>
    </div>
  );
}
