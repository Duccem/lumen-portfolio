/**
 * Sample data for the Lintel front end. Every house, architect, agent, price and
 * address here is invented so the design can be seen at full density.
 * Replace with real listings before launch.
 */

export type Operation = "buy" | "rent";
export type PropertyType = "house" | "villa" | "townhouse";
export type Region = "Lisbon coast" | "Alentejo coast" | "Balearics" | "Costa Brava";

export type Photo = { src: string; alt: string; caption: string };

export type Room = { x: number; y: number; w: number; h: number; label: string };
export type FloorPlan = { name: string; area: number; rooms: Room[] };

export type Property = {
  slug: string;
  name: string;
  town: string;
  region: Region;
  street: string;
  operation: Operation;
  type: PropertyType;
  architect: string;
  year: number;
  /** Sale price in euros, or monthly rent in euros when operation is "rent". */
  price: number;
  beds: number;
  baths: number;
  floors: number;
  area: number;
  plot: number;
  views: string[];
  summary: string;
  story: string;
  cover: Photo;
  photos: Photo[];
  plans: FloorPlan[];
  distances: { label: string; value: string }[];
  agent: { name: string; phone: string };
  listedOn: string;
};

const ROOMS: Photo[] = [
  { src: "/images/rooms/living-oak.jpg", alt: "Open living room with oak floor, white sofa and black steel window frames", caption: "Living room" },
  { src: "/images/rooms/glass-stair.jpg", alt: "Open timber stair beside a glass wall looking onto the pool", caption: "Stair to the pool" },
  { src: "/images/rooms/lounge-clerestory.jpg", alt: "Lounge with a long clerestory window and low leather seating", caption: "Lounge under the clerestory" },
  { src: "/images/rooms/living-stone.jpg", alt: "Living room with a stone fireplace wall and sliding doors to a terrace", caption: "Living room, stone wall" },
  { src: "/images/rooms/dining-terrace.jpg", alt: "Dining room opening fully onto a covered terrace", caption: "Dining room onto the terrace" },
  { src: "/images/rooms/bedroom-grey.jpg", alt: "Main bedroom in grey linen with full-height windows to the garden", caption: "Main bedroom" },
  { src: "/images/rooms/bath-stone.jpg", alt: "Bathroom in pale stone with a freestanding bath under a high window", caption: "Bathroom" },
  { src: "/images/rooms/lounge-warm.jpg", alt: "Warm lounge with a long window, rattan chairs and a framed print wall", caption: "Lounge" },
  { src: "/images/rooms/hall-white.jpg", alt: "Double-height white entrance hall with a fireplace and a gallery above", caption: "Entrance hall" },
];

/* Three plan layouts on a 100 x 60 grid, reused with different names and areas. */
const PLAN_A: Room[][] = [
  [
    { x: 0, y: 0, w: 46, h: 36, label: "Living" },
    { x: 46, y: 0, w: 28, h: 22, label: "Kitchen" },
    { x: 74, y: 0, w: 26, h: 22, label: "Study" },
    { x: 46, y: 22, w: 54, h: 14, label: "Dining" },
    { x: 0, y: 36, w: 30, h: 24, label: "Hall" },
    { x: 30, y: 36, w: 22, h: 24, label: "WC" },
    { x: 52, y: 36, w: 48, h: 24, label: "Terrace" },
  ],
  [
    { x: 0, y: 0, w: 38, h: 32, label: "Main bed" },
    { x: 38, y: 0, w: 18, h: 32, label: "Bath" },
    { x: 56, y: 0, w: 44, h: 32, label: "Bedroom" },
    { x: 0, y: 32, w: 30, h: 28, label: "Dressing" },
    { x: 30, y: 32, w: 30, h: 28, label: "Landing" },
    { x: 60, y: 32, w: 40, h: 28, label: "Bedroom" },
  ],
];
const PLAN_B: Room[][] = [
  [
    { x: 0, y: 0, w: 60, h: 34, label: "Living and dining" },
    { x: 60, y: 0, w: 40, h: 34, label: "Kitchen" },
    { x: 0, y: 34, w: 24, h: 26, label: "Bedroom" },
    { x: 24, y: 34, w: 16, h: 26, label: "Bath" },
    { x: 40, y: 34, w: 24, h: 26, label: "Bedroom" },
    { x: 64, y: 34, w: 36, h: 26, label: "Main bed" },
  ],
];
const PLAN_C: Room[][] = [
  [
    { x: 0, y: 0, w: 34, h: 60, label: "Living" },
    { x: 34, y: 0, w: 33, h: 30, label: "Kitchen" },
    { x: 67, y: 0, w: 33, h: 30, label: "Dining" },
    { x: 34, y: 30, w: 22, h: 30, label: "Hall" },
    { x: 56, y: 30, w: 44, h: 30, label: "Pool room" },
  ],
  [
    { x: 0, y: 0, w: 40, h: 34, label: "Main bed" },
    { x: 40, y: 0, w: 20, h: 34, label: "Bath" },
    { x: 60, y: 0, w: 40, h: 34, label: "Bedroom" },
    { x: 0, y: 34, w: 36, h: 26, label: "Bedroom" },
    { x: 36, y: 34, w: 18, h: 26, label: "Bath" },
    { x: 54, y: 34, w: 46, h: 26, label: "Library" },
  ],
  [
    { x: 0, y: 0, w: 62, h: 60, label: "Roof terrace" },
    { x: 62, y: 0, w: 38, h: 36, label: "Studio" },
    { x: 62, y: 36, w: 38, h: 24, label: "Plant" },
  ],
];

function plans(layout: Room[][], area: number): FloorPlan[] {
  const names = ["Ground floor", "First floor", "Roof"];
  const share = layout.length === 1 ? [1] : layout.length === 2 ? [0.55, 0.45] : [0.42, 0.4, 0.18];
  return layout.map((rooms, i) => ({ name: names[i] ?? `Floor ${i + 1}`, area: Math.round(area * (share[i] ?? 0)), rooms }));
}

function photos(cover: Photo, start: number, count = 6): Photo[] {
  const rooms = Array.from({ length: count }, (_, i) => ROOMS[(start + i * 2) % ROOMS.length]!);
  return [cover, ...rooms];
}

type Seed = Omit<Property, "photos" | "plans" | "cover"> & { coverSrc: string; coverAlt: string; layout: Room[][]; roomStart: number };

const SEEDS: Seed[] = [
  {
    slug: "aster-house", name: "Aster House", town: "Sintra", region: "Lisbon coast", street: "Rua do Cabo da Roca 12",
    operation: "buy", type: "house", architect: "Atelier Noro", year: 2021, price: 2_450_000,
    beds: 4, baths: 4, floors: 2, area: 286, plot: 1_900, views: ["Forest view", "Ocean view"],
    summary: "Dark timber and glass under the old cork oaks, ten minutes from the cape.",
    story: "Atelier Noro set the house low among the cork oaks so the canopy, not the roofline, reads from the road. The ground floor is one long room in charred timber and glass, open on both sides, so the afternoon light crosses it from the garden to the terrace. Upstairs, four bedrooms sit behind deep reveals that keep the summer sun off the glass.",
    coverSrc: "/images/homes/aster-house.jpg", coverAlt: "Dark timber house with lit glass walls under a large tree at dusk",
    layout: PLAN_A, roomStart: 0,
    distances: [{ label: "Praia Grande", value: "9 min" }, { label: "Sintra old town", value: "12 min" }, { label: "Lisbon airport", value: "38 min" }],
    agent: { name: "Marta Leal", phone: "+351 912 004 118" }, listedOn: "2026-10-02",
  },
  {
    slug: "salt-terrace", name: "Salt Terrace", town: "Cascais", region: "Lisbon coast", street: "Avenida Rei Humberto II 41",
    operation: "buy", type: "villa", architect: "Inês Valadas", year: 2019, price: 3_180_000,
    beds: 5, baths: 5, floors: 2, area: 340, plot: 1_250, views: ["Ocean view", "Pool"],
    summary: "Three white terraces stepping down to a long pool and the bay.",
    story: "Inês Valadas built the villa as three stacked terraces, each one a room in summer. The lowest holds a 21-metre pool cut into the rock; the highest is a covered roof deck that looks across the bay to Cascais marina. Inside, lime plaster and pale limestone keep the rooms cool without shutters.",
    coverSrc: "/images/homes/salt-terrace.jpg", coverAlt: "White terraced villa above a turquoise pool under a clear sky",
    layout: PLAN_C, roomStart: 3,
    distances: [{ label: "Guincho beach", value: "6 min" }, { label: "Cascais marina", value: "8 min" }, { label: "Lisbon airport", value: "32 min" }],
    agent: { name: "Rui Abrantes", phone: "+351 913 220 571" }, listedOn: "2026-09-21",
  },
  {
    slug: "linden-court", name: "Linden Court", town: "Estoril", region: "Lisbon coast", street: "Rua de Sintra 7",
    operation: "buy", type: "townhouse", architect: "Oficina Lume", year: 2022, price: 1_960_000,
    beds: 4, baths: 3, floors: 3, area: 248, plot: 410, views: ["Garden", "Pool"],
    summary: "A walled townhouse in timber and render with its own long pool.",
    story: "On a narrow plot behind the casino gardens, Oficina Lume stacked three floors around a single lap pool. Timber soffits run unbroken from the kitchen to the terrace, and every bedroom has a window seat cut into the depth of the wall.",
    coverSrc: "/images/homes/linden-court.jpg", coverAlt: "Modern white and timber townhouse with a long lap pool in front",
    layout: PLAN_C, roomStart: 1,
    distances: [{ label: "Tamariz beach", value: "4 min" }, { label: "Estoril station", value: "6 min" }, { label: "Lisbon airport", value: "28 min" }],
    agent: { name: "Marta Leal", phone: "+351 912 004 118" }, listedOn: "2026-10-11",
  },
  {
    slug: "cove-villa", name: "Cove Villa", town: "Ericeira", region: "Lisbon coast", street: "Travessa da Ribeira d'Ilhas 3",
    operation: "buy", type: "villa", architect: "Studio Maré", year: 2018, price: 1_540_000,
    beds: 3, baths: 3, floors: 2, area: 205, plot: 980, views: ["Ocean view", "Pool"],
    summary: "White volumes over an infinity pool, above the surf at Ribeira d'Ilhas.",
    story: "Studio Maré cantilevered the upper floor over the pool so the bedrooms look straight down the coast. The house is built for the wind: courtyards on the lee side, deep sills, and a boot room by the gate for wetsuits and boards.",
    coverSrc: "/images/homes/cove-villa.jpg", coverAlt: "White cantilevered villa above an infinity pool by the sea",
    layout: PLAN_A, roomStart: 4,
    distances: [{ label: "Ribeira d'Ilhas", value: "3 min" }, { label: "Ericeira centre", value: "7 min" }, { label: "Lisbon airport", value: "40 min" }],
    agent: { name: "Rui Abrantes", phone: "+351 913 220 571" }, listedOn: "2026-10-18",
  },
  {
    slug: "cedar-box", name: "Cedar Box", town: "Comporta", region: "Alentejo coast", street: "Estrada da Carrasqueira 88",
    operation: "buy", type: "house", architect: "Atelier Noro", year: 2023, price: 1_280_000,
    beds: 3, baths: 2, floors: 2, area: 176, plot: 5_200, views: ["Rice fields", "Garden"],
    summary: "A cedar-clad box on stilts above the rice fields and the dunes.",
    story: "The house stands on a five-thousand-square-metre plot of umbrella pines between the rice fields and the dunes. Its cedar cladding is left to silver. A single sliding wall opens the kitchen to a deck that faces the evening herons on the paddies.",
    coverSrc: "/images/homes/cedar-box.jpg", coverAlt: "Two-storey house clad in red cedar and white render on a green lawn",
    layout: PLAN_B, roomStart: 2,
    distances: [{ label: "Comporta beach", value: "7 min" }, { label: "Carrasqueira pier", value: "5 min" }, { label: "Lisbon airport", value: "1 h 10 min" }],
    agent: { name: "Joana Seixas", phone: "+351 915 330 902" }, listedOn: "2026-09-30",
  },
  {
    slug: "timber-row", name: "Timber Row", town: "Melides", region: "Alentejo coast", street: "Caminho da Lagoa 21",
    operation: "buy", type: "house", architect: "Paula Rendo", year: 2020, price: 1_120_000,
    beds: 3, baths: 2, floors: 2, area: 168, plot: 2_400, views: ["Lagoon", "Garden"],
    summary: "Vertical timber and black steel beside the Melides lagoon.",
    story: "Paula Rendo used one material inside and out: vertical pine boards, oiled indoors and left raw outside. The plan is a single row of rooms, each opening to a shared veranda. A walled garden of olives and rosemary needs almost no water.",
    coverSrc: "/images/homes/timber-row.jpg", coverAlt: "Modern house with vertical timber cladding behind a garden wall",
    layout: PLAN_B, roomStart: 5,
    distances: [{ label: "Melides lagoon", value: "4 min" }, { label: "Melides village", value: "9 min" }, { label: "Lisbon airport", value: "1 h 20 min" }],
    agent: { name: "Joana Seixas", phone: "+351 915 330 902" }, listedOn: "2026-10-06",
  },
  {
    slug: "slate-house", name: "Slate House", town: "Grândola", region: "Alentejo coast", street: "Herdade do Pinheirinho, lote 9",
    operation: "buy", type: "house", architect: "Oficina Lume", year: 2017, price: 895_000,
    beds: 3, baths: 2, floors: 2, area: 190, plot: 3_100, views: ["Cork forest", "Garden"],
    summary: "Dark slate and timber slats, lit like a lantern among the cork oaks.",
    story: "Clad in dark slate with a screen of timber slats over the stair, the house glows at night from inside. It sits on a gentle slope so the living floor is at ground level on one side and a full storey above the garden on the other.",
    coverSrc: "/images/homes/slate-house.jpg", coverAlt: "Dark slate-clad house with timber slats lit warmly at night",
    layout: PLAN_A, roomStart: 6,
    distances: [{ label: "Pego beach", value: "14 min" }, { label: "Grândola town", value: "10 min" }, { label: "Lisbon airport", value: "1 h 05 min" }],
    agent: { name: "Joana Seixas", phone: "+351 915 330 902" }, listedOn: "2026-10-14",
  },
  {
    slug: "horizon-house", name: "Horizon House", town: "Vila Nova de Milfontes", region: "Alentejo coast", street: "Rua do Farol 5",
    operation: "buy", type: "villa", architect: "Studio Maré", year: 2021, price: 2_050_000,
    beds: 4, baths: 4, floors: 2, area: 262, plot: 1_600, views: ["Ocean view", "River mouth", "Pool"],
    summary: "Glass and white concrete above the mouth of the Mira river.",
    story: "A single concrete shelf holds the upper floor out over the terrace, framing the river mouth like a picture window. The pool is set on the same level as the living room floor, so from the sofa the water runs straight into the Atlantic.",
    coverSrc: "/images/homes/horizon.jpg", coverAlt: "White concrete villa with a broad glass front above a large pool",
    layout: PLAN_C, roomStart: 7,
    distances: [{ label: "Furnas beach", value: "5 min" }, { label: "Milfontes centre", value: "4 min" }, { label: "Faro airport", value: "1 h 50 min" }],
    agent: { name: "Rui Abrantes", phone: "+351 913 220 571" }, listedOn: "2026-10-20",
  },
  {
    slug: "casa-calma", name: "Casa Calma", town: "Deià", region: "Balearics", street: "Camí de Sa Cala 14",
    operation: "buy", type: "villa", architect: "Bernat Soler", year: 2020, price: 4_600_000,
    beds: 5, baths: 6, floors: 3, area: 410, plot: 4_800, views: ["Sea view", "Mountain view", "Pool"],
    summary: "Five bedrooms in white stone between the Tramuntana and the sea.",
    story: "Bernat Soler cut the villa into the terraces of an old olive grove, keeping the dry-stone walls as its garden boundaries. Three floors step down the hill; each has its own terrace and none overlooks another. The pool sits on the lowest terrace, level with the tops of the olives.",
    coverSrc: "/images/homes/blanca.jpg", coverAlt: "White modern villa with a pool and terrace in bright sun",
    layout: PLAN_C, roomStart: 0,
    distances: [{ label: "Cala Deià", value: "6 min" }, { label: "Sóller", value: "15 min" }, { label: "Palma airport", value: "40 min" }],
    agent: { name: "Clara Vidal", phone: "+34 671 220 914" }, listedOn: "2026-09-18",
  },
  {
    slug: "patio-house", name: "Patio House", town: "Santanyí", region: "Balearics", street: "Carrer de sa Font 30",
    operation: "buy", type: "townhouse", architect: "Bernat Soler", year: 2016, price: 1_790_000,
    beds: 3, baths: 3, floors: 2, area: 214, plot: 520, views: ["Courtyard", "Garden"],
    summary: "White walls around a shaded courtyard in the old town.",
    story: "Behind a plain lime-washed wall is a courtyard with a single carob tree. Every room opens onto it, so the house is lit from the centre and stays private from the street. The roof terrace looks over the town to the sandstone church.",
    coverSrc: "/images/homes/white-courtyard.jpg", coverAlt: "White cubic house with a stone path and Mediterranean planting",
    layout: PLAN_A, roomStart: 3,
    distances: [{ label: "Cala Llombards", value: "10 min" }, { label: "Santanyí market", value: "2 min" }, { label: "Palma airport", value: "45 min" }],
    agent: { name: "Clara Vidal", phone: "+34 671 220 914" }, listedOn: "2026-10-09",
  },
  {
    slug: "dune-villa", name: "Dune Villa", town: "Ciutadella", region: "Balearics", street: "Camí de Cala Morell 2",
    operation: "buy", type: "villa", architect: "Paula Rendo", year: 2019, price: 2_890_000,
    beds: 4, baths: 4, floors: 2, area: 305, plot: 2_100, views: ["Sea view", "Pool"],
    summary: "Clean white planes and a palm garden above Cala Morell.",
    story: "The villa is a set of white planes that open and close to the north wind. Its garden of palms and lentisk was planted from the island's own stock. The upper floor holds the main suite alone, with a terrace that faces the sunset over the cove.",
    coverSrc: "/images/homes/dune-villa.jpg", coverAlt: "White modern villa with a pool and palm trees under a blue sky",
    layout: PLAN_C, roomStart: 2,
    distances: [{ label: "Cala Morell", value: "3 min" }, { label: "Ciutadella port", value: "12 min" }, { label: "Menorca airport", value: "45 min" }],
    agent: { name: "Clara Vidal", phone: "+34 671 220 914" }, listedOn: "2026-10-03",
  },
  {
    slug: "elm-pavilion", name: "Elm Pavilion", town: "Begur", region: "Costa Brava", street: "Carrer del Racó 19",
    operation: "buy", type: "house", architect: "Inês Valadas", year: 2022, price: 1_650_000,
    beds: 4, baths: 3, floors: 2, area: 232, plot: 1_400, views: ["Garden", "Sea view"],
    summary: "A black pavilion and a timber one, joined under an old elm.",
    story: "Two pavilions, one in black steel and one in larch, meet under a hundred-year-old elm that the architect refused to move. The black one holds the bedrooms; the larch one is a single room for cooking, eating and sitting, open on three sides to the garden.",
    coverSrc: "/images/homes/elm-pavilion.jpg", coverAlt: "Black and timber modern house beneath a large tree on a lawn",
    layout: PLAN_A, roomStart: 1,
    distances: [{ label: "Sa Riera beach", value: "6 min" }, { label: "Begur castle", value: "5 min" }, { label: "Girona airport", value: "45 min" }],
    agent: { name: "Pau Ferrer", phone: "+34 662 118 407" }, listedOn: "2026-10-16",
  },
  {
    slug: "gable-house", name: "Gable House", town: "Sintra", region: "Lisbon coast", street: "Rua Visconde de Monserrate 54",
    operation: "rent", type: "house", architect: "Oficina Lume", year: 2021, price: 6_800,
    beds: 3, baths: 2, floors: 2, area: 184, plot: 900, views: ["Forest view", "Garden"],
    summary: "A modern gable in white render and dark stone, let by the year.",
    story: "A simple pitched roof, a deep porch and a garden that runs into the forest of the Serra. Let furnished on a twelve-month lease, with a gardener included.",
    coverSrc: "/images/homes/gable-house.jpg", coverAlt: "Modern white gabled house with dark stone walls and a timber fence",
    layout: PLAN_B, roomStart: 4,
    distances: [{ label: "Sintra old town", value: "8 min" }, { label: "Praia das Maçãs", value: "15 min" }, { label: "Lisbon airport", value: "35 min" }],
    agent: { name: "Marta Leal", phone: "+351 912 004 118" }, listedOn: "2026-10-22",
  },
  {
    slug: "dusk-house", name: "Dusk House", town: "Cascais", region: "Lisbon coast", street: "Rua da Quinta da Marinha 30",
    operation: "rent", type: "house", architect: "Studio Maré", year: 2018, price: 9_500,
    beds: 4, baths: 4, floors: 2, area: 238, plot: 1_100, views: ["Garden", "Golf"],
    summary: "Stacked volumes facing west over the Quinta da Marinha greens.",
    story: "Built to face the sunset, with every main room on the west side and a long garden down to the golf course. Let furnished, with a minimum term of one year.",
    coverSrc: "/images/homes/dusk-house.jpg", coverAlt: "Modern house with lit windows and a grey facade at sunset",
    layout: PLAN_A, roomStart: 6,
    distances: [{ label: "Guincho beach", value: "7 min" }, { label: "Cascais centre", value: "9 min" }, { label: "Lisbon airport", value: "33 min" }],
    agent: { name: "Rui Abrantes", phone: "+351 913 220 571" }, listedOn: "2026-10-25",
  },
];

export const PROPERTIES: Property[] = SEEDS.map(({ coverSrc, coverAlt, layout, roomStart, ...rest }) => {
  const cover: Photo = { src: coverSrc, alt: coverAlt, caption: `${rest.name}, ${rest.town}` };
  return { ...rest, cover, photos: photos(cover, roomStart), plans: plans(layout, rest.area) };
});

export const SEASON = PROPERTIES.filter((p) => p.operation === "buy");

export function getProperty(slug: string): Property | undefined {
  return PROPERTIES.find((p) => p.slug === slug);
}

export function similarTo(p: Property, count = 3): Property[] {
  return PROPERTIES.filter((o) => o.slug !== p.slug && o.operation === p.operation)
    .sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price))
    .slice(0, count);
}

/** A deterministic estimate and eight years of price history for the smart-estimate chart. */
export function estimateFor(p: Property) {
  let seed = [...p.slug].reduce((s, c) => s + c.charCodeAt(0), 0);
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const start = p.price * (0.62 + rand() * 0.08);
  const history = years.map((year, i) => {
    const t = i / (years.length - 1);
    const value = start + (p.price - start) * Math.pow(t, 1.15) + (rand() - 0.5) * p.price * 0.035;
    return { year, value: i === years.length - 1 ? p.price : Math.round(value) };
  });
  const step = p.price >= 100_000 ? 10_000 : 100;
  return {
    low: Math.round((p.price * 0.94) / step) * step,
    high: Math.round((p.price * 1.09) / step) * step,
    history,
    factors: [p.views[0] ? `${p.views[0].toLowerCase()} from the main rooms` : "private garden", `signed by ${p.architect}`, `${p.region} prices up since 2019`],
  };
}

export const REGIONS: Region[] = ["Lisbon coast", "Alentejo coast", "Balearics", "Costa Brava"];
export const TYPES: { value: PropertyType; label: string }[] = [
  { value: "house", label: "Houses" },
  { value: "villa", label: "Villas" },
  { value: "townhouse", label: "Townhouses" },
];
