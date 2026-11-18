import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Appearance, Platform } from 'react-native';

import { type Session } from '@/data/auth';
import { type StoreId } from '@/data/catalog';
import { seedNotifications, type AppNotification } from '@/data/notifications';
import { LIST_EMOJIS, SEED_LISTS, newId, type ListEntry, type ShoppingList } from '@/data/lists';

export type ThemePreference = 'system' | 'light' | 'dark';

export type Settings = {
  theme: ThemePreference;
  priceAlerts: boolean;
  weeklyDigest: boolean;
  radiusKm: 2 | 5 | 10;
  preferredStores: StoreId[];
  showUnitPrice: boolean;
};

export type ListItem = { qty: number; storeId: StoreId };

type Persisted = {
  settings: Settings;
  favorites: string[];
  list: Record<string, ListItem>;
  /** productId → target price */
  alerts: Record<string, number>;
  shoppingLists: ShoppingList[];
  /** Fake session (see data/auth.ts). null = guest. */
  session: Session | null;
  notifications: AppNotification[];
};

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  priceAlerts: true,
  weeklyDigest: false,
  radiusKm: 5,
  preferredStores: [],
  showUnitPrice: true,
};

const INITIAL: Persisted = {
  settings: DEFAULT_SETTINGS,
  favorites: [],
  list: { milk: { qty: 2, storeId: 'ahorro' }, eggs: { qty: 1, storeId: 'verde' } },
  alerts: {},
  shoppingLists: SEED_LISTS,
  session: null,
  notifications: seedNotifications(),
};

const STORAGE_KEY = 'prices/app-state/v1';

type AppState = Persisted & {
  hydrated: boolean;
  updateSettings: (patch: Partial<Settings>) => void;
  resetSettings: () => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setListItem: (id: string, item: ListItem | null) => void;
  /** Adds `delta` to the quantity; removes the item when it reaches 0. */
  updateQty: (id: string, delta: number) => void;
  /** Bulk-change the store of several basket items. */
  setItemsStore: (changes: Record<string, StoreId>) => void;
  clearList: () => void;
  clearFavorites: () => void;
  setAlert: (id: string, target: number | null) => void;

  // Notifications
  unreadCount: number;
  markRead: (id: string, read?: boolean) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  /** Restore the demo notifications (handy while everything is mocked). */
  resetNotifications: () => void;

  // Session
  signIn: (session: Session) => void;
  signOut: () => void;

  // Shopping lists
  createList: (init?: { name?: string; entries?: ListEntry[] }) => string;
  updateList: (id: string, patch: Partial<Pick<ShoppingList, 'name' | 'emoji'>>) => void;
  deleteList: (id: string) => void;
  addEntries: (listId: string, entries: ListEntry[]) => void;
  updateEntry: (listId: string, entryId: string, patch: Partial<Omit<ListEntry, 'id'>>) => void;
  removeEntry: (listId: string, entryId: string) => void;
  /** Put converted items in the basket, summing quantities unless `replace`. */
  mergeIntoBasket: (items: Record<string, ListItem>, replace?: boolean) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const skipFirstSave = useRef(true);

  // Load once.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<Persisted>;
        setState((prev) => ({
          ...prev,
          ...saved,
          settings: { ...DEFAULT_SETTINGS, ...saved.settings },
        }));
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  // Save on change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  // Make native UI (tab bar, switches, alerts) follow the chosen theme.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    Appearance.setColorScheme(state.settings.theme === 'system' ? 'unspecified' : state.settings.theme);
  }, [state.settings.theme]);

  const value = useMemo<AppState>(
    () => ({
      ...state,
      hydrated,
      updateSettings: (patch) =>
        setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      resetSettings: () => setState((s) => ({ ...s, settings: DEFAULT_SETTINGS })),
      toggleFavorite: (id) =>
        setState((s) => ({
          ...s,
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      isFavorite: (id) => state.favorites.includes(id),
      setListItem: (id, item) =>
        setState((s) => {
          const list = { ...s.list };
          if (item) list[id] = item;
          else delete list[id];
          return { ...s, list };
        }),
      updateQty: (id, delta) =>
        setState((s) => {
          const current = s.list[id];
          if (!current) return s;
          const list = { ...s.list };
          const qty = current.qty + delta;
          if (qty <= 0) delete list[id];
          else list[id] = { ...current, qty: Math.min(99, qty) };
          return { ...s, list };
        }),
      setItemsStore: (changes) =>
        setState((s) => {
          const list = { ...s.list };
          for (const [id, storeId] of Object.entries(changes)) {
            if (list[id]) list[id] = { ...list[id], storeId };
          }
          return { ...s, list };
        }),
      clearList: () => setState((s) => ({ ...s, list: {} })),
      clearFavorites: () => setState((s) => ({ ...s, favorites: [] })),
      unreadCount: state.notifications.filter((n) => !n.read).length,
      markRead: (id, read = true) =>
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read } : n)),
        })),
      markAllRead: () =>
        setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      removeNotification: (id) =>
        setState((s) => ({ ...s, notifications: s.notifications.filter((n) => n.id !== id) })),
      clearNotifications: () => setState((s) => ({ ...s, notifications: [] })),
      resetNotifications: () => setState((s) => ({ ...s, notifications: seedNotifications() })),
      signIn: (session) => setState((s) => ({ ...s, session })),
      signOut: () => setState((s) => ({ ...s, session: null })),
      createList: (init) => {
        const id = newId();
        setState((s) => ({
          ...s,
          shoppingLists: [
            {
              id,
              name: init?.name ?? 'Nueva lista',
              emoji: LIST_EMOJIS[s.shoppingLists.length % LIST_EMOJIS.length],
              entries: init?.entries ?? [],
              createdAt: Date.now(),
            },
            ...s.shoppingLists,
          ],
        }));
        return id;
      },
      updateList: (id, patch) =>
        setState((s) => ({
          ...s,
          shoppingLists: s.shoppingLists.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),
      deleteList: (id) =>
        setState((s) => ({ ...s, shoppingLists: s.shoppingLists.filter((l) => l.id !== id) })),
      addEntries: (listId, entries) =>
        setState((s) => ({
          ...s,
          shoppingLists: s.shoppingLists.map((l) =>
            l.id === listId ? { ...l, entries: [...l.entries, ...entries] } : l,
          ),
        })),
      updateEntry: (listId, entryId, patch) =>
        setState((s) => ({
          ...s,
          shoppingLists: s.shoppingLists.map((l) =>
            l.id === listId
              ? { ...l, entries: l.entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e)) }
              : l,
          ),
        })),
      removeEntry: (listId, entryId) =>
        setState((s) => ({
          ...s,
          shoppingLists: s.shoppingLists.map((l) =>
            l.id === listId ? { ...l, entries: l.entries.filter((e) => e.id !== entryId) } : l,
          ),
        })),
      mergeIntoBasket: (items, replace) =>
        setState((s) => {
          const list = replace ? {} : { ...s.list };
          for (const [id, item] of Object.entries(items)) {
            const prev = list[id];
            list[id] = prev && !replace ? { qty: Math.min(99, prev.qty + item.qty), storeId: item.storeId } : item;
          }
          return { ...s, list };
        }),
      setAlert: (id, target) =>
        setState((s) => {
          const alerts = { ...s.alerts };
          if (target === null) delete alerts[id];
          else alerts[id] = target;
          return { ...s, alerts };
        }),
    }),
    [state, hydrated],
  );

  return <AppStateContext value={value}>{children}</AppStateContext>;
}

export function useAppState() {
  const ctx = use(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}

/** Theme preference only — safe to call outside the provider (falls back to system). */
export function useThemePreference(): ThemePreference {
  return use(AppStateContext)?.settings.theme ?? 'system';
}
