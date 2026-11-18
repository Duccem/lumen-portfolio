/**
 * Mock catalog for the Prices app. Everything here is fake data used to build
 * the UI before a real backend exists. Store names are fictional.
 */

export type StoreId = 'verde' | 'ahorro' | 'sol' | 'plaza' | 'canasta';

export type Store = {
  id: StoreId;
  name: string;
  initials: string;
  color: string;
  distanceKm: number;
  deliveryMin: number;
  rating: number;
  reviews: number;
  /** 24h clock, e.g. 8 → 08:00 */
  opensAt: number;
  closesAt: number;
  tagline: string;
  address: string;
  specialties: Exclude<CategoryId, 'all'>[];
  cover: string[];
  promo?: string;
  featured?: boolean;
  freeDeliveryFrom?: number;
};

export type CategoryId =
  | 'all'
  | 'fruits'
  | 'vegetables'
  | 'dairy'
  | 'meat'
  | 'pantry'
  | 'bakery'
  | 'drinks'
  | 'spices';

export type Category = {
  id: CategoryId;
  label: string;
  emoji: string;
  /** Pastel tint used behind product imagery in light mode. */
  tint: string;
};

export type StorePrice = {
  storeId: StoreId;
  price: number;
  /** Price seven days ago. Present only when it changed. */
  previousPrice?: number;
};

export type Product = {
  id: string;
  name: string;
  brand?: string;
  unit: string;
  category: Exclude<CategoryId, 'all'>;
  emoji: string;
  prices: StorePrice[];
  /** Lowest price over the last 8 weeks, oldest first. */
  history: number[];
  popular?: boolean;
};

export const STORES: Store[] = [
  {
    id: 'verde',
    name: 'Verde Market',
    initials: 'VM',
    color: '#17A04F',
    distanceKm: 0.8,
    deliveryMin: 25,
    rating: 4.8,
    reviews: 2140,
    opensAt: 8,
    closesAt: 22,
    tagline: 'Frescos y orgánicos de productores locales',
    address: 'Av. Santa Fe 3250',
    specialties: ['fruits', 'vegetables', 'meat'],
    cover: ['🥑', '🥦', '🍋'],
    promo: '20% en frutas y verduras',
    featured: true,
    freeDeliveryFrom: 25,
  },
  {
    id: 'ahorro',
    name: 'SuperAhorro',
    initials: 'SA',
    color: '#E5484D',
    distanceKm: 1.4,
    deliveryMin: 35,
    rating: 4.5,
    reviews: 5310,
    opensAt: 7,
    closesAt: 23,
    tagline: 'Precios bajos todos los días',
    address: 'Av. Córdoba 4890',
    specialties: ['dairy', 'pantry', 'meat'],
    cover: ['🥛', '🍝', '🍗'],
    promo: '2x1 en lácteos seleccionados',
    featured: true,
  },
  {
    id: 'sol',
    name: 'Mercado Sol',
    initials: 'MS',
    color: '#E8A21A',
    distanceKm: 2.1,
    deliveryMin: 40,
    rating: 4.6,
    reviews: 980,
    opensAt: 9,
    closesAt: 21,
    tagline: 'Almacén gourmet y especias del mundo',
    address: 'Gorriti 5120',
    specialties: ['spices', 'drinks', 'pantry'],
    cover: ['🫒', '☕', '🌶️'],
    promo: 'Envío gratis los martes',
    featured: true,
    freeDeliveryFrom: 0,
  },
  {
    id: 'plaza',
    name: 'Plaza Fresca',
    initials: 'PF',
    color: '#3B82F6',
    distanceKm: 2.9,
    deliveryMin: 30,
    rating: 4.3,
    reviews: 1620,
    opensAt: 8,
    closesAt: 24,
    tagline: 'Pescadería y panadería del día',
    address: 'Thames 1780',
    specialties: ['meat', 'bakery', 'vegetables'],
    cover: ['🐟', '🥖', '🥦'],
    freeDeliveryFrom: 30,
  },
  {
    id: 'canasta',
    name: 'La Canasta',
    initials: 'LC',
    color: '#8B5CF6',
    distanceKm: 3.6,
    deliveryMin: 50,
    rating: 4.4,
    reviews: 740,
    opensAt: 10,
    closesAt: 20,
    tagline: 'El almacén de barrio de siempre',
    address: 'Malabia 2045',
    specialties: ['bakery', 'fruits', 'dairy'],
    cover: ['🥖', '🍎', '🥚'],
    promo: '10% pagando en efectivo',
  },
];

export function isOpen(store: Store, date = new Date()) {
  const h = date.getHours();
  return h >= store.opensAt && h < store.closesAt;
}

export const formatHour = (h: number) => `${String(h % 24).padStart(2, '0')}:00`;

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

export const STORE_BY_ID = Object.fromEntries(STORES.map((s) => [s.id, s])) as Record<StoreId, Store>;

export const CATEGORIES: Category[] = [
  { id: 'all', label: 'Todos', emoji: '🧺', tint: '#E6F4EA' },
  { id: 'fruits', label: 'Frutas', emoji: '🍎', tint: '#FDECEA' },
  { id: 'vegetables', label: 'Verduras', emoji: '🥦', tint: '#E4F5E6' },
  { id: 'dairy', label: 'Lácteos', emoji: '🥛', tint: '#EAF1FB' },
  { id: 'meat', label: 'Carnes', emoji: '🥩', tint: '#FBE9E7' },
  { id: 'pantry', label: 'Despensa', emoji: '🥫', tint: '#FBF1E2' },
  { id: 'bakery', label: 'Panadería', emoji: '🥖', tint: '#F8EEDF' },
  { id: 'drinks', label: 'Bebidas', emoji: '🧃', tint: '#FFF4DA' },
  { id: 'spices', label: 'Especias', emoji: '🌶️', tint: '#FCEBE4' },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>;

export const PRODUCTS: Product[] = [
  {
    id: 'avocado',
    name: 'Palta Hass',
    unit: '1 kg',
    category: 'fruits',
    emoji: '🥑',
    popular: true,
    prices: [
      { storeId: 'verde', price: 4.2, previousPrice: 5.1 },
      { storeId: 'ahorro', price: 4.65 },
      { storeId: 'sol', price: 4.9, previousPrice: 5.2 },
      { storeId: 'plaza', price: 5.3 },
    ],
    history: [5.6, 5.4, 5.5, 5.2, 5.1, 4.8, 4.5, 4.2],
  },
  {
    id: 'tomato',
    name: 'Tomate perita',
    unit: '1 kg',
    category: 'vegetables',
    emoji: '🍅',
    popular: true,
    prices: [
      { storeId: 'verde', price: 1.95 },
      { storeId: 'ahorro', price: 1.6, previousPrice: 2.1 },
      { storeId: 'sol', price: 1.85 },
      { storeId: 'canasta', price: 2.25 },
    ],
    history: [2.3, 2.4, 2.2, 2.1, 2.1, 1.9, 1.8, 1.6],
  },
  {
    id: 'broccoli',
    name: 'Brócoli fresco',
    unit: 'unidad',
    category: 'vegetables',
    emoji: '🥦',
    prices: [
      { storeId: 'verde', price: 1.4 },
      { storeId: 'plaza', price: 1.25, previousPrice: 1.5 },
      { storeId: 'sol', price: 1.55 },
    ],
    history: [1.6, 1.6, 1.5, 1.5, 1.45, 1.4, 1.3, 1.25],
  },
  {
    id: 'banana',
    name: 'Banana Ecuador',
    unit: '1 kg',
    category: 'fruits',
    emoji: '🍌',
    popular: true,
    prices: [
      { storeId: 'verde', price: 1.35 },
      { storeId: 'ahorro', price: 1.2 },
      { storeId: 'sol', price: 1.45 },
      { storeId: 'plaza', price: 1.5 },
      { storeId: 'canasta', price: 1.3 },
    ],
    history: [1.2, 1.25, 1.2, 1.3, 1.25, 1.2, 1.2, 1.2],
  },
  {
    id: 'apple',
    name: 'Manzana roja',
    unit: '1 kg',
    category: 'fruits',
    emoji: '🍎',
    prices: [
      { storeId: 'verde', price: 2.1 },
      { storeId: 'ahorro', price: 2.35 },
      { storeId: 'canasta', price: 1.9, previousPrice: 2.3 },
    ],
    history: [2.5, 2.4, 2.4, 2.3, 2.3, 2.1, 2.0, 1.9],
  },
  {
    id: 'lemon',
    name: 'Limón',
    unit: '1 kg',
    category: 'fruits',
    emoji: '🍋',
    prices: [
      { storeId: 'verde', price: 1.7 },
      { storeId: 'sol', price: 1.55 },
      { storeId: 'plaza', price: 1.8 },
    ],
    history: [1.4, 1.45, 1.5, 1.5, 1.55, 1.6, 1.55, 1.55],
  },
  {
    id: 'milk',
    name: 'Leche entera',
    brand: 'La Granja',
    unit: '1 L',
    category: 'dairy',
    emoji: '🥛',
    popular: true,
    prices: [
      { storeId: 'verde', price: 1.15 },
      { storeId: 'ahorro', price: 0.99, previousPrice: 1.19 },
      { storeId: 'sol', price: 1.09 },
      { storeId: 'plaza', price: 1.25 },
      { storeId: 'canasta', price: 1.05 },
    ],
    history: [1.2, 1.2, 1.19, 1.19, 1.15, 1.09, 1.05, 0.99],
  },
  {
    id: 'mozzarella',
    name: 'Queso mozzarella',
    brand: 'Tambo Sur',
    unit: '500 g',
    category: 'dairy',
    emoji: '🧀',
    prices: [
      { storeId: 'verde', price: 4.8 },
      { storeId: 'ahorro', price: 4.5 },
      { storeId: 'plaza', price: 5.1 },
    ],
    history: [4.4, 4.5, 4.5, 4.6, 4.5, 4.5, 4.5, 4.5],
  },
  {
    id: 'eggs',
    name: 'Huevos de campo',
    unit: 'x12',
    category: 'dairy',
    emoji: '🥚',
    popular: true,
    prices: [
      { storeId: 'verde', price: 3.2, previousPrice: 3.6 },
      { storeId: 'ahorro', price: 3.35 },
      { storeId: 'sol', price: 3.5 },
      { storeId: 'canasta', price: 3.4 },
    ],
    history: [3.8, 3.7, 3.7, 3.6, 3.6, 3.4, 3.3, 3.2],
  },
  {
    id: 'yogurt',
    name: 'Yogur natural',
    brand: 'La Granja',
    unit: '1 kg',
    category: 'dairy',
    emoji: '🥣',
    prices: [
      { storeId: 'verde', price: 2.45 },
      { storeId: 'sol', price: 2.3 },
    ],
    history: [2.3, 2.3, 2.35, 2.3, 2.3, 2.3, 2.3, 2.3],
  },
  {
    id: 'chicken',
    name: 'Pechuga de pollo',
    unit: '1 kg',
    category: 'meat',
    emoji: '🍗',
    popular: true,
    prices: [
      { storeId: 'verde', price: 6.9 },
      { storeId: 'ahorro', price: 6.2, previousPrice: 7.4 },
      { storeId: 'plaza', price: 7.1 },
      { storeId: 'canasta', price: 6.75 },
    ],
    history: [7.6, 7.5, 7.5, 7.4, 7.2, 6.9, 6.5, 6.2],
  },
  {
    id: 'beef',
    name: 'Carne molida especial',
    unit: '1 kg',
    category: 'meat',
    emoji: '🥩',
    prices: [
      { storeId: 'verde', price: 8.9 },
      { storeId: 'sol', price: 8.4 },
      { storeId: 'plaza', price: 9.2 },
    ],
    history: [8.1, 8.2, 8.2, 8.3, 8.4, 8.4, 8.4, 8.4],
  },
  {
    id: 'salmon',
    name: 'Filet de salmón',
    unit: '500 g',
    category: 'meat',
    emoji: '🐟',
    prices: [
      { storeId: 'verde', price: 12.5, previousPrice: 14.2 },
      { storeId: 'plaza', price: 13.4 },
    ],
    history: [14.8, 14.5, 14.2, 14.2, 13.9, 13.5, 13.0, 12.5],
  },
  {
    id: 'rice',
    name: 'Arroz largo fino',
    brand: 'Don Grano',
    unit: '1 kg',
    category: 'pantry',
    emoji: '🍚',
    popular: true,
    prices: [
      { storeId: 'verde', price: 1.6 },
      { storeId: 'ahorro', price: 1.45 },
      { storeId: 'sol', price: 1.55 },
      { storeId: 'plaza', price: 1.7 },
      { storeId: 'canasta', price: 1.5 },
    ],
    history: [1.4, 1.4, 1.42, 1.45, 1.45, 1.45, 1.45, 1.45],
  },
  {
    id: 'spaghetti',
    name: 'Fideos spaghetti',
    brand: 'Nonna',
    unit: '500 g',
    category: 'pantry',
    emoji: '🍝',
    prices: [
      { storeId: 'verde', price: 1.25 },
      { storeId: 'ahorro', price: 0.95, previousPrice: 1.2 },
      { storeId: 'canasta', price: 1.1 },
    ],
    history: [1.25, 1.25, 1.2, 1.2, 1.2, 1.1, 1.0, 0.95],
  },
  {
    id: 'olive-oil',
    name: 'Aceite de oliva extra virgen',
    brand: 'Olivar',
    unit: '500 ml',
    category: 'pantry',
    emoji: '🫒',
    prices: [
      { storeId: 'verde', price: 7.8 },
      { storeId: 'sol', price: 6.95, previousPrice: 8.1 },
      { storeId: 'plaza', price: 7.5 },
    ],
    history: [8.4, 8.3, 8.2, 8.1, 8.1, 7.6, 7.2, 6.95],
  },
  {
    id: 'bread',
    name: 'Pan de molde integral',
    brand: 'Hornito',
    unit: '550 g',
    category: 'bakery',
    emoji: '🍞',
    prices: [
      { storeId: 'verde', price: 2.3 },
      { storeId: 'ahorro', price: 2.1 },
      { storeId: 'sol', price: 2.25 },
    ],
    history: [2.0, 2.0, 2.05, 2.1, 2.1, 2.1, 2.1, 2.1],
  },
  {
    id: 'baguette',
    name: 'Baguette artesanal',
    unit: 'unidad',
    category: 'bakery',
    emoji: '🥖',
    prices: [
      { storeId: 'plaza', price: 1.1 },
      { storeId: 'canasta', price: 0.95, previousPrice: 1.15 },
    ],
    history: [1.2, 1.2, 1.15, 1.15, 1.1, 1.05, 1.0, 0.95],
  },
  {
    id: 'orange-juice',
    name: 'Jugo de naranja exprimido',
    brand: 'Citrus',
    unit: '1 L',
    category: 'drinks',
    emoji: '🧃',
    prices: [
      { storeId: 'verde', price: 2.9 },
      { storeId: 'ahorro', price: 2.75 },
      { storeId: 'plaza', price: 3.1 },
    ],
    history: [2.6, 2.65, 2.7, 2.7, 2.75, 2.75, 2.75, 2.75],
  },
  {
    id: 'coffee',
    name: 'Café molido tostado',
    brand: 'Altura',
    unit: '250 g',
    category: 'drinks',
    emoji: '☕',
    popular: true,
    prices: [
      { storeId: 'verde', price: 4.6 },
      { storeId: 'sol', price: 4.1, previousPrice: 4.9 },
      { storeId: 'canasta', price: 4.45 },
    ],
    history: [5.0, 4.9, 4.9, 4.9, 4.7, 4.5, 4.3, 4.1],
  },
  {
    id: 'garlic',
    name: 'Ajo',
    unit: '250 g',
    category: 'vegetables',
    emoji: '🧄',
    prices: [
      { storeId: 'verde', price: 0.9 },
      { storeId: 'sol', price: 0.85 },
      { storeId: 'canasta', price: 0.8 },
    ],
    history: [0.8, 0.8, 0.82, 0.8, 0.8, 0.8, 0.8, 0.8],
  },
  {
    id: 'carrot',
    name: 'Zanahoria',
    unit: '1 kg',
    category: 'vegetables',
    emoji: '🥕',
    prices: [
      { storeId: 'verde', price: 0.95 },
      { storeId: 'ahorro', price: 0.85, previousPrice: 1.05 },
      { storeId: 'plaza', price: 1.1 },
    ],
    history: [1.1, 1.1, 1.05, 1.05, 1.0, 0.95, 0.9, 0.85],
  },
  {
    id: 'onion',
    name: 'Cebolla',
    unit: '1 kg',
    category: 'vegetables',
    emoji: '🧅',
    prices: [
      { storeId: 'verde', price: 0.9 },
      { storeId: 'ahorro', price: 0.95 },
      { storeId: 'sol', price: 0.85 },
      { storeId: 'canasta', price: 0.88 },
    ],
    history: [0.75, 0.78, 0.8, 0.8, 0.82, 0.85, 0.85, 0.85],
  },
  {
    id: 'chili',
    name: 'Ají molido',
    brand: 'Especiero',
    unit: '50 g',
    category: 'spices',
    emoji: '🌶️',
    prices: [
      { storeId: 'verde', price: 1.3 },
      { storeId: 'sol', price: 1.15 },
    ],
    history: [1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15, 1.15],
  },
];

export const RECENT_SEARCHES = ['Palta', 'Leche', 'Pollo', 'Aceite de oliva'];
export const TRENDING_SEARCHES = ['Huevos', 'Café', 'Tomate', 'Arroz', 'Salmón', 'Pan'];
