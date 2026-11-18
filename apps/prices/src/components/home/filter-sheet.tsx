import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import Animated, { Easing, FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius } from '@/constants/theme';
import { STORES, type StoreId } from '@/data/catalog';
import {
  DEFAULT_FILTERS,
  PRICE_LIMITS,
  SORT_OPTIONS,
  type Filters,
} from '@/data/pricing';
import { useTheme } from '@/hooks/use-theme';

import { PressableScale, Txt } from './primitives';
import { StoreLogo } from './store-badges';

type Props = {
  visible: boolean;
  initial: Filters;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  /** Live count preview for the draft filters. */
  countFor: (filters: Filters) => number;
};

export function FilterSheet({ visible, initial, onClose, onApply, countFor }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      {/* Re-mount on open so the draft resets to the applied filters. */}
      {visible && <SheetBody initial={initial} onClose={onClose} onApply={onApply} countFor={countFor} />}
    </Modal>
  );
}

function SheetBody({ initial, onClose, onApply, countFor }: Omit<Props, 'visible'>) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<Filters>(initial);
  const count = countFor(draft);

  const toggleStore = (id: StoreId) =>
    setDraft((d) => ({
      ...d,
      stores: d.stores.includes(id) ? d.stores.filter((s) => s !== id) : [...d.stores, id],
    }));

  return (
    <View style={styles.root}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.overlay }]} onPress={onClose} />

      <Animated.View
        entering={SlideInDown.duration(280).easing(Easing.out(Easing.cubic))}
        style={[styles.sheet, { backgroundColor: c.background, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.handle, { backgroundColor: c.border }]} />

        <View style={styles.header}>
          <Txt variant="title">Filtros</Txt>
          <Pressable
            hitSlop={12}
            onPress={onClose}
            accessibilityLabel="Cerrar"
            style={[styles.close, { backgroundColor: c.surfaceMuted }]}>
            <Ionicons name="close" size={18} color={c.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Group title="Ordenar por">
            <View style={styles.wrap}>
              {SORT_OPTIONS.map((opt) => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  active={draft.sort === opt.id}
                  onPress={() => setDraft((d) => ({ ...d, sort: opt.id }))}
                />
              ))}
            </View>
          </Group>

          <Group title="Supermercados" hint={draft.stores.length ? `${draft.stores.length} seleccionados` : 'Todos'}>
            <View style={styles.storeList}>
              {STORES.map((store) => {
                const active = draft.stores.includes(store.id);
                return (
                  <PressableScale
                    key={store.id}
                    activeScale={0.98}
                    onPress={() => toggleStore(store.id)}
                    style={[
                      styles.storeRow,
                      {
                        backgroundColor: active ? c.primarySoft : c.surface,
                        borderColor: active ? c.primary : c.border,
                      },
                    ]}>
                    <StoreLogo id={store.id} size={32} />
                    <View style={styles.flex}>
                      <Txt variant="bodyStrong">{store.name}</Txt>
                      <Txt variant="caption" color="textTertiary">
                        {store.distanceKm.toFixed(1)} km · envío {store.deliveryMin} min
                      </Txt>
                    </View>
                    <View
                      style={[
                        styles.check,
                        active
                          ? { backgroundColor: c.primary, borderColor: c.primary }
                          : { borderColor: c.border },
                      ]}>
                      {active && <Ionicons name="checkmark" size={14} color={c.onPrimary} />}
                    </View>
                  </PressableScale>
                );
              })}
            </View>
          </Group>

          <Group title="Precio máximo">
            <View style={styles.wrap}>
              {PRICE_LIMITS.map((opt) => (
                <Chip
                  key={opt.label}
                  label={opt.label}
                  active={draft.maxPrice === opt.value}
                  onPress={() => setDraft((d) => ({ ...d, maxPrice: opt.value }))}
                />
              ))}
            </View>
          </Group>

          <View style={[styles.switchRow, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={[styles.switchIcon, { backgroundColor: c.dealSoft }]}>
              <Ionicons name="pricetag" size={16} color={c.deal} />
            </View>
            <View style={styles.flex}>
              <Txt variant="bodyStrong">Solo productos que bajaron</Txt>
              <Txt variant="caption" color="textTertiary">
                Precios más bajos que la semana pasada
              </Txt>
            </View>
            <Switch
              value={draft.onlyDeals}
              onValueChange={(onlyDeals) => setDraft((d) => ({ ...d, onlyDeals }))}
              trackColor={{ true: c.primary, false: c.border }}
              thumbColor="#FFFFFF"
            />
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <PressableScale
            onPress={() => setDraft(DEFAULT_FILTERS)}
            style={[styles.secondary, { borderColor: c.border, backgroundColor: c.surface }]}>
            <Txt variant="bodyStrong">Limpiar</Txt>
          </PressableScale>
          <PressableScale
            onPress={() => onApply(draft)}
            style={[styles.primary, { backgroundColor: c.primary, boxShadow: `0 12px 20px -12px ${c.primary}` }]}>
            <Txt variant="bodyStrong" style={{ color: c.onPrimary }}>
              {count === 0 ? 'Sin resultados' : `Ver ${count} productos`}
            </Txt>
          </PressableScale>
        </View>
      </Animated.View>
    </View>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Animated.View entering={FadeIn.duration(240)} style={styles.group}>
      <View style={styles.groupHeader}>
        <Txt variant="bodyStrong">{title}</Txt>
        {hint ? (
          <Txt variant="caption" color="textTertiary">
            {hint}
          </Txt>
        ) : null}
      </View>
      {children}
    </Animated.View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const c = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      style={[
        styles.chip,
        active
          ? { backgroundColor: c.text, borderColor: c.text }
          : { backgroundColor: c.surface, borderColor: c.border },
      ]}>
      <Txt variant="captionStrong" style={{ color: active ? c.background : c.text }}>
        {label}
      </Txt>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 24,
  },
  group: {
    gap: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeList: {
    gap: 8,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  flex: { flex: 1 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  switchIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  secondary: {
    height: 52,
    paddingHorizontal: 24,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    flex: 1,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
