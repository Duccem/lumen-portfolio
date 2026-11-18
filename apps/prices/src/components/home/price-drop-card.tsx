import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Radius } from '@/constants/theme';
import { CATEGORY_BY_ID, STORE_BY_ID } from '@/data/catalog';
import { formatPrice, type PriceSummary } from '@/data/pricing';
import { useTheme } from '@/hooks/use-theme';

import { PressableScale, Txt } from './primitives';
import { StoreLogo } from './store-badges';

export const DROP_CARD_WIDTH = 232;

/** Tiny bar chart of the 8-week lowest-price history. */
function MiniHistory({ values }: { values: number[] }) {
  const c = useTheme();
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return (
    <View style={styles.chart}>
      {values.map((v, i) => {
        const last = i === values.length - 1;
        return (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: 8 + ((v - min) / range) * 24,
                backgroundColor: last ? c.primary : c.primarySoft,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export function PriceDropCard({ summary, onPress }: { summary: PriceSummary; onPress?: () => void }) {
  const c = useTheme();
  const dark = useColorScheme() === 'dark';
  const { product, dropOffer, dropPct } = summary;
  if (!dropOffer?.previousPrice) return null;
  const tint = dark ? c.surfaceMuted : CATEGORY_BY_ID[product.category].tint;

  return (
    <PressableScale
      activeScale={0.97}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border, boxShadow: `0 12px 24px -18px ${c.shadow}55` },
      ]}>
      <View style={styles.top}>
        <View style={[styles.media, { backgroundColor: tint }]}>
          <Text style={styles.emoji}>{product.emoji}</Text>
        </View>
        <View style={styles.info}>
          <Txt variant="body" numberOfLines={1}>
            {product.name}
          </Txt>
          <Txt variant="caption" color="textTertiary">
            {product.unit}
          </Txt>
          <View style={styles.storeRow}>
            <StoreLogo id={dropOffer.storeId} size={18} />
            <Txt variant="caption" color="textSecondary" numberOfLines={1} style={styles.flex}>
              {STORE_BY_ID[dropOffer.storeId].name}
            </Txt>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <View>
          <Txt variant="caption" color="textTertiary" style={styles.strike}>
            {formatPrice(dropOffer.previousPrice)}
          </Txt>
          <View style={styles.priceLine}>
            <Txt variant="title">{formatPrice(dropOffer.price)}</Txt>
            <View style={[styles.pill, { backgroundColor: c.dealSoft }]}>
              <Txt variant="captionStrong" color="deal">
                -{Math.round(dropPct)}%
              </Txt>
            </View>
          </View>
        </View>
        <MiniHistory values={product.history} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: DROP_CARD_WIDTH,
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 12,
  },
  top: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  media: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 36,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  flex: { flex: 1 },
  bottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  strike: {
    textDecorationLine: 'line-through',
  },
  priceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 32,
  },
  bar: {
    width: 5,
    borderRadius: 3,
  },
});
