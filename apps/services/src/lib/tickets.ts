"use client";

import { createStore } from "./store";

/* ---------- Types ---------- */

export type Car = { make: string; model: string; year: string; plate: string; mileage?: string };

export type QuoteLine = { label: string; price: number };

export type RepairTicket = {
  kind: "repair";
  id: string;
  createdAt: number;
  appointment: number;
  serviceId: string;
  serviceName: string;
  /** null when the job is quoted after inspection */
  price: number | null;
  minutes: number;
  car: Car;
  customer: { name: string; phone: string; email: string };
  notes?: string;
  quote?: QuoteLine[];
  /** Mechanic's notes, keyed by stage id */
  log?: Partial<Record<RepairStageId, string>>;
  demo?: boolean;
};

export type PartsTicket = {
  kind: "parts";
  id: string;
  createdAt: number;
  items: { sku: string; name: string; price: number; qty: number }[];
  customer: { name: string; phone: string };
};

export type Ticket = RepairTicket | PartsTicket;

/* ---------- Stages ---------- */

export type RepairStageId = "checked-in" | "inspection" | "quote" | "parts" | "lift" | "road-test" | "ready";

export const REPAIR_STAGES: { id: RepairStageId; name: string; line: string }[] = [
  { id: "checked-in", name: "Checked in", line: "Keys tagged and hung on the board." },
  { id: "inspection", name: "Inspection", line: "A mechanic looks the car over and writes down what they find." },
  { id: "quote", name: "Quote", line: "You get the price for the work. Nothing starts until you approve it." },
  { id: "parts", name: "Parts in", line: "Parts are taken from the counter or delivered by our suppliers." },
  { id: "lift", name: "On the lift", line: "The work itself, on one of the seven lifts." },
  { id: "road-test", name: "Road test", line: "Driven, rechecked and the torque settings signed off." },
  { id: "ready", name: "Ready to collect", line: "Washed, keys at the desk, report printed." },
];

export const PARTS_STAGES = [
  { id: "reserved", name: "Reserved", line: "Your basket is held under this number." },
  { id: "picked", name: "Being picked", line: "Taken off the shelves and checked against your car." },
  { id: "ready", name: "Ready at the counter", line: "Pay and collect at the parts counter." },
] as const;

const MIN = 60_000;

/* ---------- Stores ---------- */

export const ticketStore = createStore<Ticket[]>("bayseven.tickets", []);
/** Quote decisions, kept separately so demo tickets can be approved too. */
export const decisionStore = createStore<Record<string, { approved: boolean; at: number }>>("bayseven.decisions", {});

/* ---------- Demo tickets (always available) ---------- */

const ANCHOR = typeof window === "undefined" ? 0 : Math.floor(Date.now() / MIN) * MIN;

export function demoTickets(): RepairTicket[] {
  return [
    {
      kind: "repair",
      id: "B7-2048",
      demo: true,
      createdAt: ANCHOR - 3 * 24 * 60 * MIN,
      appointment: ANCHOR - 95 * MIN,
      serviceId: "full",
      serviceName: "Full revision",
      price: 189,
      minutes: 180,
      car: { make: "Volkswagen", model: "Golf 1.6 TDI", year: "2017", plate: "4KT 208", mileage: "118,400" },
      customer: { name: "Sample customer", phone: "", email: "" },
      log: {
        "checked-in": "Dropped off with a full tank and a child seat in the back, left in the car.",
        inspection: "Oil due, air filter dirty, rear wiper split. Tyres 5 mm all round.",
        quote: "Fixed price revision, approved at booking. Rear wiper added at no charge.",
        parts: "Oil, oil, air, cabin and fuel filters from the counter.",
      },
    },
    {
      kind: "repair",
      id: "B7-1975",
      demo: true,
      createdAt: ANCHOR - 5 * 24 * 60 * MIN,
      appointment: ANCHOR - 170 * MIN,
      serviceId: "basic",
      serviceName: "Basic revision",
      price: 89,
      minutes: 60,
      car: { make: "Toyota", model: "Yaris Hybrid", year: "2019", plate: "2PL 731", mileage: "64,900" },
      customer: { name: "Sample customer", phone: "", email: "" },
      log: {
        "checked-in": "Keys on hook 12.",
        inspection: "All fluids fine. Front tyres at 3 mm, worth replacing before winter.",
        quote: "Fixed price, no extra work.",
        parts: "Oil 0W-20 and filter.",
        lift: "Oil and filter changed, service light reset.",
        "road-test": "Twelve minutes, no faults.",
        ready: "Report printed and in the glovebox.",
      },
    },
    {
      kind: "repair",
      id: "B7-3310",
      demo: true,
      createdAt: ANCHOR - 2 * 24 * 60 * MIN,
      appointment: ANCHOR - 50 * MIN,
      serviceId: "brakes",
      serviceName: "Brakes feel wrong",
      price: null,
      minutes: 120,
      car: { make: "Ford", model: "Focus 1.0 EcoBoost", year: "2015", plate: "9HD 554", mileage: "142,050" },
      customer: { name: "Sample customer", phone: "", email: "" },
      notes: "Grinding noise from the front when braking.",
      quote: [
        { label: "Front discs and pads, parts", price: 143.9 },
        { label: "Labour, 2 h", price: 105 },
        { label: "Brake fluid change", price: 59 },
      ],
      log: {
        "checked-in": "Keys on hook 4.",
        inspection: "Front discs at 21.4 mm, minimum is 22 mm. Front pads at 2 mm. Fluid 3.5% water. Rear brakes fine.",
      },
    },
  ];
}

export const DEMO_IDS = ["B7-2048", "B7-3310", "B7-1975"];

/* ---------- Lookup ---------- */

export function normaliseId(raw: string) {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const m = s.match(/^(B7|P7)?(\d{4})$/);
  if (!m) return null;
  return { prefix: m[1] ?? null, digits: m[2] };
}

export function findTicket(raw: string, own: Ticket[]): Ticket | null {
  const n = normaliseId(raw);
  if (!n) return null;
  const all: Ticket[] = [...own, ...demoTickets()];
  const prefixes = n.prefix ? [n.prefix] : ["B7", "P7"];
  for (const p of prefixes) {
    const t = all.find((x) => x.id === `${p}-${n.digits}`);
    if (t) return t;
  }
  return null;
}

export function newId(prefix: "B7" | "P7", taken: string[]) {
  for (;;) {
    const id = `${prefix}-${String(1000 + Math.floor(Math.random() * 9000))}`;
    if (!taken.includes(id) && !DEMO_IDS.includes(id)) return id;
  }
}

/* ---------- Timelines ---------- */

export type StageState = "done" | "current" | "next" | "skipped";
export type TimelineStage = { id: string; name: string; line: string; at: number | null; state: StageState; note?: string };

export type RepairStatus = {
  stages: TimelineStage[];
  /** -1 means booked, not yet arrived */
  current: number;
  awaitingApproval: boolean;
  declined: boolean;
  readyAt: number | null;
  total: number | null;
};

export function repairStatus(t: RepairTicket, now: number, decision?: { approved: boolean; at: number }): RepairStatus {
  const a = t.appointment;
  const quoteAt = a + 25 * MIN;
  const fixed = t.price !== null;
  const decidedAt = fixed ? quoteAt : decision ? Math.max(decision.at, quoteAt) : null;
  const declined = !fixed && decision?.approved === false;

  const times: Record<RepairStageId, number | null> = {
    "checked-in": a,
    inspection: a + 10 * MIN,
    quote: quoteAt,
    parts: null,
    lift: null,
    "road-test": null,
    ready: null,
  };
  if (decidedAt !== null && !declined) {
    times.parts = decidedAt + 15 * MIN;
    times.lift = times.parts + 20 * MIN;
    times["road-test"] = times.lift + t.minutes * MIN;
    times.ready = times["road-test"] + 15 * MIN;
  } else if (declined && decidedAt !== null) {
    times.ready = decidedAt + 10 * MIN;
  }

  let current = -1;
  REPAIR_STAGES.forEach((s, i) => {
    const at = times[s.id];
    if (at !== null && at <= now) current = i;
  });

  const stages: TimelineStage[] = REPAIR_STAGES.map((s, i) => {
    const skipped = declined && i > 2 && i < 6;
    return {
      ...s,
      at: times[s.id],
      note: t.log?.[s.id],
      state: skipped ? "skipped" : i < current ? "done" : i === current ? "current" : "next",
    };
  });

  const total = fixed ? t.price : t.quote ? t.quote.reduce((s, l) => s + l.price, 0) : null;

  return {
    stages,
    current,
    awaitingApproval: !fixed && !decision && current >= 2,
    declined,
    readyAt: times.ready,
    total: declined ? 0 : total,
  };
}

export function partsStatus(t: PartsTicket, now: number) {
  const offsets = [0, 10, 25];
  let current = 0;
  const stages: TimelineStage[] = PARTS_STAGES.map((s, i) => {
    const at = t.createdAt + offsets[i] * MIN;
    if (at <= now) current = i;
    return { ...s, at, state: "next" as StageState };
  });
  stages.forEach((s, i) => (s.state = i < current ? "done" : i === current ? "current" : "next"));
  return { stages, current, readyAt: t.createdAt + 25 * MIN };
}

/* ---------- Booking slots ---------- */

export const SLOT_HOURS_WEEKDAY = [8, 9, 10, 11, 12, 13, 14, 15, 16];
export const SLOT_HOURS_SATURDAY = [8, 9, 10, 11];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** How many of the seven lifts are still free at this hour (sample occupancy, stable per slot). */
export function liftsFree(when: Date, own: Ticket[]) {
  const key = when.toISOString().slice(0, 13);
  const base = hash(key) % 6; // 0–5 free from the workshop's own diary
  const mine = own.filter((t) => t.kind === "repair" && new Date(t.appointment).toISOString().slice(0, 13) === key).length;
  return Math.max(0, base - mine);
}

export function bookableDays(from: number, count = 12) {
  const days: Date[] = [];
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  while (days.length < count) {
    if (d.getDay() !== 0) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export function slotsFor(day: Date) {
  return day.getDay() === 6 ? SLOT_HOURS_SATURDAY : SLOT_HOURS_WEEKDAY;
}
