/**
 * Sample price list for Bay Seven. Every figure here is a placeholder for the
 * workshop to confirm before launch.
 */

export type PriceItem = {
  name: string;
  price: number;
  /** Shown as "from" when the final figure depends on the car. */
  from?: boolean;
  time: string;
  note?: string;
};

export type PriceGroup = { id: string; name: string; items: PriceItem[] };

export const PRICE_LIST: PriceGroup[] = [
  {
    id: "revisions",
    name: "Revisions",
    items: [
      { name: "Basic revision", price: 89, time: "1 h", note: "Oil, filter, fluids, lights, tyres, 20-point check" },
      { name: "Full revision", price: 189, time: "3 h", note: "Basic plus air, cabin and fuel filters, plugs, 40-point check" },
      { name: "Pre-trip check", price: 45, time: "40 min", note: "Tyres, brakes, lights, wipers and fluids before a long drive" },
      { name: "Inspection preparation", price: 69, time: "1 h", note: "Everything the official test looks at, checked the week before" },
    ],
  },
  {
    id: "brakes",
    name: "Brakes",
    items: [
      { name: "Front pads fitted", price: 119, from: true, time: "1 h" },
      { name: "Front discs and pads", price: 249, from: true, time: "2 h" },
      { name: "Brake fluid change", price: 59, time: "45 min" },
      { name: "Handbrake adjustment", price: 39, time: "30 min" },
    ],
  },
  {
    id: "tyres",
    name: "Tyres and wheels",
    items: [
      { name: "Fit and balance, per tyre", price: 18, time: "15 min" },
      { name: "Four-wheel alignment", price: 69, time: "1 h" },
      { name: "Puncture repair", price: 22, time: "20 min" },
      { name: "Seasonal swap and storage", price: 49, time: "40 min" },
    ],
  },
  {
    id: "engine",
    name: "Engine and timing",
    items: [
      { name: "Timing belt kit and water pump", price: 459, from: true, time: "5 h" },
      { name: "Spark plugs, four cylinder", price: 79, time: "45 min" },
      { name: "Auxiliary belt", price: 89, from: true, time: "1 h" },
      { name: "Clutch replacement", price: 690, from: true, time: "1 day" },
    ],
  },
  {
    id: "diagnostics",
    name: "Diagnostics and electrics",
    items: [
      { name: "Warning light diagnosis", price: 59, time: "45 min", note: "Printed fault report, kept if you go ahead" },
      { name: "Battery test and replacement", price: 25, from: true, time: "20 min" },
      { name: "Bulb replacement", price: 12, from: true, time: "15 min" },
      { name: "Alternator or starter", price: 280, from: true, time: "3 h" },
    ],
  },
  {
    id: "climate",
    name: "Air conditioning",
    items: [
      { name: "Air conditioning recharge", price: 79, time: "1 h" },
      { name: "Leak test with dye", price: 49, time: "45 min" },
      { name: "Cabin filter and sanitise", price: 39, time: "30 min" },
    ],
  },
  {
    id: "suspension",
    name: "Suspension and steering",
    items: [
      { name: "Shock absorbers, pair", price: 289, from: true, time: "2 h" },
      { name: "Track rod ends, pair", price: 129, from: true, time: "1.5 h" },
      { name: "Wheel bearing", price: 179, from: true, time: "2 h" },
    ],
  },
];

/** What can be booked online. Fixed-price jobs skip the quote step. */
export type Revision = {
  id: string;
  name: string;
  price: number | null;
  minutes: number;
  line: string;
};

export const BOOKABLE: Revision[] = [
  { id: "basic", name: "Basic revision", price: 89, minutes: 60, line: "Oil and filter, fluids, lights, tyres, 20-point check." },
  { id: "full", name: "Full revision", price: 189, minutes: 180, line: "All filters, plugs and a 40-point check, printed." },
  { id: "pre-trip", name: "Pre-trip check", price: 45, minutes: 40, line: "Tyres, brakes, lights and fluids before a long drive." },
  { id: "diagnosis", name: "Warning light diagnosis", price: 59, minutes: 45, line: "We read the fault, test it and print the report." },
  { id: "brakes", name: "Brakes feel wrong", price: null, minutes: 90, line: "Noise, pulling or a soft pedal. Quoted after we look." },
  { id: "other", name: "Something else", price: null, minutes: 90, line: "Describe it below. Quoted before any work starts." },
];

export const getBookable = (id: string) => BOOKABLE.find((r) => r.id === id);

export const MAKES = [
  "Audi",
  "BMW",
  "Chevrolet",
  "Citroën",
  "Fiat",
  "Ford",
  "Honda",
  "Hyundai",
  "Kia",
  "Mazda",
  "Mercedes-Benz",
  "Nissan",
  "Peugeot",
  "Renault",
  "Seat",
  "Škoda",
  "Toyota",
  "Volkswagen",
  "Volvo",
  "Other",
];

export const WORKSHOP = {
  name: "Bay Seven",
  lifts: 7,
  street: "14 Foundry Lane",
  area: "Riverside Industrial Estate",
  phone: "+1 555 0107",
  phoneHref: "tel:+15550107",
  email: "desk@bayseven.example",
  hours: [
    { days: "Monday to Friday", time: "07:30–18:30" },
    { days: "Saturday", time: "08:00–13:00" },
    { days: "Sunday", time: "Closed" },
  ],
};
