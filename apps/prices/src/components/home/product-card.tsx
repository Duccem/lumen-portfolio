import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated, { BounceIn, ZoomIn } from 'react-native-reanimated';

import { Radius } from '@/constants/theme';
import { CATEGORY_BY_ID, STORE_BY_ID } from '@/data/catalog';
import { formatPrice, unitPrice, type PriceSummary } from '@/data/pricing';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-state';

import { PressableScale, Txt } from './primitives';
import { StoreStack } from './store-badges';

type Props = {
  summary: PriceSummary;
  width: number;
  favorite: boolean;
  inList: boolean;
  onToggleFavorite: () => void;
  onToggleList: () => void;
  onPress?: () => void;
};

export function ProductCard({
  summary,
  width,
  favorite,
  inList,
  onToggleFavorite,
  onToggleList,
  onPress,
}: Props) {
  const c = useTheme();
  const dark = useColorScheme() === 'dark';
  const { product, best, highest, dropPct, offers } = summary;
  const tint = dark ? c.surfaceMuted : CATEGORY_BY_ID[product.category].tint;
  const spread = highest.price - best.price;
  const perUnit = useAppState().settings.showUnitPrice ? unitPrice(best.price, product.unit) : null;

  return (
    <PressableScale
      activeScale={0.97}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, desde ${formatPrice(best.price)}`}
      style={[
        styles.card,
        {
          width,
          backgroundColor: c.surface,
          borderColor: c.border,
          boxShadow: `0 12px 24px -18px ${c.shadow}55`,
        },
      ]}>
      <View style={[styles.media, { backgroundColor: tint }]}>
        <Text style={styles.emoji}>{product.emoji}</Text>

        {dropPct > 0 && (
          <View style={[styles.dropBadge, { backgroundColor: c.deal }]}>
            <Ionicons name="trending-down" size={12} color="#FFFFFF" />
            <Txt variant="captionStrong" style={styles.dropText}>
              -{Math.round(dropPct)}%
            </Txt>
          </View>
        )}

        <Pressable
          hitSlop={8}
          onPress={onToggleFavorite}
          accessibilityLabel={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          style={[styles.heart, { backgroundColor: c.surface }]}>
          <Animated.View key={String(favorite)} entering={favorite ? BounceIn.duration(420) : undefined}>
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={16}
              color={favorite ? c.deal : c.textSecondary}
            />
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.body}>
        <Txt variant="body" numberOfLines={2} style={styles.name}>
          {product.name}
        </Txt>
        <Txt variant="caption" color="textTertiary" numberOfLines={1}>
          {product.brand ? `${product.brand} · ` : ''}
          {product.unit}
          {perUnit ? ` · ${perUnit}` : ''}
        </Txt>

        <View style={styles.priceRow}>
          <View style={styles.priceCol}>
            <Txt variant="caption" color="textSecondary">
              Desde
            </Txt>
            <Txt variant="title" style={styles.price}>
              {formatPrice(best.price)}
            </Txt>
          </View>

          <PressableScale
            activeScale={0.88}
            onPress={onToggleList}
            accessibilityLabel={inList ? 'Quitar de la canasta' : 'Agregar a la canasta'}
            style={[
              styles.addButton,
              inList
                ? { backgroundColor: c.primarySoft }
                : { backgroundColor: c.primary, boxShadow: `0 8px 14px -8px ${c.primary}` },
            ]}>
            <Animated.View key={String(inList)} entering={ZoomIn.springify()}>
              <Ionicons
                name={inList ? 'checkmark' : 'add'}
                size={20}
                color={inList ? c.primary : c.onPrimary}
              />
            </Animated.View>
          </PressableScale>
        </View>

        <View style={[styles.footer, { borderTopColor: c.border }]}>
          <StoreStack storeIds={offers.map((o) => o.storeId)} />
          <Txt variant="caption" color="textSecondary" numberOfLines={1} style={styles.footerText}>
            {spread > 0.005 ? (
              <>
                Ahorra <Txt variant="captionStrong" color="primary">{formatPrice(spread)}</Txt>
              </>
            ) : (
              STORE_BY_ID[best.storeId].name
            )}
          </Txt>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 8,
  },
  media: {
    height: 128,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 64,
  },
  dropBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  dropText: {
    color: '#FFFFFF',
  },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 2,
  },
  name: {
    minHeight: 40,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceCol: {
    gap: 0,
  },
  price: {
    fontVariant: ['tabular-nums'],
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  footerText: {
    flex: 1,
    textAlign: 'right',
  },
});
