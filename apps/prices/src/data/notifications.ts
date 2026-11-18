/** Mock in-app notifications for Preci. */
import { type StoreId } from './catalog';

export type NotificationType = 'price_drop' | 'alert' | 'deal' | 'list' | 'system';

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** epoch ms */
  createdAt: number;
  read: boolean;
  productId?: string;
  storeId?: StoreId;
  listId?: string;
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Seeded relative to "now" so the mock always looks fresh. */
export function seedNotifications(now = Date.now()): AppNotification[] {
  return [
    {
      id: 'n1',
      type: 'alert',
      title: 'Tu alerta se cumplió 🎯',
      body: 'Pechuga de pollo bajó a $6.20 en SuperAhorro, por debajo de tu objetivo.',
      createdAt: now - 12 * 60 * 1000,
      read: false,
      productId: 'chicken',
    },
    {
      id: 'n2',
      type: 'price_drop',
      title: 'Bajó de precio un favorito',
      body: 'Palta Hass ahora cuesta $4.20 en Verde Market (-18%).',
      createdAt: now - 2 * HOUR,
      read: false,
      productId: 'avocado',
    },
    {
      id: 'n3',
      type: 'deal',
      title: '2x1 en lácteos seleccionados',
      body: 'SuperAhorro lanzó una promoción válida hasta el domingo.',
      createdAt: now - 5 * HOUR,
      read: false,
      storeId: 'ahorro',
    },
    {
      id: 'n4',
      type: 'list',
      title: 'Tu lista "Compra semanal" está lista',
      body: 'Conviértela en canasta y ahorra hasta $3.85 hoy.',
      createdAt: now - 1 * DAY - 3 * HOUR,
      read: true,
      listId: 'semanal',
    },
    {
      id: 'n5',
      type: 'price_drop',
      title: 'Aceite de oliva en oferta',
      body: 'Bajó a $6.95 en Mercado Sol. Es el precio más bajo en 8 semanas.',
      createdAt: now - 1 * DAY - 8 * HOUR,
      read: false,
      productId: 'olive-oil',
    },
    {
      id: 'n6',
      type: 'deal',
      title: 'Envío gratis los martes',
      body: 'Mercado Sol no cobra envío en ningún pedido este martes.',
      createdAt: now - 3 * DAY,
      read: true,
      storeId: 'sol',
    },
    {
      id: 'n7',
      type: 'price_drop',
      title: 'Café molido más barato',
      body: 'Café molido tostado bajó 16% en Mercado Sol.',
      createdAt: now - 4 * DAY,
      read: true,
      productId: 'coffee',
    },
    {
      id: 'n8',
      type: 'system',
      title: 'Bienvenido a Preci 👋',
      body: 'Compara precios entre 5 supermercados cercanos y arma tu canasta más barata.',
      createdAt: now - 9 * DAY,
      read: true,
    },
  ];
}

export type NotificationFilter = 'all' | 'unread' | 'prices' | 'deals';

export const NOTIFICATION_FILTERS: { id: NotificationFilter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'unread', label: 'No leídas' },
  { id: 'prices', label: 'Precios' },
  { id: 'deals', label: 'Ofertas' },
];

export function matchesFilter(n: AppNotification, filter: NotificationFilter) {
  switch (filter) {
    case 'unread':
      return !n.read;
    case 'prices':
      return n.type === 'price_drop' || n.type === 'alert';
    case 'deals':
      return n.type === 'deal';
    default:
      return true;
  }
}

/** "Hoy" / "Ayer" / "Esta semana" / "Anteriores" */
export function sectionFor(createdAt: number, now = Date.now()) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const t = startOfToday.getTime();
  if (createdAt >= t) return 'Hoy';
  if (createdAt >= t - DAY) return 'Ayer';
  if (createdAt >= t - 6 * DAY) return 'Esta semana';
  return 'Anteriores';
}

export function timeAgo(createdAt: number, now = Date.now()) {
  const diff = Math.max(0, now - createdAt);
  const min = Math.round(diff / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'Ayer' : `Hace ${d} días`;
}
