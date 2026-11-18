import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ScrollViewInstance,
} from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale, SectionHeader, Txt } from '@/components/home/primitives';
import { StoreLogo } from '@/components/home/store-badges';
import { MaxContentWidth, Radius } from '@/constants/theme';
import {
  CATEGORY_BY_ID,
  PRODUCTS,
  STORES,
  formatHour,
  isOpen,
  type Store,
  type StoreId,
} from '@/data/catalog';
import { formatPrice, storeLeaderboard, summarize, type PriceSummary } from '@/data/pricing';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';

type SortKey = 'featured' | 'near' | 'rating' | 'fast';

const SORTS: { id: SortKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'featured', label: 'Destacados', icon: 'sparkles-outline' },
  { id: 'near', label: 'Más cerca', icon: 'navigate-outline' },
  { id: 'rating', label: 'Mejor valorados', icon: 'star-outline' },
  { id: 'fast', label: 'Envío rápido', icon: 'flash-outline' },
];

/** Products where each store has the lowest price. */
function cheapestAt(storeId: StoreId): PriceSummary[] {
  return PRODUCTS.map((p) => summarize(p)!)
    .filter((s) => s.best.storeId === storeId)
    .sort((a, b) => b.savingsPct - a.savingsPct);
}

const openProduct = (id: string) => router.push({ pathname: '/product/[id]', params: { id } });

export default function ExploreScreen() {
  const tabBarInset = useTabBarInset();
  const c = useTheme();
  const { width } = useWindowDimensions();
  const [sort, setSort] = useState<SortKey>('featured');
  const [expanded, setExpanded] = useState<StoreId | null>(null);
  const scrollRef = useRef<ScrollViewInstance>(null);
  // y offsets used to scroll to a store row: section → list → row.
  const offsets = useRef({ section: 0, list: 0, rows: {} as Partial<Record<StoreId, number>> });

  const focusStore = (id: StoreId) => {
    setExpanded(id);
    const o = offsets.current;
    const y = 8 + o.section + o.list + (o.rows[id] ?? 0) - 16;
    scrollRef.current?.scrollTo({ y, animated: true });
  };

  const wins = useMemo(
    () => Object.fromEntries(storeLeaderboard().map((w) => [w.store.id, w.wins])) as Record<StoreId, number>,
    [],
  );
  const featured = STORES.filter((s) => s.featured);
  const promos = STORES.filter((s) => s.promo);

  const sorted = useMemo(() => {
    const list = [...STORES];
    switch (sort) {
      case 'near':
        return list.sort((a, b) => a.distanceKm - b.distanceKm);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'fast':
        return list.sort((a, b) => a.deliveryMin - b.deliveryMin);
      default:
        return list.sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || wins[b.id] - wins[a.id]);
    }
  }, [sort, wins]);

  const featuredWidth = Math.min(Math.min(width, MaxContentWidth) - 48, 340);

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: tabBarInset + 16 }]}>
          <View style={[styles.centered, styles.body]}>
            {/* Header */}
            <View style={styles.header}>
              <Txt variant="caption" color="textSecondary">
                {STORES.length} comercios cerca de ti
              </Txt>
              <Txt variant="display">Explorar</Txt>
            </View>

            {/* Featured */}
            <View>
              <SectionHeader title="Comercios destacados ⭐" />
              <FlatList
                horizontal
                data={featured}
                keyExtractor={(s) => s.id}
                showsHorizontalScrollIndicator={false}
                snapToInterval={featuredWidth + 12}
                decelerationRate="fast"
                contentContainerStyle={styles.hList}
                renderItem={({ item }) => (
                  <FeaturedCard
                    store={item}
                    wins={wins[item.id]}
                    width={featuredWidth}
                    onPress={() => focusStore(item.id)}
                  />
                )}
              />
            </View>

            {/* Promotions */}
            <View>
              <SectionHeader title="Promociones activas" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
                {promos.map((store) => (
                  <PressableScale
                    key={store.id}
                    onPress={() => focusStore(store.id)}
                    style={[styles.promo, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <View style={[styles.promoIcon, { backgroundColor: `${store.color}1F` }]}>
                      <Ionicons name="pricetags" size={18} color={store.color} />
                    </View>
                    <View style={styles.flex}>
                      <Txt variant="bodyStrong" numberOfLines={2}>
                        {store.promo}
                      </Txt>
                      <Txt variant="caption" color="textTertiary">
                        {store.name}
                      </Txt>
                    </View>
                  </PressableScale>
                ))}
              </ScrollView>
            </View>

            {/* All stores */}
            <View onLayout={(e) => (offsets.current.section = e.nativeEvent.layout.y)}>
              <SectionHeader title="Todos los comercios" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
                {SORTS.map((s) => {
                  const active = s.id === sort;
                  return (
                    <PressableScale
                      key={s.id}
                      onPress={() => setSort(s.id)}
                      style={[
                        styles.sortChip,
                        active
                          ? { backgroundColor: c.text, borderColor: c.text }
                          : { backgroundColor: c.surface, borderColor: c.border },
                      ]}>
                      <Ionicons name={s.icon} size={14} color={active ? c.background : c.textSecondary} />
                      <Txt variant="captionStrong" style={{ color: active ? c.background : c.text }}>
                        {s.label}
                      </Txt>
                    </PressableScale>
                  );
                })}
              </ScrollView>

              <View
                style={styles.storeList}
                onLayout={(e) => (offsets.current.list = e.nativeEvent.layout.y)}>
                {sorted.map((store) => (
                  <Animated.View
                    key={store.id}
                    layout={LinearTransition.duration(220)}
                    onLayout={(e) => (offsets.current.rows[store.id] = e.nativeEvent.layout.y)}>
                    <StoreRow
                      store={store}
                      wins={wins[store.id]}
                      expanded={expanded === store.id}
                      onToggle={() => setExpanded((e) => (e === store.id ? null : store.id))}
                    />
                  </Animated.View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FeaturedCard({
  store,
  wins,
  width,
  onPress,
}: {
  store: Store;
  wins: number;
  width: number;
  onPress: () => void;
}) {
  const c = useTheme();
  const open = isOpen(store);

  return (
    <PressableScale
      activeScale={0.98}
      onPress={onPress}
      style={[styles.featured, { width, backgroundColor: c.surface, borderColor: c.border }]}>
      <View
        style={[
          styles.cover,
          {
            backgroundColor: store.color,
            experimental_backgroundImage: `linear-gradient(135deg, ${store.color} 0%, ${store.color}B3 100%)`,
          },
        ]}>
        <View style={styles.coverRing} />
        <View style={styles.coverEmojis}>
          {store.cover.map((e, i) => (
            <Text key={i} style={[styles.coverEmoji, i === 1 && styles.coverEmojiMain]}>
              {e}
            </Text>
          ))}
        </View>
        {store.promo && (
          <View style={styles.coverPromo}>
            <Ionicons name="pricetag" size={12} color={store.color} />
            <Txt variant="captionStrong" style={{ color: store.color }} numberOfLines={1}>
              {store.promo}
            </Txt>
          </View>
        )}
      </View>

      <View style={styles.featuredBody}>
        <View style={styles.featuredTitle}>
          <StoreLogo id={store.id} size={36} />
          <View style={styles.flex}>
            <Txt variant="bodyStrong">{store.name}</Txt>
            <Txt variant="caption" color="textTertiary" numberOfLines={1}>
              {store.tagline}
            </Txt>
          </View>
          <View style={[styles.rating, { backgroundColor: c.surfaceMuted }]}>
            <Ionicons name="star" size={12} color={c.warning} />
            <Txt variant="captionStrong">{store.rating.toFixed(1)}</Txt>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Meta icon="location-outline" text={`${store.distanceKm.toFixed(1)} km`} />
          <Meta icon="bicycle-outline" text={`${store.deliveryMin} min`} />
          <Meta
            icon="time-outline"
            text={open ? `Abierto · cierra ${formatHour(store.closesAt)}` : `Abre ${formatHour(store.opensAt)}`}
            color={open ? c.primary : c.deal}
          />
        </View>

        <View style={[styles.winsBar, { backgroundColor: c.primarySoft }]}>
          <Ionicons name="trophy" size={14} color={c.primary} />
          <Txt variant="caption" color="primaryStrong">
            Precio más bajo en <Txt variant="captionStrong" color="primaryStrong">{wins} productos</Txt>
          </Txt>
        </View>
      </View>
    </PressableScale>
  );
}

function StoreRow({
  store,
  wins,
  expanded,
  onToggle,
}: {
  store: Store;
  wins: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const c = useTheme();
  const open = isOpen(store);
  const deals = useMemo(() => (expanded ? cheapestAt(store.id).slice(0, 4) : []), [expanded, store.id]);

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: c.surface, borderColor: expanded ? c.primary : c.border },
      ]}>
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.rowHead, pressed && styles.pressed]}>
        <StoreLogo id={store.id} size={48} />
        <View style={styles.flex}>
          <View style={styles.rowTitle}>
            <Txt variant="bodyStrong" numberOfLines={1} style={styles.shrink}>
              {store.name}
            </Txt>
            <View style={[styles.statusDot, { backgroundColor: open ? c.primary : c.deal }]} />
            <Txt variant="caption" color={open ? 'primary' : 'deal'}>
              {open ? 'Abierto' : 'Cerrado'}
            </Txt>
          </View>
          <View style={styles.metaRow}>
            <Meta icon="star" text={`${store.rating.toFixed(1)} (${(store.reviews / 1000).toFixed(1)}k)`} color={c.warning} />
            <Meta icon="location-outline" text={`${store.distanceKm.toFixed(1)} km`} />
            <Meta icon="bicycle-outline" text={`${store.deliveryMin} min`} />
          </View>
          <View style={styles.specialties}>
            {store.specialties.map((sp) => (
              <View key={sp} style={[styles.specialty, { backgroundColor: c.surfaceMuted }]}>
                <Txt variant="caption" color="textSecondary">
                  {CATEGORY_BY_ID[sp].emoji} {CATEGORY_BY_ID[sp].label}
                </Txt>
              </View>
            ))}
          </View>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={c.textTertiary} />
      </Pressable>

      {expanded && (
        <Animated.View entering={FadeIn.duration(200)} style={[styles.expand, { borderTopColor: c.border }]}>
          <View style={styles.expandInfo}>
            <Meta icon="map-outline" text={store.address} />
            <Meta icon="time-outline" text={`${formatHour(store.opensAt)} – ${formatHour(store.closesAt)}`} />
            {store.freeDeliveryFrom !== undefined && (
              <Meta
                icon="gift-outline"
                text={store.freeDeliveryFrom === 0 ? 'Envío gratis' : `Envío gratis desde ${formatPrice(store.freeDeliveryFrom)}`}
              />
            )}
          </View>

          <Txt variant="captionStrong" color="textTertiary" style={styles.expandLabel}>
            MÁS BARATO AQUÍ ({wins})
          </Txt>
          {deals.length === 0 ? (
            <Txt variant="caption" color="textTertiary">
              Por ahora no tiene el precio más bajo en ningún producto.
            </Txt>
          ) : (
            <View style={styles.dealGrid}>
              {deals.map((d) => (
                <PressableScale
                  key={d.product.id}
                  onPress={() => openProduct(d.product.id)}
                  style={[styles.deal, { backgroundColor: c.surfaceMuted }]}>
                  <Text style={styles.dealEmoji}>{d.product.emoji}</Text>
                  <View style={styles.flex}>
                    <Txt variant="caption" numberOfLines={1}>
                      {d.product.name}
                    </Txt>
                    <Txt variant="captionStrong" color="primary">
                      {formatPrice(d.best.price)}
                    </Txt>
                  </View>
                </PressableScale>
              ))}
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

function Meta({
  icon,
  text,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color?: string;
}) {
  const c = useTheme();
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={12} color={color ?? c.textTertiary} />
      <Txt variant="caption" color="textSecondary">
        {text}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  pressed: { opacity: 0.7 },
  scroll: { paddingTop: 8 },
  centered: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  body: { gap: 32 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  hList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  featured: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cover: {
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coverRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 28,
    borderColor: 'rgba(255,255,255,0.12)',
    right: -70,
    top: -80,
  },
  coverEmojis: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  coverEmoji: { fontSize: 40 },
  coverEmojiMain: { fontSize: 60 },
  coverPromo: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    right: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: Radius.pill,
    backgroundColor: '#FFFFFF',
    maxWidth: 240,
  },
  featuredBody: {
    padding: 16,
    gap: 12,
  },
  featuredTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 26,
    borderRadius: Radius.pill,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  winsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: Radius.sm,
  },
  promo: {
    width: 220,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  promoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  storeList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  row: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
  },
  rowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  specialty: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  expand: {
    borderTopWidth: 1,
    padding: 16,
    gap: 12,
  },
  expandInfo: { gap: 6 },
  expandLabel: {
    letterSpacing: 0.8,
    fontSize: 11,
    marginTop: 4,
  },
  dealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deal: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: Radius.sm,
  },
  dealEmoji: { fontSize: 26 },
});
