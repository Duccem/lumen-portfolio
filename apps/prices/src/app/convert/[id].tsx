import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale, Txt } from '@/components/home/primitives';
import { StoreLogo } from '@/components/home/store-badges';
import { MaxContentWidth, Radius } from '@/constants/theme';
import { type StoreId } from '@/data/catalog';
import { convertList, type Strategy } from '@/data/lists';
import { formatPrice } from '@/data/pricing';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-state';

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/lists' as Href));
const rowLayout = LinearTransition.duration(200);

const STRATEGIES: { id: Strategy; title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'best', title: 'Mejor precio', subtitle: 'Cada producto donde esté más barato', icon: 'pricetags-outline' },
  { id: 'single', title: 'Un solo comercio', subtitle: 'Todo junto, un solo envío', icon: 'storefront-outline' },
];

export default function ConvertScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const app = useAppState();
  const list = app.shoppingLists.find((l) => l.id === id);

  // null = auto: whichever strategy is cheaper once delivery is included.
  const [picked, setPicked] = useState<Strategy | null>(null);
  const [store, setStore] = useState<StoreId | undefined>(undefined);
  const [skipChecked, setSkipChecked] = useState(true);
  const [replace, setReplace] = useState(false);

  if (!list) {
    return (
      <View style={[styles.screen, styles.missing, { backgroundColor: c.background }]}>
        <Txt variant="title">Lista no encontrada</Txt>
        <PressableScale onPress={goBack} style={[styles.cta, styles.missingBtn, { backgroundColor: c.primary }]}>
          <Txt variant="bodyStrong" style={{ color: c.onPrimary }}>
            Volver
          </Txt>
        </PressableScale>
      </View>
    );
  }

  const source = skipChecked ? { ...list, entries: list.entries.filter((e) => !e.checked) } : list;
  const both = {
    best: convertList(source, 'best'),
    single: convertList(source, 'single', store),
  };
  const strategy: Strategy =
    picked ?? (both.single.basket.total < both.best.basket.total - 0.005 ? 'single' : 'best');
  const result = both[strategy];
  const { basket } = result;
  const basketCount = Object.keys(app.list).length;
  const checkedCount = list.entries.filter((e) => e.checked).length;

  const apply = () => {
    app.mergeIntoBasket(result.items, replace);
    router.replace('/basket');
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: c.border }]}>
        <View style={styles.headerInner}>
          <PressableScale
            activeScale={0.9}
            accessibilityLabel="Volver"
            onPress={goBack}
            style={[styles.round, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Ionicons name="chevron-back" size={20} color={c.text} />
          </PressableScale>
          <View style={styles.headerTitle}>
            <Txt variant="title">Convertir en canasta</Txt>
            <Txt variant="caption" color="textTertiary" numberOfLines={1}>
              {list.emoji} {list.name}
            </Txt>
          </View>
          <View style={styles.roundPlaceholder} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={styles.centered}>
          {/* Result hero */}
          <View style={[styles.hero, { backgroundColor: c.primary, boxShadow: `0 16px 28px -18px ${c.primary}` }]}>
            <View style={styles.heroRing} />
            <Txt variant="caption" style={styles.whiteSoft}>
              Total estimado con envío
            </Txt>
            <Animated.View key={`${strategy}-${basket.total.toFixed(2)}`} entering={FadeIn.duration(180)}>
              <Txt variant="display" style={styles.white}>
                {formatPrice(basket.total)}
              </Txt>
            </Animated.View>
            <View style={styles.heroStats}>
              <HeroStat icon="cube-outline" text={`${result.merged.length} productos`} />
              <HeroStat
                icon="storefront-outline"
                text={`${basket.groups.length} ${basket.groups.length === 1 ? 'comercio' : 'comercios'}`}
              />
              {result.savingsVsWorst > 0.005 && (
                <HeroStat icon="trending-down" text={`Ahorras ${formatPrice(result.savingsVsWorst)}`} />
              )}
            </View>
          </View>

          {/* Strategy */}
          <View style={styles.section}>
            <Txt variant="title">¿Cómo quieres comprar?</Txt>
            <View style={styles.strategies}>
              {STRATEGIES.map((s) => {
                const active = s.id === strategy;
                const total = both[s.id].basket.total;
                const cheaper = total <= Math.min(both.best.basket.total, both.single.basket.total) + 0.001;
                return (
                  <PressableScale
                    key={s.id}
                    activeScale={0.98}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    onPress={() => setPicked(s.id)}
                    style={[
                      styles.strategy,
                      {
                        backgroundColor: active ? c.primarySoft : c.surface,
                        borderColor: active ? c.primary : c.border,
                      },
                    ]}>
                    <View style={styles.strategyTop}>
                      <Ionicons name={s.icon} size={18} color={active ? c.primary : c.textSecondary} />
                      {cheaper && (
                        <View style={[styles.pill, { backgroundColor: c.primary }]}>
                          <Txt variant="captionStrong" style={[styles.pillText, { color: c.onPrimary }]}>
                            Más barato
                          </Txt>
                        </View>
                      )}
                    </View>
                    <Txt variant="bodyStrong">{s.title}</Txt>
                    <Txt variant="caption" color="textTertiary">
                      {s.subtitle}
                    </Txt>
                    <Txt variant="bodyStrong" color={active ? 'primary' : 'text'} style={styles.strategyTotal}>
                      {formatPrice(total)}
                    </Txt>
                  </PressableScale>
                );
              })}
            </View>

            {strategy === 'single' && (
              <Animated.View entering={FadeIn.duration(160)} style={styles.storePicker}>
                <Txt variant="caption" color="textTertiary">
                  Comercio
                </Txt>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storeChips}>
                  {result.storeRanking.map((r) => {
                    const active = r.store.id === result.singleStore;
                    const missing = result.merged.length - r.available;
                    return (
                      <PressableScale
                        key={r.store.id}
                        onPress={() => setStore(r.store.id)}
                        style={[
                          styles.storeChip,
                          {
                            backgroundColor: active ? c.primarySoft : c.surface,
                            borderColor: active ? c.primary : c.border,
                          },
                        ]}>
                        <StoreLogo id={r.store.id} size={24} />
                        <View>
                          <Txt variant="captionStrong">{r.store.name}</Txt>
                          <Txt variant="caption" color={missing ? 'warning' : 'textTertiary'}>
                            {missing ? `Faltan ${missing}` : 'Tiene todo'}
                          </Txt>
                        </View>
                      </PressableScale>
                    );
                  })}
                </ScrollView>
              </Animated.View>
            )}
          </View>

          {/* Breakdown */}
          <View style={styles.section}>
            <Txt variant="title">Así queda tu canasta</Txt>
            {basket.groups.map((group) => (
              <Animated.View
                key={group.store.id}
                layout={rowLayout}
                entering={FadeIn.duration(180)}
                style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={styles.groupHead}>
                  <StoreLogo id={group.store.id} size={32} />
                  <View style={styles.flex}>
                    <Txt variant="bodyStrong">{group.store.name}</Txt>
                    <Txt variant="caption" color="textTertiary">
                      Envío {group.delivery === 0 ? 'gratis' : formatPrice(group.delivery)}
                    </Txt>
                  </View>
                  <Txt variant="bodyStrong">{formatPrice(group.subtotal)}</Txt>
                </View>
                {group.lines.map((line) => {
                  const fromList = result.merged.find((m) => m.product.id === line.product.id);
                  const originalText = fromList?.entries.map((e) => e.text).join(' + ');
                  return (
                    <View key={line.product.id} style={[styles.line, { borderTopColor: c.border }]}>
                      <Text style={styles.lineEmoji}>{line.product.emoji}</Text>
                      <View style={styles.flex}>
                        <Txt variant="body" numberOfLines={1}>
                          {line.qty} × {line.product.name}
                        </Txt>
                        {originalText && originalText !== line.product.name && (
                          <Txt variant="caption" color="textTertiary" numberOfLines={1}>
                            “{originalText}”
                          </Txt>
                        )}
                      </View>
                      <Txt variant="captionStrong">{formatPrice(line.subtotal)}</Txt>
                    </View>
                  );
                })}
              </Animated.View>
            ))}

            {result.unmatched.length > 0 && (
              <View style={[styles.unmatched, { backgroundColor: c.surfaceMuted }]}>
                <Ionicons name="help-circle-outline" size={18} color={c.warning} />
                <View style={styles.flex}>
                  <Txt variant="captionStrong">No encontramos precio para:</Txt>
                  <Txt variant="caption" color="textSecondary">
                    {result.unmatched.map((e) => e.text).join(', ')}. Seguirán en tu lista.
                  </Txt>
                </View>
              </View>
            )}
          </View>

          {/* Options */}
          {(checkedCount > 0 || basketCount > 0) && (
          <View style={[styles.card, styles.options, { backgroundColor: c.surface, borderColor: c.border }]}>
            {checkedCount > 0 && (
              <OptionToggle
                title="Omitir productos marcados"
                subtitle={`${checkedCount} ya ${checkedCount === 1 ? 'está' : 'están'} en tu carrito`}
                value={skipChecked}
                onChange={setSkipChecked}
              />
            )}
            {basketCount > 0 && (
              <OptionToggle
                title="Reemplazar la canasta actual"
                subtitle={
                  replace
                    ? `Se quitarán los ${basketCount} productos que ya tienes`
                    : `Se sumará a los ${basketCount} productos que ya tienes`
                }
                value={replace}
                onChange={setReplace}
                border={checkedCount > 0}
              />
            )}
          </View>
          )}
        </View>
      </ScrollView>

      {/* Apply */}
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
          <PressableScale
            onPress={apply}
            disabled={result.merged.length === 0}
            style={[
              styles.cta,
              {
                backgroundColor: result.merged.length ? c.primary : c.surfaceMuted,
                boxShadow: result.merged.length ? `0 12px 20px -12px ${c.primary}` : 'none',
              },
            ]}>
            <Ionicons name="basket" size={18} color={result.merged.length ? c.onPrimary : c.textTertiary} />
            <Txt variant="bodyStrong" style={{ color: result.merged.length ? c.onPrimary : c.textTertiary }}>
              {result.merged.length
                ? `Agregar ${result.merged.length} productos · ${formatPrice(basket.total)}`
                : 'No hay productos para agregar'}
            </Txt>
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

function HeroStat({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.heroStat}>
      <Ionicons name={icon} size={12} color="#FFFFFF" />
      <Txt variant="captionStrong" style={styles.white}>
        {text}
      </Txt>
    </View>
  );
}

function OptionToggle({
  title,
  subtitle,
  value,
  onChange,
  border,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
  border?: boolean;
}) {
  const c = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={[styles.option, border && { borderTopWidth: 1, borderTopColor: c.border }]}>
      <View style={styles.flex}>
        <Txt variant="bodyStrong">{title}</Txt>
        <Txt variant="caption" color="textTertiary">
          {subtitle}
        </Txt>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: c.primary, false: c.border }} thumbColor="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  white: { color: '#FFFFFF' },
  whiteSoft: { color: 'rgba(255,255,255,0.8)' },
  header: { paddingBottom: 12, borderBottomWidth: 1 },
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
  centered: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 24,
  },
  hero: {
    borderRadius: Radius.lg,
    padding: 20,
    gap: 4,
    overflow: 'hidden',
  },
  heroRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 24,
    borderColor: 'rgba(255,255,255,0.08)',
    right: -60,
    top: -70,
  },
  heroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  section: { gap: 12 },
  strategies: { flexDirection: 'row', gap: 12 },
  strategy: {
    flex: 1,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    gap: 4,
  },
  strategyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  strategyTotal: { marginTop: 8 },
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  pillText: { fontSize: 10, lineHeight: 12 },
  storePicker: { gap: 8 },
  storeChips: { gap: 8 },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  lineEmoji: { fontSize: 22 },
  unmatched: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: Radius.md,
  },
  options: { paddingVertical: 4 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
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
    paddingHorizontal: 16,
  },
  cta: {
    height: 52,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  missing: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  missingBtn: { paddingHorizontal: 32 },
});
