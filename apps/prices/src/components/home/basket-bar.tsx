import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Radius } from '@/constants/theme';
import { buildBasket } from '@/data/basket';
import { formatPrice } from '@/data/pricing';
import { TAB_BAR_HEIGHT, tabBarBottom } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-state';

import { PressableScale, Txt } from './primitives';

/** Height the floating bar occupies, so screens can pad their content. */
export const BASKET_BAR_SPACE = 80;

/**
 * Floating mini-basket shown above the tab bar while the basket has items.
 * Shows the latest products added, item count and running total.
 */
export function BasketBar() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const { list } = useAppState();
  const basket = buildBasket(list);
  if (basket.lines.length === 0) return null;

  // Sits just above the floating tab bar.
  const bottom = tabBarBottom(insets.bottom) + TAB_BAR_HEIGHT + 12;
  const latest = basket.lines.slice(-3).reverse();

  return (
    <Animated.View
      entering={SlideInDown.duration(260).easing(Easing.out(Easing.cubic))}
      exiting={SlideOutDown.duration(200)}
      style={[styles.wrap, { bottom }]}
      pointerEvents="box-none">
      <PressableScale
        activeScale={0.98}
        accessibilityRole="button"
        accessibilityLabel={`Ver canasta, ${basket.units} productos, ${formatPrice(basket.total)}`}
        onPress={() => router.push('/basket')}
        style={[styles.bar, { backgroundColor: c.text, boxShadow: `0 16px 32px -14px ${c.shadow}99` }]}>
        <View style={styles.thumbs}>
          {latest.map((l, i) => (
            <Animated.View
              key={l.product.id}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              style={[
                styles.thumb,
                { backgroundColor: c.background, borderColor: c.text, marginLeft: i === 0 ? 0 : -12, zIndex: 3 - i },
              ]}>
              <Text style={styles.thumbEmoji}>{l.product.emoji}</Text>
            </Animated.View>
          ))}
        </View>

        <View style={styles.flex}>
          <Animated.View key={basket.units} entering={FadeIn.duration(180)}>
            <Txt variant="bodyStrong" style={{ color: c.background }}>
              {basket.units} {basket.units === 1 ? 'producto' : 'productos'}
            </Txt>
          </Animated.View>
          <Txt variant="caption" style={{ color: c.background, opacity: 0.7 }} numberOfLines={1}>
            {basket.potentialSaving > 0.005
              ? `Puedes ahorrar ${formatPrice(basket.potentialSaving)}`
              : `En ${basket.groups.length} ${basket.groups.length === 1 ? 'comercio' : 'comercios'}`}
          </Txt>
        </View>

        <View style={[styles.total, { backgroundColor: c.primary }]}>
          <Txt variant="bodyStrong" style={{ color: c.onPrimary }}>
            {formatPrice(basket.total)}
          </Txt>
          <Ionicons name="chevron-forward" size={16} color={c.onPrimary} />
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    maxWidth: MaxContentWidth - 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    paddingLeft: 10,
    borderRadius: Radius.lg,
  },
  flex: { flex: 1 },
  thumbs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: { fontSize: 20 },
  total: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 44,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: Radius.md,
  },
});
