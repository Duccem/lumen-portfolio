import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale, Txt } from '@/components/home/primitives';
import { StoreLogo } from '@/components/home/store-badges';
import { PriceHistory } from '@/components/product/price-history';
import { MaxContentWidth, Radius } from '@/constants/theme';
import {
  CATEGORY_BY_ID,
  PRODUCTS,
  STORES,
  getProduct,
  type CategoryId,
  type StoreId,
} from '@/data/catalog';
import { formatPrice, summarize } from '@/data/pricing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-state';

const DESCRIPTIONS: Record<Exclude<CategoryId, 'all'>, string> = {
  fruits: 'Fruta fresca seleccionada. Conservar en lugar fresco y seco; refrigerar una vez madura.',
  vegetables: 'Verdura fresca de estación. Lavar antes de consumir y conservar refrigerada.',
  dairy: 'Producto lácteo refrigerado. Mantener entre 2 °C y 6 °C y consumir antes del vencimiento.',
  meat: 'Producto fresco refrigerado. Mantener la cadena de frío y cocinar completamente.',
  pantry: 'Producto de almacén. Conservar en lugar fresco, seco y al resguardo de la luz.',
  bakery: 'Panificado del día. Conservar en bolsa cerrada; se puede congelar hasta 30 días.',
  drinks: 'Bebida lista para consumir. Una vez abierta, refrigerar y consumir dentro de 3 días.',
  spices: 'Especia molida. Conservar en envase hermético, lejos del calor y la humedad.',
};

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/' as Href));

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(id);
  if (!product) return <NotFound />;
  // Re-mount per product so local state (store, qty) resets when navigating between products.
  return <ProductDetail key={product.id} productId={product.id} />;
}

function ProductDetail({ productId }: { productId: string }) {
  const c = useTheme();
  const dark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const app = useAppState();

  const product = getProduct(productId)!;
  const summary = summarize(product)!;
  const category = CATEGORY_BY_ID[product.category];
  const inList = app.list[product.id];

  const [storeId, setStoreId] = useState<StoreId>(inList?.storeId ?? summary.best.storeId);
  const [qty, setQty] = useState(inList?.qty ?? 1);

  const average = summary.offers.reduce((sum, o) => sum + o.price, 0) / summary.offers.length;
  const selected = summary.offers.find((o) => o.storeId === storeId) ?? summary.best;
  const savings = summary.highest.price - summary.best.price;
  const unavailable = STORES.filter((s) => !summary.offers.some((o) => o.storeId === s.id));
  const favorite = app.isFavorite(product.id);
  const alertTarget = app.alerts[product.id];
  const alertOptions = [0.95, 0.9, 0.8].map((f) => Math.floor(summary.best.price * f * 20) / 20);

  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id)
    .map((p) => summarize(p)!)
    .slice(0, 6);

  const tint = dark ? c.surfaceMuted : category.tint;

  const share = () =>
    Share.share({
      message: `${product.name} (${product.unit}) desde ${formatPrice(summary.best.price)} en ${
        STORES.find((s) => s.id === summary.best.storeId)?.name
      } — visto en Preci`,
    }).catch(() => {});

  const basketCount = Object.keys(app.list).length;
  const [toast, setToast] = useState<null | 'added' | 'updated'>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const addToList = () => {
    app.setListItem(product.id, { qty, storeId: selected.storeId });
    setToast(inList ? 'updated' : 'added');
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: tint, paddingTop: insets.top + 56 }]}>
          <Animated.Text entering={ZoomIn.duration(260)} style={styles.heroEmoji}>
            {product.emoji}
          </Animated.Text>
          {summary.dropPct > 0 && (
            <View style={[styles.heroBadge, { backgroundColor: c.deal }]}>
              <Ionicons name="trending-down" size={14} color="#FFFFFF" />
              <Txt variant="captionStrong" style={styles.white}>
                Bajó {Math.round(summary.dropPct)}% esta semana
              </Txt>
            </View>
          )}
        </View>

        <View style={[styles.sheet, { backgroundColor: c.background }]}>
          <View style={styles.centered}>
            {/* Title */}
            <View style={styles.titleBlock}>
              <View style={styles.tagsRow}>
                <View style={[styles.tag, { backgroundColor: c.primarySoft }]}>
                  <Text style={styles.tagEmoji}>{category.emoji}</Text>
                  <Txt variant="captionStrong" color="primaryStrong">
                    {category.label}
                  </Txt>
                </View>
                {product.popular && (
                  <View style={[styles.tag, { backgroundColor: c.surfaceMuted }]}>
                    <Txt variant="captionStrong" color="textSecondary">
                      🔥 Popular
                    </Txt>
                  </View>
                )}
              </View>
              <Txt variant="display">{product.name}</Txt>
              <Txt variant="body" color="textSecondary">
                {product.brand ? `${product.brand} · ` : ''}
                {product.unit} · en {summary.offers.length} comercios
              </Txt>
            </View>

            {/* Price stats */}
            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={styles.statsRow}>
                <Stat label="Promedio" value={formatPrice(average)} emphasis />
                <View style={[styles.divider, { backgroundColor: c.border }]} />
                <Stat label="Mínimo" value={formatPrice(summary.best.price)} color="primary" />
                <View style={[styles.divider, { backgroundColor: c.border }]} />
                <Stat label="Máximo" value={formatPrice(summary.highest.price)} color="deal" />
              </View>
              {savings > 0.005 && (
                <View style={[styles.savings, { backgroundColor: c.primarySoft }]}>
                  <Ionicons name="sparkles" size={16} color={c.primary} />
                  <Txt variant="caption" color="primaryStrong" style={styles.flex}>
                    Ahorras <Txt variant="captionStrong" color="primaryStrong">{formatPrice(savings)}</Txt> (
                    {Math.round(summary.savingsPct)}%) comprando en{' '}
                    <Txt variant="captionStrong" color="primaryStrong">
                      {STORES.find((s) => s.id === summary.best.storeId)?.name}
                    </Txt>
                  </Txt>
                </View>
              )}
            </View>

            {/* Prices by store */}
            <Section title="Precios por comercio" hint="Elige dónde comprarlo">
              <View style={styles.offerList}>
                {summary.offers.map((offer, index) => {
                  const store = STORES.find((s) => s.id === offer.storeId)!;
                  const active = offer.storeId === selected.storeId;
                  const vsAvg = ((offer.price - average) / average) * 100;
                  const weekly = offer.previousPrice ? offer.price - offer.previousPrice : 0;
                  return (
                    <PressableScale
                      key={offer.storeId}
                      activeScale={0.98}
                      onPress={() => setStoreId(offer.storeId)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      style={[
                        styles.offer,
                        {
                          backgroundColor: active ? c.primarySoft : c.surface,
                          borderColor: active ? c.primary : c.border,
                        },
                      ]}>
                      <StoreLogo id={store.id} size={40} />
                      <View style={styles.flex}>
                        <View style={styles.offerTitle}>
                          <Txt variant="bodyStrong" numberOfLines={1} style={styles.shrink}>
                            {store.name}
                          </Txt>
                          {index === 0 && (
                            <View style={[styles.bestPill, { backgroundColor: c.primary }]}>
                              <Txt variant="captionStrong" style={[styles.pillText, { color: c.onPrimary }]}>
                                Mejor precio
                              </Txt>
                            </View>
                          )}
                        </View>
                        <Txt variant="caption" color="textTertiary">
                          {store.distanceKm.toFixed(1)} km · envío {store.deliveryMin} min
                        </Txt>
                      </View>
                      <View style={styles.offerPrice}>
                        <Txt variant="bodyStrong">{formatPrice(offer.price)}</Txt>
                        {weekly !== 0 ? (
                          <Txt variant="caption" color={weekly < 0 ? 'primary' : 'deal'}>
                            {weekly < 0 ? '↓' : '↑'} {formatPrice(Math.abs(weekly))} sem.
                          </Txt>
                        ) : (
                          <Txt variant="caption" color={vsAvg <= 0 ? 'primary' : 'textTertiary'}>
                            {vsAvg <= 0 ? '' : '+'}
                            {Math.round(vsAvg)}% vs prom.
                          </Txt>
                        )}
                      </View>
                      <View
                        style={[
                          styles.radio,
                          { borderColor: active ? c.primary : c.border },
                        ]}>
                        {active && <View style={[styles.radioDot, { backgroundColor: c.primary }]} />}
                      </View>
                    </PressableScale>
                  );
                })}

                {unavailable.map((store) => (
                  <View
                    key={store.id}
                    style={[styles.offer, styles.offerDisabled, { borderColor: c.border }]}>
                    <StoreLogo id={store.id} size={40} />
                    <View style={styles.flex}>
                      <Txt variant="bodyStrong">{store.name}</Txt>
                      <Txt variant="caption" color="textTertiary">
                        Sin stock en este comercio
                      </Txt>
                    </View>
                    <Txt variant="caption" color="textTertiary">
                      No disponible
                    </Txt>
                  </View>
                ))}
              </View>
            </Section>

            {/* History */}
            <Section title="Historial de precio">
              <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                <PriceHistory values={product.history} average={average} />
              </View>
            </Section>

            {/* Options */}
            <Section title="Opciones">
              <View style={[styles.card, styles.optionsCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={styles.optionRow}>
                  <OptionIcon name="notifications" color={c.warning} />
                  <View style={styles.flex}>
                    <Txt variant="bodyStrong">Alerta de precio</Txt>
                    <Txt variant="caption" color="textTertiary">
                      {alertTarget
                        ? `Te avisamos si baja de ${formatPrice(alertTarget)}`
                        : 'Recibe un aviso cuando baje'}
                    </Txt>
                  </View>
                  <Switch
                    value={alertTarget !== undefined}
                    onValueChange={(on) => app.setAlert(product.id, on ? alertOptions[1] : null)}
                    trackColor={{ true: c.primary, false: c.border }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                {alertTarget !== undefined && (
                  <Animated.View entering={FadeIn.duration(180)} style={styles.alertChips}>
                    {alertOptions.map((target) => {
                      const on = alertTarget === target;
                      return (
                        <PressableScale
                          key={target}
                          onPress={() => app.setAlert(product.id, target)}
                          style={[
                            styles.chip,
                            on
                              ? { backgroundColor: c.text, borderColor: c.text }
                              : { backgroundColor: c.surface, borderColor: c.border },
                          ]}>
                          <Txt variant="captionStrong" style={{ color: on ? c.background : c.text }}>
                            {formatPrice(target)}
                          </Txt>
                        </PressableScale>
                      );
                    })}
                  </Animated.View>
                )}

                <View style={[styles.separator, { backgroundColor: c.border }]} />

                <OptionLink
                  icon={favorite ? 'heart' : 'heart-outline'}
                  color={c.deal}
                  label={favorite ? 'En tus favoritos' : 'Agregar a favoritos'}
                  onPress={() => app.toggleFavorite(product.id)}
                />
                <View style={[styles.separator, { backgroundColor: c.border }]} />
                <OptionLink icon="share-outline" color="#3B82F6" label="Compartir precio" onPress={share} />
                <View style={[styles.separator, { backgroundColor: c.border }]} />
                <OptionLink
                  icon="flag-outline"
                  color={c.textSecondary}
                  label="Reportar un precio incorrecto"
                  onPress={() => {}}
                />
              </View>
            </Section>

            {/* Info */}
            <Section title="Información">
              <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Txt variant="body" color="textSecondary" style={styles.description}>
                  {DESCRIPTIONS[product.category]}
                </Txt>
                <InfoRow label="Marca" value={product.brand ?? 'Genérico'} />
                <InfoRow label="Presentación" value={product.unit} />
                <InfoRow label="Categoría" value={category.label} />
                <InfoRow label="Disponible en" value={`${summary.offers.length} de ${STORES.length} comercios`} />
                <InfoRow label="Actualizado" value="Hace 2 horas" last />
              </View>
            </Section>

            {/* Related */}
            {related.length > 0 && (
              <Section title={`Más en ${category.label}`}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.related}
                  style={styles.relatedScroll}>
                  {related.map((r) => (
                    <PressableScale
                      key={r.product.id}
                      onPress={() => router.push({ pathname: '/product/[id]', params: { id: r.product.id } })}
                      style={[styles.relatedCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                      <View style={[styles.relatedMedia, { backgroundColor: tint }]}>
                        <Text style={styles.relatedEmoji}>{r.product.emoji}</Text>
                      </View>
                      <Txt variant="caption" numberOfLines={1}>
                        {r.product.name}
                      </Txt>
                      <Txt variant="bodyStrong">{formatPrice(r.best.price)}</Txt>
                    </PressableScale>
                  ))}
                </ScrollView>
              </Section>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <RoundButton icon="chevron-back" label="Volver" onPress={goBack} />
        <View style={styles.topActions}>
          <RoundButton
            icon="basket-outline"
            label="Ver canasta"
            badge={basketCount}
            onPress={() => router.push('/basket')}
          />
          <RoundButton
            icon={favorite ? 'heart' : 'heart-outline'}
            color={favorite ? c.deal : undefined}
            label="Favorito"
            onPress={() => app.toggleFavorite(product.id)}
          />
        </View>
      </View>

      {/* Confirmation toast */}
      {toast && (
        <Animated.View
          entering={SlideInDown.duration(240).easing(Easing.out(Easing.cubic))}
          exiting={FadeOut.duration(160)}
          style={[styles.toastWrap, { bottom: insets.bottom + 96 }]}
          pointerEvents="box-none">
          <View style={[styles.toast, { backgroundColor: c.text, boxShadow: `0 12px 24px -12px ${c.shadow}99` }]}>
            <View style={[styles.toastIcon, { backgroundColor: c.primary }]}>
              <Ionicons name="checkmark" size={14} color={c.onPrimary} />
            </View>
            <View style={styles.flex}>
              <Txt variant="bodyStrong" style={{ color: c.background }}>
                {toast === 'added' ? 'Agregado a tu canasta' : 'Canasta actualizada'}
              </Txt>
              <Txt variant="caption" style={{ color: c.background, opacity: 0.7 }}>
                {qty} × {product.name}
              </Txt>
            </View>
            <Pressable hitSlop={8} onPress={() => router.push('/basket')}>
              <Txt variant="captionStrong" color="primary">
                Ver canasta
              </Txt>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Bottom action bar — in the thumb zone */}
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
        <View style={[styles.bottomInner]}>
          <View style={[styles.stepper, { backgroundColor: c.surfaceMuted }]}>
            <Pressable
              hitSlop={6}
              accessibilityLabel="Restar"
              onPress={() => setQty((q) => Math.max(1, q - 1))}
              style={[styles.stepBtn, { backgroundColor: c.surface }]}>
              <Ionicons name="remove" size={18} color={qty === 1 ? c.textTertiary : c.text} />
            </Pressable>
            <Txt variant="bodyStrong" style={styles.qty}>
              {qty}
            </Txt>
            <Pressable
              hitSlop={6}
              accessibilityLabel="Sumar"
              onPress={() => setQty((q) => Math.min(99, q + 1))}
              style={[styles.stepBtn, { backgroundColor: c.primary }]}>
              <Ionicons name="add" size={18} color={c.onPrimary} />
            </Pressable>
          </View>

          <PressableScale
            onPress={addToList}
            style={[styles.cta, { backgroundColor: c.primary, boxShadow: `0 12px 20px -12px ${c.primary}` }]}>
            <Ionicons name={inList ? 'checkmark-circle' : 'basket'} size={18} color={c.onPrimary} />
            <View>
              <Txt variant="bodyStrong" style={{ color: c.onPrimary }}>
                {inList ? 'Actualizar canasta' : 'Agregar a la canasta'}
              </Txt>
              <Txt variant="caption" style={{ color: c.onPrimary, opacity: 0.85 }}>
                {formatPrice(selected.price * qty)} · {STORES.find((s) => s.id === selected.storeId)?.name}
              </Txt>
            </View>
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

function Stat({
  label,
  value,
  color = 'text',
  emphasis,
}: {
  label: string;
  value: string;
  color?: 'text' | 'primary' | 'deal';
  emphasis?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <Txt variant="caption" color="textTertiary">
        {label}
      </Txt>
      <Txt variant={emphasis ? 'title' : 'bodyStrong'} color={color}>
        {value}
      </Txt>
    </View>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Txt variant="title">{title}</Txt>
        {hint ? (
          <Txt variant="caption" color="textTertiary">
            {hint}
          </Txt>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function OptionIcon({ name, color }: { name: keyof typeof Ionicons.glyphMap; color: string }) {
  return (
    <View style={[styles.optionIcon, { backgroundColor: `${color}1F` }]}>
      <Ionicons name={name} size={16} color={color} />
    </View>
  );
}

function OptionLink({
  icon,
  color,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  onPress: () => void;
}) {
  const c = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}>
      <OptionIcon name={icon} color={color} />
      <Txt variant="bodyStrong" style={styles.flex}>
        {label}
      </Txt>
      <Ionicons name="chevron-forward" size={16} color={c.textTertiary} />
    </Pressable>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const c = useTheme();
  return (
    <View style={[styles.infoRow, !last && { borderBottomColor: c.border, borderBottomWidth: 1 }]}>
      <Txt variant="body" color="textSecondary">
        {label}
      </Txt>
      <Txt variant="bodyStrong">{value}</Txt>
    </View>
  );
}

function RoundButton({
  icon,
  label,
  onPress,
  color,
  badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  badge?: number;
}) {
  const c = useTheme();
  return (
    <PressableScale
      activeScale={0.9}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.round, { backgroundColor: c.surface, boxShadow: `0 6px 16px -8px ${c.shadow}66` }]}>
      <Ionicons name={icon} size={20} color={color ?? c.text} />
      {!!badge && (
        <Animated.View
          key={badge}
          entering={FadeIn.duration(180)}
          style={[styles.badge, { backgroundColor: c.primary, borderColor: c.surface }]}>
          <Txt variant="captionStrong" style={[styles.badgeText, { color: c.onPrimary }]}>
            {badge}
          </Txt>
        </Animated.View>
      )}
    </PressableScale>
  );
}

function NotFound() {
  const c = useTheme();
  return (
    <View style={[styles.screen, styles.notFound, { backgroundColor: c.background }]}>
      <Text style={styles.heroEmoji}>🤷</Text>
      <Txt variant="title">Producto no encontrado</Txt>
      <PressableScale onPress={goBack} style={[styles.cta, styles.notFoundBtn, { backgroundColor: c.primary }]}>
        <Txt variant="bodyStrong" style={{ color: c.onPrimary }}>
          Volver
        </Txt>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  white: { color: '#FFFFFF' },
  pressed: { opacity: 0.6 },
  centered: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 32,
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 56,
  },
  heroEmoji: {
    fontSize: 140,
    lineHeight: 168,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    marginTop: 8,
  },
  sheet: {
    marginTop: -28,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
  },
  titleBlock: { gap: 8 },
  tagsRow: { flexDirection: 'row', gap: 8 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: Radius.pill,
  },
  tagEmoji: { fontSize: 12 },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  divider: {
    width: 1,
    height: 32,
  },
  savings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: Radius.sm,
  },
  section: { gap: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  offerList: { gap: 8 },
  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  offerDisabled: {
    opacity: 0.5,
    borderStyle: 'dashed',
  },
  offerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bestPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  pillText: { fontSize: 10, lineHeight: 12 },
  offerPrice: { alignItems: 'flex-end' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionsCard: {
    gap: 0,
    paddingVertical: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertChips: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 44,
    paddingBottom: 12,
  },
  chip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    marginLeft: 44,
  },
  description: { lineHeight: 22 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 16,
  },
  relatedScroll: { marginHorizontal: -16 },
  related: { paddingHorizontal: 16, gap: 12 },
  relatedCard: {
    width: 128,
    padding: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 4,
  },
  relatedMedia: {
    height: 88,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  relatedEmoji: { fontSize: 44 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topActions: { flexDirection: 'row', gap: 8 },
  badge: {
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
  badgeText: { fontSize: 10, lineHeight: 12 },
  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  toast: {
    width: '100%',
    maxWidth: MaxContentWidth - 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.md,
  },
  toastIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    gap: 12,
    paddingHorizontal: 16,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: Radius.md,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    minWidth: 32,
    textAlign: 'center',
  },
  cta: {
    flex: 1,
    height: 52,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  notFound: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundBtn: {
    flex: 0,
    paddingHorizontal: 32,
  },
});
