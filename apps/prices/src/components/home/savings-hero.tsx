import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { STORES } from '@/data/catalog';
import { formatPrice } from '@/data/pricing';
import { useTheme } from '@/hooks/use-theme';

import { PressableScale, Txt } from './primitives';

/** Weekly savings banner — the "peak" moment of the home screen. */
export function SavingsHero({ amount, onPress }: { amount: number; onPress: () => void }) {
  const c = useTheme();

  return (
    <PressableScale
      activeScale={0.98}
      onPress={onPress}
      style={[
        styles.card,
        {
          experimental_backgroundImage: 'linear-gradient(135deg, #1DB25A 0%, #0E7A3B 100%)',
          backgroundColor: '#17A04F',
          boxShadow: `0 20px 32px -20px ${c.primary}`,
        },
      ]}>
      {/* Decorative rings */}
      <View style={[styles.ring, styles.ringLarge]} />
      <View style={[styles.ring, styles.ringSmall]} />

      <View style={styles.content}>
        <View style={styles.eyebrow}>
          <Ionicons name="sparkles" size={12} color="#D8F7E3" />
          <Txt variant="captionStrong" style={styles.eyebrowText}>
            ESTA SEMANA
          </Txt>
        </View>
        <Txt variant="body" style={styles.lead}>
          Puedes ahorrar hasta
        </Txt>
        <Txt variant="display" style={styles.amount}>
          {formatPrice(amount)}
        </Txt>
        <Txt variant="caption" style={styles.sub}>
          comparando {STORES.length} supermercados cerca de ti
        </Txt>

        <View style={styles.cta}>
          <Txt variant="captionStrong" style={styles.ctaText}>
            Ver ofertas
          </Txt>
          <Ionicons name="arrow-forward" size={14} color="#0E7A3B" />
        </View>
      </View>

      <View style={styles.art}>
        <Text style={styles.artMain}>🛒</Text>
        <Text style={[styles.artFloat, { top: 4, left: -8 }]}>🥑</Text>
        <Text style={[styles.artFloat, { bottom: 10, right: -4 }]}>🍋</Text>
        <Text style={[styles.artFloat, { top: 0, right: 8, fontSize: 22 }]}>🥕</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: Radius.lg,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 24,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  ringLarge: {
    width: 240,
    height: 240,
    right: -80,
    top: -90,
  },
  ringSmall: {
    width: 120,
    height: 120,
    right: 40,
    bottom: -70,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginBottom: 8,
  },
  eyebrowText: {
    color: '#D8F7E3',
    letterSpacing: 0.8,
    fontSize: 11,
  },
  lead: {
    color: 'rgba(255,255,255,0.85)',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 40,
  },
  sub: {
    color: 'rgba(255,255,255,0.75)',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: '#FFFFFF',
  },
  ctaText: {
    color: '#0E7A3B',
  },
  art: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artMain: {
    fontSize: 64,
  },
  artFloat: {
    position: 'absolute',
    fontSize: 26,
  },
});
