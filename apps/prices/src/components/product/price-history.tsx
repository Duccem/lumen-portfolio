import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Txt } from '@/components/home/primitives';
import { formatPrice } from '@/data/pricing';
import { useTheme } from '@/hooks/use-theme';

const CHART_HEIGHT = 120;

/** 8-week lowest-price history. Tap a bar to read its value. */
export function PriceHistory({ values, average }: { values: number[]; average: number }) {
  const c = useTheme();
  const [active, setActive] = useState(values.length - 1);

  const max = Math.max(...values, average);
  const min = Math.min(...values, average) * 0.85;
  const range = max - min || 1;
  const toHeight = (v: number) => 12 + ((v - min) / range) * (CHART_HEIGHT - 12);
  const avgBottom = toHeight(average);

  const first = values[0];
  const last = values[values.length - 1];
  const change = first ? ((last - first) / first) * 100 : 0;
  const weeksAgo = values.length - 1 - active;

  return (
    <View style={styles.root}>
      <View style={styles.summary}>
        <View>
          <Txt variant="caption" color="textTertiary">
            {weeksAgo === 0 ? 'Esta semana' : `Hace ${weeksAgo} ${weeksAgo === 1 ? 'semana' : 'semanas'}`}
          </Txt>
          <Animated.View key={active} entering={FadeIn.duration(150)}>
            <Txt variant="title">{formatPrice(values[active])}</Txt>
          </Animated.View>
        </View>
        <View
          style={[
            styles.trend,
            { backgroundColor: change < 0 ? c.primarySoft : change > 0 ? c.dealSoft : c.surfaceMuted },
          ]}>
          <Txt variant="captionStrong" color={change < 0 ? 'primary' : change > 0 ? 'deal' : 'textSecondary'}>
            {change < 0 ? '↓' : change > 0 ? '↑' : '='} {Math.abs(change).toFixed(0)}% en 8 semanas
          </Txt>
        </View>
      </View>

      <View style={styles.chart}>
        {/* Average guide line */}
        <View style={[styles.avgLine, { bottom: avgBottom, borderColor: c.textTertiary }]} />
        <View style={[styles.avgLabel, { bottom: avgBottom + 4, backgroundColor: c.surface }]}>
          <Txt variant="caption" color="textTertiary" style={styles.avgText}>
            prom. {formatPrice(average)}
          </Txt>
        </View>

        {values.map((v, i) => {
          const selected = i === active;
          return (
            <Pressable key={i} onPress={() => setActive(i)} style={styles.barHit} hitSlop={4}>
              <View
                style={[
                  styles.bar,
                  {
                    height: toHeight(v),
                    backgroundColor: selected ? c.primary : c.primarySoft,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.axis}>
        <Txt variant="caption" color="textTertiary">
          Hace 8 sem.
        </Txt>
        <Txt variant="caption" color="textTertiary">
          Hoy
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  summary: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  trend: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chart: {
    height: CHART_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  barHit: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 8,
  },
  avgLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  avgLabel: {
    position: 'absolute',
    right: 0,
    paddingHorizontal: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  avgText: {
    fontSize: 11,
  },
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
