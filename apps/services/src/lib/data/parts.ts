/**
 * Sample parts-counter stock. Part numbers, fitment and prices are placeholders.
 * Parts are reserved online and paid for at the counter; nothing is charged here.
 */

export type PartCategory = {
  id: string;
  name: string;
  line: string;
  image: { src: string; alt: string };
};

export const PART_CATEGORIES: PartCategory[] = [
  {
    id: "brakes",
    name: "Brakes",
    line: "Pads, discs, fluid and hardware",
    image: { src: "/images/brake-disc.jpg", alt: "A front brake disc and caliper on a car raised on a stand" },
  },
  {
    id: "oil",
    name: "Oil and filters",
    line: "Engine oil, oil, air, cabin and fuel filters",
    image: { src: "/images/oil-funnel.jpg", alt: "Engine oil poured from a bottle through a yellow funnel" },
  },
  {
    id: "engine",
    name: "Engine and ignition",
    line: "Plugs, belts, coils and gaskets",
    image: { src: "/images/cylinder-head.jpg", alt: "An open cylinder head showing camshafts and valve springs" },
  },
  {
    id: "tyres",
    name: "Tyres and wheels",
    line: "Valves, bolts, repair kits",
    image: { src: "/images/tyre.webp", alt: "A car tyre on an alloy wheel, seen close" },
  },
  {
    id: "tools",
    name: "Tools",
    line: "Sockets, torque wrenches, jacks",
    image: { src: "/images/socket-set.jpg", alt: "A socket set with two ratchets in an open metal box" },
  },
  {
    id: "electrical",
    name: "Lights and electrics",
    line: "Bulbs, batteries, fuses, wipers",
    image: { src: "/images/headlights-street.jpg", alt: "Rows of car headlights in a street at dusk" },
  },
];

export type Part = {
  sku: string;
  name: string;
  category: string;
  fits: string;
  price: number;
  stock: number;
};

export const PARTS: Part[] = [
  { sku: "BR-2041", name: "Front brake pads, ceramic", category: "brakes", fits: "VW Golf VII, Seat Leon III, Škoda Octavia III", price: 54.9, stock: 12 },
  { sku: "BR-2057", name: "Front brake discs, vented, pair", category: "brakes", fits: "Ford Focus III, Ford C-Max II", price: 89.0, stock: 4 },
  { sku: "BR-2110", name: "Rear brake shoes", category: "brakes", fits: "Toyota Yaris III, Peugeot 208", price: 42.5, stock: 7 },
  { sku: "BR-3002", name: "Brake fluid DOT 4, 1 L", category: "brakes", fits: "All cars specifying DOT 4", price: 11.9, stock: 30 },
  { sku: "BR-3020", name: "Pad wear sensor", category: "brakes", fits: "BMW 3 Series F30, BMW 1 Series F20", price: 14.5, stock: 9 },

  { sku: "OL-5W30-5", name: "Engine oil 5W-30, 5 L", category: "oil", fits: "Most petrol and diesel cars after 2010", price: 39.9, stock: 24 },
  { sku: "OL-0W20-4", name: "Engine oil 0W-20, 4 L", category: "oil", fits: "Toyota and Honda hybrids", price: 42.0, stock: 10 },
  { sku: "FL-1180", name: "Oil filter", category: "oil", fits: "VW 1.6 and 2.0 TDI", price: 9.9, stock: 18 },
  { sku: "FL-1402", name: "Air filter", category: "oil", fits: "Renault Clio IV, Dacia Sandero II", price: 14.9, stock: 8 },
  { sku: "FL-2201", name: "Cabin filter, activated carbon", category: "oil", fits: "Hyundai i30, Kia Ceed", price: 17.5, stock: 11 },

  { sku: "EN-7012", name: "Spark plugs, iridium, set of four", category: "engine", fits: "Mazda 3 2.0, Mazda CX-3 2.0", price: 46.0, stock: 6 },
  { sku: "EN-7120", name: "Timing belt kit with water pump", category: "engine", fits: "Ford 1.6 TDCi, Peugeot 1.6 HDi", price: 189.0, stock: 2 },
  { sku: "EN-7204", name: "Auxiliary drive belt", category: "engine", fits: "Toyota Corolla 1.8 hybrid", price: 28.5, stock: 5 },
  { sku: "EN-7311", name: "Ignition coil", category: "engine", fits: "VW 1.4 TSI, Audi 1.4 TFSI", price: 38.0, stock: 8 },

  { sku: "TY-0100", name: "Tyre valves, rubber, set of four", category: "tyres", fits: "All steel and alloy wheels", price: 6.0, stock: 40 },
  { sku: "TY-0220", name: "Locking wheel bolts", category: "tyres", fits: "M14 × 1.5, conical seat", price: 32.0, stock: 6 },
  { sku: "TY-0305", name: "Tubeless puncture repair kit", category: "tyres", fits: "Car and van tyres", price: 19.5, stock: 9 },

  { sku: "TL-4001", name: "Socket set, 1/2 in drive, 24 pieces", category: "tools", fits: "Metric, 10–32 mm", price: 64.0, stock: 3 },
  { sku: "TL-4020", name: "Click torque wrench, 40–200 N·m", category: "tools", fits: "1/2 in drive", price: 79.0, stock: 2 },
  { sku: "TL-4105", name: "Trolley jack, 2 tonne", category: "tools", fits: "Cars and small SUVs", price: 89.0, stock: 1 },

  { sku: "EL-6001", name: "H7 headlight bulbs, pair", category: "electrical", fits: "Most cars with H7 low beam", price: 18.0, stock: 22 },
  { sku: "EL-6110", name: "Battery 70 Ah, start-stop AGM", category: "electrical", fits: "Cars with start-stop, group H6", price: 169.0, stock: 3 },
  { sku: "EL-6230", name: "Wiper blades, 600 and 400 mm", category: "electrical", fits: "Hook-arm wipers", price: 24.0, stock: 14 },
  { sku: "EL-6302", name: "Blade fuse assortment, 120 pieces", category: "electrical", fits: "Standard and mini blade sockets", price: 9.5, stock: 16 },
];

export const getPart = (sku: string) => PARTS.find((p) => p.sku === sku);
