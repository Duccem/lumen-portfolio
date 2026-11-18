import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type TextInputInstance,
} from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChips } from '@/components/home/category-chips';
import { EmptyState } from '@/components/home/empty-state';
import { FilterSheet } from '@/components/home/filter-sheet';
import { DROP_CARD_WIDTH, PriceDropCard } from '@/components/home/price-drop-card';
import { PressableScale, SectionHeader, Txt } from '@/components/home/primitives';
import { ProductCard } from '@/components/home/product-card';
import { SavingsHero } from '@/components/home/savings-hero';
import { SearchBar } from '@/components/home/search-bar';
import { SearchSuggestions } from '@/components/home/search-suggestions';
import { StoreStrip } from '@/components/home/store-strip';
import { BASKET_BAR_SPACE, BasketBar } from '@/components/home/basket-bar';
import { MaxContentWidth, Radius } from '@/constants/theme';
import { CATEGORY_BY_ID, STORE_BY_ID, type CategoryId } from '@/data/catalog';
import {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  activeFilterCount,
  recentDrops,
  searchProducts,
  storeLeaderboard,
  weeklySavings,
  type Filters,
  type PriceSummary,
} from '@/data/pricing';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-state';

const GUTTER = 16;
const GAP = 12;

const openProduct = (id: string) => router.push({ pathname: '/product/[id]', params: { id } });

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HomeScreen() {
  const tabBarInset = useTabBarInset();
  const c = useTheme();
  const { width } = useWindowDimensions();
  const inputRef = useRef<TextInputInstance>(null);

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [category, setCategory] = useState<CategoryId>('all');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const app = useAppState();
  const listCount = Object.keys(app.list).length;

  const filterCount = activeFilterCount(filters);
  const searching = query.trim().length > 0 || filterCount > 0;

  const results = useMemo(() => searchProducts(query, category, filters), [query, category, filters]);
  const drops = useMemo(() => recentDrops(category), [category]);
  const radiusKm = app.settings.radiusKm;
  const leaderboard = useMemo(
    () => storeLeaderboard().filter((s) => s.store.distanceKm <= radiusKm),
    [radiusKm],
  );
  const savings = useMemo(() => weeklySavings(), []);

  const contentWidth = Math.min(width, MaxContentWidth);
  const columns = contentWidth >= 600 ? 3 : 2;
  const cardWidth = Math.floor((contentWidth - GUTTER * 2 - GAP * (columns - 1)) / columns);

  const toggleList = (summary: PriceSummary) => {
    const id = summary.product.id;
    app.setListItem(id, app.list[id] ? null : { qty: 1, storeId: summary.best.storeId });
  };

  const resetAll = () => {
    setQuery('');
    setFilters(DEFAULT_FILTERS);
    setCategory('all');
  };

  const pickSuggestion = (term: string) => {
    setQuery(term);
    inputRef.current?.blur();
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        <ScrollView
          stickyHeaderIndices={[1]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: tabBarInset + 16 + (listCount ? BASKET_BAR_SPACE : 0) }]}>
          {/* 0 — Header */}
          <View style={styles.centered}>
            <Header listCount={listCount} />
          </View>

          {/* 1 — Sticky search */}
          <View style={[styles.sticky, { backgroundColor: c.background }]}>
            <View style={styles.centered}>
              <SearchBar
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                focused={focused}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onOpenFilters={() => setSheetOpen(true)}
                filterCount={filterCount}
              />
            </View>
          </View>

          {/* 2 — Body */}
          <View style={[styles.centered, styles.body]}>
            {focused && !query && <SearchSuggestions onPick={pickSuggestion} />}

            {!searching && !focused && (
              <Animated.View entering={FadeIn.duration(300)}>
                <SavingsHero
                  amount={savings}
                  onPress={() => setFilters({ ...DEFAULT_FILTERS, onlyDeals: true, sort: 'drop' })}
                />
              </Animated.View>
            )}

            <View>
              <SectionHeader title="Categorías" />
              <CategoryChips selected={category} onSelect={setCategory} />
            </View>

            {searching ? (
              <ResultsHeader
                count={results.length}
                query={query.trim()}
                filters={filters}
                onClearFilters={() => setFilters(DEFAULT_FILTERS)}
              />
            ) : (
              <>
                {drops.length > 0 && (
                  <Animated.View entering={FadeIn.duration(200)}>
                    <SectionHeader
                      title="Bajaron de precio 📉"
                      action="Ver todo"
                      onAction={() => setFilters({ ...DEFAULT_FILTERS, onlyDeals: true, sort: 'drop' })}
                    />
                    <FlatList
                      horizontal
                      data={drops}
                      keyExtractor={(s) => s.product.id}
                      showsHorizontalScrollIndicator={false}
                      snapToInterval={DROP_CARD_WIDTH + GAP}
                      decelerationRate="fast"
                      contentContainerStyle={styles.hList}
                      renderItem={({ item }) => (
                        <PriceDropCard summary={item} onPress={() => openProduct(item.product.id)} />
                      )}
                    />
                  </Animated.View>
                )}

                <View>
                  <SectionHeader title="Supermercados cerca" action={`< ${radiusKm} km`} />
                  <StoreStrip
                    stores={leaderboard}
                    onSelect={(store) => setFilters({ ...DEFAULT_FILTERS, stores: [store.id] })}
                  />
                </View>

                <SectionHeader
                  title={category === 'all' ? 'Productos populares' : CATEGORY_BY_ID[category].label}
                  action={`${results.length} productos`}
                />
              </>
            )}

            {results.length === 0 ? (
              <EmptyState query={query.trim()} onReset={resetAll} />
            ) : (
              <ProductGrid
                items={results}
                cardWidth={cardWidth}
                favorites={app.favorites}
                list={app.list}
                onToggleFavorite={app.toggleFavorite}
                onToggleList={toggleList}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <BasketBar />

      <FilterSheet
        visible={sheetOpen}
        initial={filters}
        onClose={() => setSheetOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setSheetOpen(false);
        }}
        countFor={(draft) => searchProducts(query, category, draft).length}
      />
    </View>
  );
}

function Header({ listCount }: { listCount: number }) {
  const c = useTheme();
  const app = useAppState();
  const name = app.session?.name;
  const unread = app.unreadCount;
  return (
    <View style={styles.header}>
      <View style={styles.flex}>
        <Txt variant="caption" color="textSecondary">
          {greeting()}
          {name ? `, ${name}` : ''} 👋
        </Txt>
        <Txt variant="display">¿Qué cocinamos hoy?</Txt>
        <View style={styles.location}>
          <Ionicons name="location" size={14} color={c.primary} />
          <Txt variant="captionStrong" color="textSecondary">
            Palermo, Buenos Aires
          </Txt>
          <Ionicons name="chevron-down" size={12} color={c.textSecondary} />
        </View>
      </View>

      <View style={styles.headerActions}>
        <IconButton
          icon="notifications-outline"
          badge={unread}
          tone="deal"
          label="Notificaciones"
          onPress={() => router.push('/notifications')}
        />
        <IconButton
          icon="basket-outline"
          badge={listCount}
          label="Ver canasta"
          onPress={() => router.push('/basket')}
        />
      </View>
    </View>
  );
}

function IconButton({
  icon,
  dot,
  badge,
  tone = 'primary',
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  dot?: boolean;
  badge?: number;
  tone?: 'primary' | 'deal';
  label: string;
  onPress?: () => void;
}) {
  const c = useTheme();
  return (
    <PressableScale
      activeScale={0.9}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.iconButton, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Ionicons name={icon} size={20} color={c.text} />
      {dot && <View style={[styles.dot, { backgroundColor: c.deal, borderColor: c.surface }]} />}
      {!!badge && (
        <Animated.View
          key={badge}
          entering={FadeIn.duration(200)}
          style={[styles.countBadge, { backgroundColor: c[tone], borderColor: c.background }]}>
          <Txt variant="captionStrong" style={[styles.countText, { color: tone === 'deal' ? '#FFFFFF' : c.onPrimary }]}>
            {badge > 9 ? '9+' : badge}
          </Txt>
        </Animated.View>
      )}
    </PressableScale>
  );
}

function ResultsHeader({
  count,
  query,
  filters,
  onClearFilters,
}: {
  count: number;
  query: string;
  filters: Filters;
  onClearFilters: () => void;
}) {
  const c = useTheme();
  const tags: string[] = [];
  if (filters.sort !== 'relevance') tags.push(SORT_OPTIONS.find((o) => o.id === filters.sort)!.label);
  if (filters.stores.length === 1) tags.push(STORE_BY_ID[filters.stores[0]].name);
  else if (filters.stores.length > 1) tags.push(`${filters.stores.length} supermercados`);
  if (filters.maxPrice !== null) tags.push(`Hasta $${filters.maxPrice}`);
  if (filters.onlyDeals) tags.push('Bajaron de precio');

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut} style={styles.resultsHeader}>
      <View style={styles.resultsTitle}>
        <Txt variant="title">
          {count} {count === 1 ? 'resultado' : 'resultados'}
        </Txt>
        {query ? (
          <Txt variant="body" color="textSecondary" numberOfLines={1} style={styles.flex}>
            para “{query}”
          </Txt>
        ) : null}
      </View>
      {tags.length > 0 && (
        <View style={styles.tags}>
          {tags.map((t) => (
            <View key={t} style={[styles.tag, { backgroundColor: c.primarySoft }]}>
              <Txt variant="captionStrong" color="primaryStrong">
                {t}
              </Txt>
            </View>
          ))}
          <PressableScale onPress={onClearFilters} style={[styles.tag, { backgroundColor: c.surfaceMuted }]}>
            <Ionicons name="close" size={12} color={c.textSecondary} />
            <Txt variant="captionStrong" color="textSecondary">
              Quitar filtros
            </Txt>
          </PressableScale>
        </View>
      )}
    </Animated.View>
  );
}

function ProductGrid({
  items,
  cardWidth,
  favorites,
  list,
  onToggleFavorite,
  onToggleList,
}: {
  items: PriceSummary[];
  cardWidth: number;
  favorites: string[];
  list: Record<string, unknown>;
  onToggleFavorite: (id: string) => void;
  onToggleList: (summary: PriceSummary) => void;
}) {
  return (
    <View style={styles.grid}>
      {items.map((summary) => (
        // Subtle: short cross-fade, no stagger / bounce, quick timed reflow.
        <Animated.View
          key={summary.product.id}
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(100)}
          layout={LinearTransition.duration(200)}>
          <ProductCard
            summary={summary}
            width={cardWidth}
            favorite={favorites.includes(summary.product.id)}
            inList={!!list[summary.product.id]}
            onPress={() => openProduct(summary.product.id)}
            onToggleFavorite={() => onToggleFavorite(summary.product.id)}
            onToggleList={() => onToggleList(summary)}
          />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    paddingTop: 8,
  },
  centered: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  sticky: {
    paddingVertical: 12,
    zIndex: 10,
  },
  body: {
    gap: 28,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: GUTTER,
    paddingTop: 8,
    gap: 12,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 10,
    lineHeight: 12,
  },
  hList: {
    paddingHorizontal: GUTTER,
    gap: GAP,
  },
  resultsHeader: {
    paddingHorizontal: GUTTER,
    gap: 12,
    marginBottom: -8,
  },
  resultsTitle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 28,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    paddingHorizontal: GUTTER,
  },
});
