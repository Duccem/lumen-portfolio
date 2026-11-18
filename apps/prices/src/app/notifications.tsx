import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale, Txt } from '@/components/home/primitives';
import { StoreLogo } from '@/components/home/store-badges';
import { MaxContentWidth, Radius } from '@/constants/theme';
import { getProduct } from '@/data/catalog';
import {
  NOTIFICATION_FILTERS,
  matchesFilter,
  sectionFor,
  timeAgo,
  type AppNotification,
  type NotificationFilter,
  type NotificationType,
} from '@/data/notifications';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-state';

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/' as Href));
const rowLayout = LinearTransition.duration(200);
const SECTIONS = ['Hoy', 'Ayer', 'Esta semana', 'Anteriores'] as const;

function confirm(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Borrar', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function NotificationsScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const app = useAppState();
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const [now] = useState(() => Date.now());
  const visible = [...app.notifications]
    .filter((n) => matchesFilter(n, filter))
    .sort((a, b) => b.createdAt - a.createdAt);
  const grouped = SECTIONS.map((title) => ({
    title,
    items: visible.filter((n) => sectionFor(n.createdAt, now) === title),
  })).filter((g) => g.items.length > 0);

  const counts: Record<NotificationFilter, number> = {
    all: app.notifications.length,
    unread: app.unreadCount,
    prices: app.notifications.filter((n) => matchesFilter(n, 'prices')).length,
    deals: app.notifications.filter((n) => matchesFilter(n, 'deals')).length,
  };

  const open = (n: AppNotification) => {
    app.markRead(n.id);
    if (n.productId) router.push({ pathname: '/product/[id]', params: { id: n.productId } });
    else if (n.listId) router.push({ pathname: '/list/[id]', params: { id: n.listId } });
    else if (n.storeId) router.push('/explore');
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: c.border, backgroundColor: c.background }]}>
        <View style={styles.headerInner}>
          <RoundButton icon="chevron-back" label="Volver" onPress={goBack} />
          <View style={styles.headerTitle}>
            <Txt variant="title">Notificaciones</Txt>
            <Txt variant="caption" color="textTertiary">
              {app.unreadCount === 0 ? 'Estás al día' : `${app.unreadCount} sin leer`}
            </Txt>
          </View>
          <RoundButton
            icon="settings-outline"
            label="Preferencias de notificaciones"
            onPress={() => router.push('/settings')}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {NOTIFICATION_FILTERS.map((f) => {
            const active = f.id === filter;
            return (
              <PressableScale
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={[
                  styles.filter,
                  active
                    ? { backgroundColor: c.text, borderColor: c.text }
                    : { backgroundColor: c.surface, borderColor: c.border },
                ]}>
                <Txt variant="captionStrong" style={{ color: active ? c.background : c.text }}>
                  {f.label}
                </Txt>
                {counts[f.id] > 0 && (
                  <View
                    style={[
                      styles.count,
                      { backgroundColor: active ? c.background : f.id === 'unread' ? c.primary : c.surfaceMuted },
                    ]}>
                    <Txt
                      variant="captionStrong"
                      style={[
                        styles.countText,
                        { color: active ? c.text : f.id === 'unread' ? c.onPrimary : c.textSecondary },
                      ]}>
                      {counts[f.id]}
                    </Txt>
                  </View>
                )}
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={styles.centered}>
          {app.unreadCount > 0 && (
            <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)} layout={rowLayout}>
              <Pressable
                onPress={app.markAllRead}
                style={({ pressed }) => [styles.markAll, { backgroundColor: c.primarySoft }, pressed && styles.pressed]}>
                <Ionicons name="checkmark-done" size={16} color={c.primary} />
                <Txt variant="captionStrong" color="primaryStrong" style={styles.flex}>
                  Marcar todas como leídas
                </Txt>
                <Txt variant="caption" color="primary">
                  {app.unreadCount}
                </Txt>
              </Pressable>
            </Animated.View>
          )}

          {grouped.length === 0 ? (
            <EmptyState
              filtered={app.notifications.length > 0}
              onReset={() => (app.notifications.length > 0 ? setFilter('all') : app.resetNotifications())}
            />
          ) : (
            grouped.map((group) => (
              <Animated.View key={group.title} layout={rowLayout} style={styles.section}>
                <Txt variant="captionStrong" color="textTertiary" style={styles.sectionTitle}>
                  {group.title.toUpperCase()}
                </Txt>
                <View style={styles.list}>
                  {group.items.map((n) => (
                    <Animated.View
                      key={n.id}
                      layout={rowLayout}
                      entering={FadeIn.duration(160)}
                      exiting={FadeOut.duration(140)}>
                      <NotificationRow
                        notification={n}
                        now={now}
                        onOpen={() => open(n)}
                        onToggleRead={() => app.markRead(n.id, !n.read)}
                        onDelete={() => app.removeNotification(n.id)}
                      />
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            ))
          )}

          {app.notifications.length > 0 && (
            <View style={styles.footer}>
              <Txt variant="caption" color="textTertiary" style={styles.center}>
                Desliza una notificación a la izquierda para ver más opciones
              </Txt>
              <Pressable
                hitSlop={8}
                onPress={() =>
                  confirm('Borrar notificaciones', 'Se eliminarán todas tus notificaciones.', app.clearNotifications)
                }>
                <Txt variant="captionStrong" color="deal">
                  Borrar todas
                </Txt>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const TYPE_STYLE: Record<NotificationType, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  alert: { icon: 'notifications', color: '#E8A21A' },
  price_drop: { icon: 'trending-down', color: '#17A04F' },
  deal: { icon: 'pricetags', color: '#E5484D' },
  list: { icon: 'list', color: '#3B82F6' },
  system: { icon: 'sparkles', color: '#8B5CF6' },
};

function NotificationRow({
  notification: n,
  now,
  onOpen,
  onToggleRead,
  onDelete,
}: {
  notification: AppNotification;
  now: number;
  onOpen: () => void;
  onToggleRead: () => void;
  onDelete: () => void;
}) {
  const c = useTheme();
  const swipeRef = useRef<SwipeableMethods>(null);
  const kind = TYPE_STYLE[n.type];
  const product = n.productId ? getProduct(n.productId) : undefined;

  const renderActions = () => (
    <View style={styles.actions}>
      <Pressable
        onPress={() => {
          swipeRef.current?.close();
          onToggleRead();
        }}
        style={[styles.action, { backgroundColor: c.primarySoft }]}>
        <Ionicons name={n.read ? 'mail-unread-outline' : 'mail-open-outline'} size={20} color={c.primary} />
        <Txt variant="captionStrong" color="primaryStrong" style={styles.actionText}>
          {n.read ? 'No leída' : 'Leída'}
        </Txt>
      </Pressable>
      <Pressable onPress={onDelete} style={[styles.action, { backgroundColor: c.deal }]}>
        <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
        <Txt variant="captionStrong" style={[styles.actionText, styles.white]}>
          Eliminar
        </Txt>
      </Pressable>
    </View>
  );

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      friction={1.6}
      rightThreshold={48}
      overshootRight={false}
      renderRightActions={renderActions}
      containerStyle={styles.swipe}>
      <Pressable
        onPress={onOpen}
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: n.read ? c.surface : c.backgroundSelected,
            borderColor: n.read ? c.border : `${c.primary}33`,
          },
          pressed && styles.pressed,
        ]}>
        <View style={[styles.iconTile, { backgroundColor: `${kind.color}1F` }]}>
          {product ? (
            <Text style={styles.productEmoji}>{product.emoji}</Text>
          ) : n.storeId ? (
            <StoreLogo id={n.storeId} size={32} />
          ) : (
            <Ionicons name={kind.icon} size={20} color={kind.color} />
          )}
          {(product || n.storeId) && (
            <View style={[styles.kindBadge, { backgroundColor: kind.color, borderColor: c.surface }]}>
              <Ionicons name={kind.icon} size={10} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.flex}>
          <View style={styles.rowTop}>
            <Txt variant="bodyStrong" numberOfLines={1} style={styles.flex}>
              {n.title}
            </Txt>
            <Txt variant="caption" color="textTertiary">
              {timeAgo(n.createdAt, now)}
            </Txt>
          </View>
          <Txt variant="caption" color="textSecondary" numberOfLines={2} style={styles.body}>
            {n.body}
          </Txt>
        </View>

        {!n.read && <View style={[styles.unreadDot, { backgroundColor: c.primary }]} />}
      </Pressable>
    </ReanimatedSwipeable>
  );
}

function EmptyState({ filtered, onReset }: { filtered: boolean; onReset: () => void }) {
  const c = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.empty}>
      <View style={[styles.emptyCircle, { backgroundColor: c.primarySoft }]}>
        <Text style={styles.emptyEmoji}>{filtered ? '🔍' : '🔔'}</Text>
      </View>
      <Txt variant="title" style={styles.center}>
        {filtered ? 'Nada por aquí' : 'Sin notificaciones'}
      </Txt>
      <Txt variant="body" color="textSecondary" style={styles.center}>
        {filtered
          ? 'No hay notificaciones con este filtro.'
          : 'Te avisaremos cuando bajen los precios de tus favoritos o se cumplan tus alertas.'}
      </Txt>
      <PressableScale onPress={onReset} style={[styles.emptyBtn, { backgroundColor: c.primary }]}>
        <Txt variant="bodyStrong" style={{ color: c.onPrimary }}>
          {filtered ? 'Ver todas' : 'Restaurar demo'}
        </Txt>
      </PressableScale>
    </Animated.View>
  );
}

function RoundButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const c = useTheme();
  return (
    <PressableScale
      activeScale={0.9}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.round, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Ionicons name={icon} size={20} color={c.text} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  white: { color: '#FFFFFF' },
  pressed: { opacity: 0.7 },
  header: { borderBottomWidth: 1, paddingBottom: 12, gap: 12 },
  headerInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  headerTitle: { flex: 1, alignItems: 'center' },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    paddingHorizontal: 16,
    gap: 8,
    flexGrow: 1,
    justifyContent: 'center',
  },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  count: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontSize: 11, lineHeight: 14 },
  centered: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 20,
  },
  markAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: Radius.md,
  },
  section: { gap: 8 },
  sectionTitle: {
    letterSpacing: 0.8,
    fontSize: 11,
    paddingHorizontal: 4,
  },
  list: { gap: 8 },
  swipe: { borderRadius: Radius.md },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productEmoji: { fontSize: 24 },
  kindBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  body: { marginTop: 2, lineHeight: 18 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 8,
  },
  action: {
    width: 76,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionText: { fontSize: 11 },
  footer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  emptyCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyEmoji: { fontSize: 44 },
  emptyBtn: {
    marginTop: 16,
    height: 48,
    paddingHorizontal: 24,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
