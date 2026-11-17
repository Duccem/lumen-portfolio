"use client";

import { ArrowLeft, ArrowRight, CalendarPlus, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { BOOKABLE, getBookable, MAKES, WORKSHOP } from "@/lib/data/services";
import { formatDay, formatDayTime, formatMoney, formatTime } from "@/lib/format";
import { useNow } from "@/lib/store";
import { bookableDays, liftsFree, newId, type RepairTicket, slotsFor, ticketStore } from "@/lib/tickets";

import { KeyTag } from "../key-tag";

const PARTS = ["Service", "Car", "Time", "You"] as const;
type Part = (typeof PARTS)[number];

type Draft = {
  serviceId: string;
  make: string;
  model: string;
  year: string;
  plate: string;
  mileage: string;
  day: string | null; // ISO date
  hour: number | null;
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export function Booking() {
  const params = useSearchParams();
  const now = useNow(60000);
  const own = ticketStore.useValue();
  const [part, setPart] = useState<Part>("Service");
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<RepairTicket | null>(null);
  const [d, setD] = useState<Draft>(() => ({
    serviceId: getBookable(params.get("s") ?? "")?.id ?? "",
    make: "",
    model: "",
    year: "",
    plate: "",
    mileage: "",
    day: null,
    hour: null,
    name: "",
    phone: "",
    email: "",
    notes: "",
  }));
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  const service = getBookable(d.serviceId);
  const days = useMemo(() => (now ? bookableDays(now, 12) : []), [now]);
  const when = d.day !== null && d.hour !== null ? atHour(d.day, d.hour) : null;

  const valid: Record<Part, boolean> = {
    Service: !!service,
    Car: !!d.make && d.model.trim().length > 0 && /^\d{4}$/.test(d.year) && d.plate.trim().length >= 3,
    Time: !!when,
    You: d.name.trim().length > 1 && d.phone.replace(/\D/g, "").length >= 7 && /.+@.+\..+/.test(d.email),
  };
  const index = PARTS.indexOf(part);

  const next = () => {
    if (!valid[part]) {
      setTried(true);
      return;
    }
    setTried(false);
    if (index < PARTS.length - 1) {
      setPart(PARTS[index + 1]);
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (!service || !when) return;
    const ticket: RepairTicket = {
      kind: "repair",
      id: newId("B7", own.map((t) => t.id)),
      createdAt: Date.now(),
      appointment: when.getTime(),
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      minutes: service.minutes,
      car: { make: d.make, model: d.model.trim(), year: d.year, plate: d.plate.trim().toUpperCase(), mileage: d.mileage.trim() || undefined },
      customer: { name: d.name.trim(), phone: d.phone.trim(), email: d.email.trim() },
      notes: d.notes.trim() || undefined,
      // Sample quote the demo "finds" at inspection for jobs that are not fixed price.
      quote:
        service.price === null
          ? service.id === "brakes"
            ? [
                { label: "Front brake pads, ceramic", price: 54.9 },
                { label: "Labour, 1 h", price: 52.5 },
                { label: "Brake fluid change", price: 59 },
              ]
            : [
                { label: "Diagnosis", price: 59 },
                { label: "Labour, 1.5 h", price: 78.75 },
              ]
          : undefined,
    };
    ticketStore.set((list) => [ticket, ...list]);
    setDone(ticket);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) return <Confirmation ticket={done} />;

  return (
    <div id="booking" className="grid scroll-mt-20 gap-2 lg:grid-cols-12">
      {/* The form tile */}
      <div className="rounded-tile bg-surface p-5 md:p-8 lg:col-span-8">
        <nav aria-label="Booking parts" className="grid grid-cols-4 gap-1.5">
          {PARTS.map((p, i) => {
            const reachable = PARTS.slice(0, i).every((q) => valid[q]);
            const state = p === part ? "bg-crimson text-white" : valid[p] && reachable ? "bg-field text-field-ink" : "bg-surface-2 text-soft";
            return (
              <button
                key={p}
                type="button"
                disabled={!reachable}
                onClick={() => {
                  setTried(false);
                  setPart(p);
                }}
                aria-current={p === part ? "step" : undefined}
                className={`min-h-12 rounded-tile px-3 text-left t-small font-medium transition-[background-color,transform] duration-200 active:scale-[0.97] disabled:cursor-not-allowed ${state}`}
              >
                {p}
              </button>
            );
          })}
        </nav>

        <div key={part} className="mt-8 md:mt-10">
          {part === "Service" ? (
            <fieldset>
              <legend className="t-lead mb-5 font-medium">What does the car need?</legend>
              <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-2">
                {BOOKABLE.map((s, i) => {
                  const on = d.serviceId === s.id;
                  return (
                    <label
                      key={s.id}
                      className={`enter flex min-h-[132px] cursor-pointer flex-col rounded-tile p-5 transition-[background-color,transform] duration-200 active:scale-[0.985] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink ${
                        on ? "bg-crimson text-white" : "bg-surface-2 hover:bg-surface-3"
                      }`}
                      style={{ ["--i" as string]: i }}
                    >
                      <input type="radio" name="service" className="sr-only" checked={on} onChange={() => set("serviceId", s.id)} />
                      <span className="flex items-baseline justify-between gap-4">
                        <span className="text-[18px] font-medium">{s.name}</span>
                        <span className="tnum whitespace-nowrap">{s.price === null ? "Quoted" : formatMoney(s.price)}</span>
                      </span>
                      <span className={`mt-2 t-body ${on ? "text-white" : "text-ink"}`}>{s.line}</span>
                      <span className={`mt-auto pt-3 t-small ${on ? "text-white/85" : "text-soft"}`}>About {duration(s.minutes)}</span>
                    </label>
                  );
                })}
              </div>
              {tried && !valid.Service ? <Hint>Choose one to continue.</Hint> : null}
            </fieldset>
          ) : null}

          {part === "Car" ? (
            <fieldset>
              <legend className="t-lead mb-5 font-medium">Which car is coming in?</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Make" error={tried && !d.make}>
                  <span className="relative block">
                    <select className="field" value={d.make} onChange={(e) => set("make", e.target.value)}>
                      <option value="">Choose a make</option>
                      {MAKES.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2" aria-hidden />
                  </span>
                </Field>
                <Field label="Model and engine" error={tried && !d.model.trim()}>
                  <input className="field" value={d.model} onChange={(e) => set("model", e.target.value)} placeholder="Golf 1.6 TDI" />
                </Field>
                <Field label="Year" error={tried && !/^\d{4}$/.test(d.year)}>
                  <input
                    className="field tnum"
                    inputMode="numeric"
                    maxLength={4}
                    value={d.year}
                    onChange={(e) => set("year", e.target.value.replace(/\D/g, ""))}
                    placeholder="2017"
                  />
                </Field>
                <Field label="Number plate" error={tried && d.plate.trim().length < 3}>
                  <input className="field tnum uppercase" value={d.plate} onChange={(e) => set("plate", e.target.value)} placeholder="4KT 208" autoComplete="off" />
                </Field>
                <Field label="Mileage, if you know it" className="sm:col-span-2">
                  <input className="field tnum" inputMode="numeric" value={d.mileage} onChange={(e) => set("mileage", e.target.value)} placeholder="118,400" />
                </Field>
              </div>
            </fieldset>
          ) : null}

          {part === "Time" ? (
            <fieldset>
              <legend className="t-lead mb-2 font-medium">When can you drop it off?</legend>
              <p className="mb-5 t-small text-soft">Each square is one of our seven lifts. Crimson ones are free at that hour.</p>
              <div className="-mx-5 flex snap-x gap-1.5 overflow-x-auto px-5 pb-2 md:-mx-8 md:px-8" role="radiogroup" aria-label="Day">
                {days.map((day, i) => {
                  const iso = isoDay(day);
                  const on = d.day === iso;
                  return (
                    <button
                      key={iso}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setD((x) => ({ ...x, day: iso, hour: null }))}
                      className={`enter min-h-[76px] w-[92px] shrink-0 snap-start rounded-tile px-3 py-2.5 text-left transition-[background-color,transform] duration-200 active:scale-[0.96] ${
                        on ? "bg-crimson text-white" : "bg-surface-2 hover:bg-surface-3"
                      }`}
                      style={{ ["--i" as string]: i }}
                    >
                      <span className="block t-small opacity-80">{i === 0 && now && isoDay(new Date(now)) === iso ? "Today" : day.toLocaleDateString("en-GB", { weekday: "short" })}</span>
                      <span className="block text-[20px] tnum">{day.getDate()}</span>
                      <span className="block t-small opacity-80">{day.toLocaleDateString("en-GB", { month: "short" })}</span>
                    </button>
                  );
                })}
              </div>

              {d.day ? (
                <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3" role="radiogroup" aria-label="Hour">
                  {slotsFor(new Date(`${d.day}T12:00:00`)).map((h, i) => {
                    const at = atHour(d.day!, h);
                    const past = now !== null && at.getTime() < now + 30 * 60000;
                    const free = past ? 0 : liftsFree(at, own);
                    const on = d.hour === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        disabled={free === 0}
                        onClick={() => set("hour", h)}
                        className={`enter flex min-h-[84px] flex-col justify-between rounded-tile p-3.5 text-left transition-[background-color,transform] duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 ${
                          on ? "bg-field text-field-ink" : "bg-surface-2 enabled:hover:bg-surface-3"
                        }`}
                        style={{ ["--i" as string]: i }}
                      >
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="text-[18px] tnum">{formatTime(at)}</span>
                          <span className="t-small opacity-80">{past ? "Gone" : free === 0 ? "Full" : `${free} free`}</span>
                        </span>
                        <Lifts free={free} light={on} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 rounded-tile bg-surface-2 p-5 text-soft">Choose a day to see the free lifts.</p>
              )}
              {tried && !valid.Time ? <Hint>Choose a day and an hour.</Hint> : null}
            </fieldset>
          ) : null}

          {part === "You" ? (
            <fieldset>
              <legend className="t-lead mb-5 font-medium">Who do we call when it's ready?</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" error={tried && d.name.trim().length < 2}>
                  <input className="field" autoComplete="name" value={d.name} onChange={(e) => set("name", e.target.value)} />
                </Field>
                <Field label="Phone" error={tried && d.phone.replace(/\D/g, "").length < 7}>
                  <input className="field tnum" type="tel" autoComplete="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} />
                </Field>
                <Field label="Email" className="sm:col-span-2" error={tried && !/.+@.+\..+/.test(d.email)}>
                  <input className="field" type="email" autoComplete="email" value={d.email} onChange={(e) => set("email", e.target.value)} />
                </Field>
                <Field label="Anything we should know?" className="sm:col-span-2">
                  <textarea
                    className="field"
                    value={d.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="A noise from the front left when braking, worse when cold."
                  />
                </Field>
              </div>
              <p className="mt-5 t-small text-soft">
                This demo keeps your booking in this browser only. Nothing is sent anywhere.
              </p>
            </fieldset>
          ) : null}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          {index > 0 ? (
            <button type="button" className="btn btn-quiet" onClick={() => setPart(PARTS[index - 1])}>
              <ArrowLeft className="size-4" strokeWidth={1.8} aria-hidden />
              Back
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="btn group" onClick={next}>
            {index === PARTS.length - 1 ? "Book and get my tag" : `Next: ${PARTS[index + 1].toLowerCase()}`}
            <ArrowRight className="arrow size-4" strokeWidth={1.8} aria-hidden />
          </button>
        </div>
      </div>

      {/* Summary tile: the job card filling in */}
      <aside className="rounded-tile bg-field p-5 text-field-ink md:p-8 lg:sticky lg:top-20 lg:col-span-4 lg:self-start" aria-label="Your booking">
        <div className="flex items-start gap-5">
          <KeyTag id="B7-····" tone="crimson" className="w-[84px] shrink-0" />
          <div>
            <p className="t-lead font-medium">Job card</p>
            <p className="mt-1 t-small text-field-soft">Your tag number is issued when you book.</p>
          </div>
        </div>
        <dl className="mt-6 space-y-1.5">
          <Row label="Job" value={service?.name} />
          <Row label="Price" value={service ? (service.price === null ? "Quoted after inspection" : formatMoney(service.price)) : undefined} />
          <Row label="Car" value={d.make && d.model ? `${d.make} ${d.model}${d.year ? `, ${d.year}` : ""}` : undefined} />
          <Row label="Plate" value={d.plate ? d.plate.toUpperCase() : undefined} />
          <Row label="Drop-off" value={when ? formatDayTime(when) : undefined} />
          <Row label="Ready" value={when && service ? `about ${formatTime(when.getTime() + (service.minutes + 70) * 60000)}` : undefined} />
        </dl>
        <p className="mt-6 t-small text-field-soft">
          {WORKSHOP.street}, {WORKSHOP.area}
        </p>
      </aside>
    </div>
  );
}

/* ---------- Confirmation ---------- */

function Confirmation({ ticket }: { ticket: RepairTicket }) {
  const at = new Date(ticket.appointment);
  return (
    <div className="grid gap-2 lg:grid-cols-12">
      <div className="enter flex items-center justify-center rounded-tile bg-crimson p-8 lg:col-span-5 lg:min-h-[560px]">
        <KeyTag id={ticket.id} tone="paper" swing className="w-[min(220px,55vw)]" />
      </div>
      <div className="enter flex flex-col rounded-tile bg-surface p-6 md:p-10 lg:col-span-7" style={{ ["--i" as string]: 1 }}>
        <h2 className="t-head">You're on the board</h2>
        <p className="mt-4 max-w-[48ch] t-body">
          Your tag number is <strong className="tnum font-medium">{ticket.id}</strong>. Bring the car on{" "}
          {formatDay(at)} at {formatTime(at)}. Type the number on this site any time to see where it is.
        </p>
        <dl className="mt-8 grid gap-1.5 sm:grid-cols-2">
          <Fact label="Job" value={ticket.serviceName} />
          <Fact label="Price" value={ticket.price === null ? "Quoted after inspection" : formatMoney(ticket.price)} />
          <Fact label="Car" value={`${ticket.car.make} ${ticket.car.model}, ${ticket.car.year}`} />
          <Fact label="Plate" value={ticket.car.plate} />
        </dl>
        <div className="mt-auto flex flex-wrap gap-2 pt-10">
          <Link href={{ pathname: "/track", query: { t: ticket.id } }} className="btn group">
            Open my job card
            <ArrowRight className="arrow size-4" strokeWidth={1.8} aria-hidden />
          </Link>
          <button type="button" className="btn btn-quiet" onClick={() => downloadIcs(ticket)}>
            <CalendarPlus className="size-4" strokeWidth={1.8} aria-hidden />
            Add to calendar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Bits ---------- */

function Lifts({ free, light }: { free: number; light: boolean }) {
  return (
    <span className="flex gap-1" aria-hidden>
      {Array.from({ length: 7 }, (_, i) => (
        <span key={i} className={`h-2.5 flex-1 rounded-[2px] ${i < free ? "bg-crimson" : light ? "bg-[#cfcfcf]" : "bg-surface-3"}`} />
      ))}
    </span>
  );
}

function Field({ label, children, error, className = "" }: { label: string; children: React.ReactNode; error?: boolean; className?: string }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="t-small font-medium">
        {label}
        {error ? <span className="ml-2 text-[#ff6b7d]">needed</span> : null}
      </span>
      {children}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 t-small text-[#ff6b7d]" role="alert">
      {children}
    </p>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 rounded-[6px] bg-[#e2e2e2] px-4 py-3">
      <dt className="t-small text-field-soft">{label}</dt>
      <dd className={`text-right t-small font-medium ${value ? "" : "text-field-soft"}`}>{value ?? "—"}</dd>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-tile bg-surface-2 px-4 py-3.5">
      <dt className="t-small text-soft">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}

function duration(min: number) {
  return min < 60 ? `${min} min` : `${min / 60} h`;
}

function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function atHour(iso: string, hour: number) {
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(y, m - 1, day, hour, 0, 0, 0);
}

function downloadIcs(t: RepairTicket) {
  const stamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bay Seven//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${t.id}@bayseven.example`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(t.appointment)}`,
    `DTEND:${stamp(t.appointment + 30 * 60000)}`,
    `SUMMARY:Bay Seven: ${t.serviceName} (${t.id})`,
    `LOCATION:${WORKSHOP.street}\\, ${WORKSHOP.area}`,
    `DESCRIPTION:Drop off the ${t.car.make} ${t.car.model} (${t.car.plate}). Key tag ${t.id}.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `bay-seven-${t.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
