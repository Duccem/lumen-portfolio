import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { type Store } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';

import { PressableScale, Txt } from './primitives';
import { StoreLogo } from './store-badges';

type Props = {
  stores: { store: Store; wins: number }[];
  onSelect: (store: Store) => void;
};

/** Nearby supermarkets with how many products they're cheapest for. */
export function StoreStrip({ stores, onSelect }: Props) {
  const c = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {stores.map(({ store, wins }, index) => (
        <PressableScale
          key={store.id}
          onPress={() => onSelect(store)}
          style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.head}>
            <StoreLogo id={store.id} size={40} />
            {index === 0 && (
              <View style={[styles.crown, { backgroundColor: c.primarySoft }]}>
                <Ionicons name="trophy" size={11} color={c.primary} />
                <Txt variant="captionStrong" color="primary" style={styles.crownText}>
                  Top
                </Txt>
              </View>
            )}
          </View>
          <Txt variant="bodyStrong" numberOfLines={1}>
            {store.name}
          </Txt>
          <View style={styles.meta}>
            <Ionicons name="location-outline" size={12} color={c.textTertiary} />
            <Txt variant="caption" color="textTertiary">
              {store.distanceKm.toFixed(1)} km · {store.deliveryMin} min
            </Txt>
          </View>
          <View style={[styles.wins, { backgroundColor: c.surfaceMuted }]}>
            <Txt variant="caption" color="textSecondary">
              Más barato en{' '}
              <Txt variant="captionStrong" color="text">
                {wins}
              </Txt>
            </Txt>
          </View>
        </PressableScale>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 156,
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 4,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  crown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  crownText: {
    fontSize: 11,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  wins: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
});
