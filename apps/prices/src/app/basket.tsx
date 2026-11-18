import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale, Txt } from '@/components/home/primitives';
import { StoreLogo } from '@/components/home/store-badges';
import { MaxContentWidth, Radius } from '@/constants/theme';
import { buildBasket, storeName, type BasketLine, type StoreGroup } from '@/data/basket';
import { CATEGORY_BY_ID, PRODUCTS, type StoreId } from '@/data/catalog';
import { formatPrice, summarize } from '@/data/pricing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-state';

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/' as Href));
const openProduct = (id: string) => router.push({ pathname: '/product/[id]', params: { id } });

function confirm(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Vaciar', style: 'destructive', onPress: onConfirm },
  ]);
}

// Shared row transition: quick timed reflow, no bounce.
const rowLayout = LinearTransition.duration(220);

export default function BasketScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const app = useAppState();
  const basket = buildBasket(app.list);
  const empty = basket.lines.length === 0;

  const optimize = () => {
    const changes: Record<string, StoreId> = {};
    for (const l of basket.lines) changes[l.product.id] = l.cheapest.storeId;
    app.setItemsStore(changes);
  };

  const moveAllTo = (storeId: StoreId) => {
    const changes: Record<string, StoreId> = {};
    for (const l of basket.lines) {
      if (l.product.prices.some((p) => p.storeId === storeId)) changes[l.product.id] = storeId;
    }
    app.setItemsStore(changes);
  };

  const share = () => {
    const text = basket.groups
      .map(
        (g) =>
          `🛒 ${g.store.name}\n` +
          g.lines.map((l) => `• ${l.qty} × ${l.product.name} (${l.product.unit}) — ${formatPrice(l.subtotal)}`).join('\n'),
      )
      .join('\n\n');
    Share.share({ message: `Mi canasta\n\n${text}\n\nTotal: ${formatPrice(basket.total)}` }).catch(() => {});
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: c.background, borderBottomColor: c.border }]}>
        <View style={styles.headerInner}>
          <RoundButton icon="chevron-back" label="Volver" onPress={goBack} />
          <View style={styles.headerTitle}>
            <Txt variant="title">Mi canasta</Txt>
            <Txt variant="caption" color="textTertiary">
              {empty
                ? 'Sin productos'
                : `${basket.units} ${basket.units === 1 ? 'unidad' : 'unidades'} · ${basket.groups.length} ${basket.groups.length === 1 ? 'comercio' : 'comercios'}`}
            </Txt>
          </View>
          {empty ? (
            <View style={styles.roundPlaceholder} />
          ) : (
            <RoundButton
              icon="trash-outline"
              label="Vaciar canasta"
              onPress={() => confirm('Vaciar canasta', 'Se quitarán todos los productos.', app.clearList)}
            />
          )}
        </View>
      </View>

      {empty ? (
        <EmptyBasket />
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}>
            <View style={styles.centered}>
              {/* Savings opportunity */}
              {basket.potentialSaving > 0.005 ? (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(150)}
                  layout={rowLayout}
                  style={[styles.optimize, { backgroundColor: c.primary, boxShadow: `0 16px 28px -18px ${c.primary}` }]}>
                  <View style={styles.optimizeIcon}>
                    <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.flex}>
                    <Txt variant="bodyStrong" style={styles.white}>
                      Puedes ahorrar {formatPrice(basket.potentialSaving)}
                    </Txt>
                    <Txt variant="caption" style={styles.whiteSoft}>
                      Comprando cada producto donde está más barato
                    </Txt>
                  </View>
                  <PressableScale onPress={optimize} style={styles.optimizeBtn}>
                    <Txt variant="captionStrong" style={{ color: c.primaryStrong }}>
                      Optimizar
                    </Txt>
                  </PressableScale>
                </Animated.View>
              ) : (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  layout={rowLayout}
                  style={[styles.optimized, { backgroundColor: c.primarySoft }]}>
                  <Ionicons name="checkmark-circle" size={18} color={c.primary} />
                  <Txt variant="caption" color="primaryStrong" style={styles.flex}>
                    ¡Tu canasta ya tiene el mejor precio en cada producto!
                  </Txt>
                </Animated.View>
              )}

              {/* Items grouped by store */}
              {basket.groups.map((group) => (
                <Animated.View key={group.store.id} layout={rowLayout} entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
                  <GroupCard group={group} />
                </Animated.View>
              ))}

              {/* One-store comparison */}
              {basket.quotes.length > 1 && (
                <Animated.View layout={rowLayout} style={styles.section}>
                  <View>
                    <Txt variant="title">Comprar todo en un lugar</Txt>
                    <Txt variant="caption" color="textTertiary">
                      Toca un comercio para mover ahí los productos que tiene
                    </Txt>
                  </View>
                  <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                    {basket.quotes.map((q, i) => {
                      const complete = q.missing === 0;
                      const best = i === 0 && complete;
                      return (
                        <Pressable
                          key={q.store.id}
                          onPress={() => moveAllTo(q.store.id)}
                          style={({ pressed }) => [
                            styles.quote,
                            i > 0 && { borderTopWidth: 1, borderTopColor: c.border },
                            pressed && styles.pressed,
                          ]}>
                          <StoreLogo id={q.store.id} size={32} />
                          <View style={styles.flex}>
                            <View style={styles.inline}>
                              <Txt variant="bodyStrong">{q.store.name}</Txt>
                              {best && (
                                <View style={[styles.pill, { backgroundColor: c.primarySoft }]}>
                                  <Txt variant="captionStrong" color="primary" style={styles.pillText}>
                                    Mejor opción
                                  </Txt>
                                </View>
                              )}
                            </View>
                            <Txt variant="caption" color={complete ? 'textTertiary' : 'warning'}>
                              {complete
                                ? 'Tiene todos tus productos · envío incluido'
                                : `Le faltan ${q.missing} de ${basket.lines.length} productos`}
                            </Txt>
                          </View>
                          <Txt variant="bodyStrong" color={complete ? 'text' : 'textTertiary'}>
                            {formatPrice(q.total)}
                          </Txt>
                        </Pressable>
                      );
                    })}
                  </View>
                </Animated.View>
              )}

              {/* Summary */}
              <Animated.View layout={rowLayout} style={[styles.card, styles.summary, { backgroundColor: c.surface, borderColor: c.border }]}>
                <SummaryRow label={`Productos (${basket.units})`} value={formatPrice(basket.subtotal)} />
                <SummaryRow
                  label={`Envío (${basket.groups.length} ${basket.groups.length === 1 ? 'comercio' : 'comercios'})`}
                  value={basket.delivery === 0 ? 'Gratis' : formatPrice(basket.delivery)}
                  valueColor={basket.delivery === 0 ? 'primary' : undefined}
                />
                <View style={[styles.summaryDivider, { backgroundColor: c.border }]} />
                <SummaryRow label="Total estimado" value={formatPrice(basket.total)} strong />
              </Animated.View>
            </View>
          </ScrollView>

          {/* Bottom bar */}
          <View
            style={[
              styles.bottomBar,
              {
                backgroundColor: c.surface,
                borderTopColor: c.border,
                paddingBottom: insets.bottom + 12,
                boxShadow: `0 -12px 24px -16px ${c.shadow}40`,
              },
            ]}>
            <View style={styles.bottomInner}>
              <View>
                <Txt variant="caption" color="textTertiary">
                  Total estimado
                </Txt>
                <Txt variant="title">{formatPrice(basket.total)}</Txt>
              </View>
              <PressableScale
                onPress={share}
                style={[styles.cta, { backgroundColor: c.primary, boxShadow: `0 12px 20px -12px ${c.primary}` }]}>
                <Ionicons name="share-outline" size={18} color={c.onPrimary} />
                <Txt variant="bodyStrong" style={{ color: c.onPrimary }}>
                  Compartir lista
                </Txt>
              </PressableScale>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

function GroupCard({ group }: { group: StoreGroup }) {
  const c = useTheme();
  const { store } = group;
  const progress =
    store.freeDeliveryFrom && group.toFreeDelivery !== null
      ? Math.min(1, group.subtotal / store.freeDeliveryFrom)
      : 1;

  return (
    <View style={[styles.card, styles.group, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.groupHeader}>
        <StoreLogo id={store.id} size={36} />
        <View style={styles.flex}>
          <Txt variant="bodyStrong">{store.name}</Txt>
          <Txt variant="caption" color="textTertiary">
            {store.distanceKm.toFixed(1)} km · envío {store.deliveryMin} min
          </Txt>
        </View>
        <Txt variant="bodyStrong">{formatPrice(group.subtotal)}</Txt>
      </View>

      {group.toFreeDelivery !== null && group.toFreeDelivery > 0 && (
        <View style={[styles.freeDelivery, { backgroundColor: c.surfaceMuted }]}>
          <Txt variant="caption" color="textSecondary">
            Te faltan <Txt variant="captionStrong">{formatPrice(group.toFreeDelivery)}</Txt> para envío gratis
          </Txt>
          <View style={[styles.track, { backgroundColor: c.border }]}>
            <View style={[styles.trackFill, { width: `${progress * 100}%`, backgroundColor: c.primary }]} />
          </View>
        </View>
      )}

      {group.lines.map((line) => (
        <Animated.View key={line.product.id} layout={rowLayout} entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)}>
          <LineRow line={line} />
        </Animated.View>
      ))}

      <View style={[styles.groupFooter, { borderTopColor: c.border }]}>
        <Txt variant="caption" color="textTertiary">
          Envío
        </Txt>
        <Txt variant="captionStrong" color={group.delivery === 0 ? 'primary' : 'textSecondary'}>
          {group.delivery === 0 ? 'Gratis' : formatPrice(group.delivery)}
        </Txt>
      </View>
    </View>
  );
}

function LineRow({ line }: { line: BasketLine }) {
  const c = useTheme();
  const dark = useColorScheme() === 'dark';
  const app = useAppState();
  const [picking, setPicking] = useState(false);
  const { product, qty, offer, cheapest } = line;
  const tint = dark ? c.surfaceMuted : CATEGORY_BY_ID[product.category].tint;
  const offers = [...product.prices].sort((a, b) => a.price - b.price);

  return (
    <View style={[styles.line, { borderTopColor: c.border }]}>
      <View style={styles.lineMain}>
        <PressableScale onPress={() => openProduct(product.id)} style={[styles.lineMedia, { backgroundColor: tint }]}>
          <Text style={styles.lineEmoji}>{product.emoji}</Text>
        </PressableScale>

        <View style={styles.flex}>
          <Txt variant="body" numberOfLines={1}>
            {product.name}
          </Txt>
          <Txt variant="caption" color="textTertiary">
            {product.unit} · {formatPrice(offer.price)} c/u
          </Txt>
          <Pressable hitSlop={6} onPress={() => setPicking((p) => !p)} style={styles.changeStore}>
            <Txt variant="captionStrong" color="primary">
              Cambiar comercio
            </Txt>
            <Ionicons name={picking ? 'chevron-up' : 'chevron-down'} size={12} color={c.primary} />
          </Pressable>
        </View>

        <View style={styles.lineRight}>
          <Txt variant="bodyStrong">{formatPrice(line.subtotal)}</Txt>
          <View style={[styles.stepper, { backgroundColor: c.surfaceMuted }]}>
            <Pressable
              hitSlop={6}
              accessibilityLabel={qty === 1 ? 'Quitar' : 'Restar'}
              onPress={() => app.updateQty(product.id, -1)}
              style={[styles.stepBtn, { backgroundColor: c.surface }]}>
              <Ionicons name={qty === 1 ? 'trash-outline' : 'remove'} size={14} color={qty === 1 ? c.deal : c.text} />
            </Pressable>
            <Txt variant="captionStrong" style={styles.qty}>
              {qty}
            </Txt>
            <Pressable
              hitSlop={6}
              accessibilityLabel="Sumar"
              onPress={() => app.updateQty(product.id, 1)}
              style={[styles.stepBtn, { backgroundColor: c.primary }]}>
              <Ionicons name="add" size={14} color={c.onPrimary} />
            </Pressable>
          </View>
        </View>
      </View>

      {line.potentialSaving > 0.005 && !picking && (
        <Pressable
          onPress={() => app.setListItem(product.id, { qty, storeId: cheapest.storeId })}
          style={({ pressed }) => [styles.hint, { backgroundColor: c.primarySoft }, pressed && styles.pressed]}>
          <Ionicons name="trending-down" size={14} color={c.primary} />
          <Txt variant="caption" color="primaryStrong" style={styles.flex}>
            En {storeName(cheapest.storeId)} ahorras{' '}
            <Txt variant="captionStrong" color="primaryStrong">
              {formatPrice(line.potentialSaving)}
            </Txt>
          </Txt>
          <Txt variant="captionStrong" color="primary">
            Cambiar
          </Txt>
        </Pressable>
      )}

      {picking && (
        <Animated.View entering={FadeIn.duration(160)} style={styles.picker}>
          {offers.map((o) => {
            const active = o.storeId === offer.storeId;
            return (
              <PressableScale
                key={o.storeId}
                onPress={() => {
                  app.setListItem(product.id, { qty, storeId: o.storeId });
                  setPicking(false);
                }}
                style={[
                  styles.pickChip,
                  {
                    backgroundColor: active ? c.primarySoft : c.surface,
                    borderColor: active ? c.primary : c.border,
                  },
                ]}>
                <StoreLogo id={o.storeId} size={20} />
                <Txt variant="captionStrong">{formatPrice(o.price)}</Txt>
              </PressableScale>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}

function EmptyBasket() {
  const c = useTheme();
  const app = useAppState();
  const suggestions = PRODUCTS.filter((p) => p.popular)
    .slice(0, 4)
    .map((p) => summarize(p)!);

  return (
    <ScrollView contentContainerStyle={styles.emptyScroll}>
      <Animated.View entering={FadeIn.duration(240)} style={styles.empty}>
        <View style={[styles.emptyCircle, { backgroundColor: c.primarySoft }]}>
          <Text style={styles.emptyEmoji}>🧺</Text>
        </View>
        <Txt variant="title" style={styles.center}>
          Tu canasta está vacía
        </Txt>
        <Txt variant="body" color="textSecondary" style={styles.center}>
          Agrega productos y te diremos dónde comprarlos más barato.
        </Txt>
        <PressableScale
          onPress={() => router.replace('/' as Href)}
          style={[styles.cta, styles.emptyCta, { backgroundColor: c.primary }]}>
          <Txt variant="bodyStrong" style={{ color: c.onPrimary }}>
            Buscar productos
          </Txt>
        </PressableScale>
      </Animated.View>

      <View style={styles.suggestions}>
        <Txt variant="captionStrong" color="textTertiary" style={styles.label}>
          LO MÁS AGREGADO
        </Txt>
        {suggestions.map((s) => (
          <View key={s.product.id} style={[styles.suggestion, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={styles.suggestionEmoji}>{s.product.emoji}</Text>
            <View style={styles.flex}>
              <Txt variant="body">{s.product.name}</Txt>
              <Txt variant="caption" color="textTertiary">
                desde {formatPrice(s.best.price)} en {storeName(s.best.storeId)}
              </Txt>
            </View>
            <PressableScale
              activeScale={0.88}
              accessibilityLabel={`Agregar ${s.product.name}`}
              onPress={() => app.setListItem(s.product.id, { qty: 1, storeId: s.best.storeId })}
              style={[styles.addBtn, { backgroundColor: c.primary }]}>
              <Ionicons name="add" size={18} color={c.onPrimary} />
            </PressableScale>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function SummaryRow({
  label,
  value,
  strong,
  valueColor,
}: {
  label: string;
  value: string;
  strong?: boolean;
  valueColor?: 'primary';
}) {
  return (
    <View style={styles.summaryRow}>
      <Txt variant={strong ? 'bodyStrong' : 'body'} color={strong ? 'text' : 'textSecondary'}>
        {label}
      </Txt>
      <Txt variant={strong ? 'title' : 'bodyStrong'} color={valueColor ?? 'text'}>
        {value}
      </Txt>
    </View>
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
  whiteSoft: { color: 'rgba(255,255,255,0.8)' },
  pressed: { opacity: 0.6 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  header: {
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
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
  roundPlaceholder: { width: 44 },
  scroll: { paddingTop: 16 },
  centered: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  optimize: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: Radius.lg,
  },
  optimizeIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optimizeBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optimized: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: Radius.md,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  group: { paddingTop: 16 },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
  },
  freeDelivery: {
    padding: 10,
    borderRadius: Radius.sm,
    gap: 6,
    marginBottom: 8,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
  },
  line: {
    borderTopWidth: 1,
    paddingVertical: 12,
    gap: 10,
  },
  lineMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lineMedia: {
    width: 56,
    height: 56,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineEmoji: { fontSize: 30 },
  changeStore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  lineRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 10,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    minWidth: 26,
    textAlign: 'center',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingLeft: 6,
    paddingRight: 10,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  section: { gap: 12, marginTop: 8 },
  quote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  pillText: { fontSize: 10, lineHeight: 12 },
  summary: { paddingVertical: 8 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryDivider: { height: 1, marginVertical: 4 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingTop: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  cta: {
    flex: 1,
    height: 52,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyScroll: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 32,
    gap: 8,
  },
  emptyCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyEmoji: { fontSize: 56 },
  emptyCta: {
    flex: 0,
    marginTop: 16,
    paddingHorizontal: 32,
  },
  suggestions: { gap: 8 },
  label: {
    letterSpacing: 0.8,
    fontSize: 11,
    marginBottom: 4,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  suggestionEmoji: { fontSize: 30 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
