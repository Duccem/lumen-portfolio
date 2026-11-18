import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { Radius } from '@/constants/theme';
import { RECENT_SEARCHES, TRENDING_SEARCHES } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';

import { PressableScale, Txt } from './primitives';

/** Shown while the search field is focused and empty — never a blank search. */
export function SearchSuggestions({ onPick }: { onPick: (term: string) => void }) {
  const c = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOut.duration(120)}
      style={[styles.panel, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Txt variant="captionStrong" color="textTertiary" style={styles.label}>
        BÚSQUEDAS RECIENTES
      </Txt>
      {RECENT_SEARCHES.map((term) => (
        <PressableScale key={term} activeScale={0.98} onPress={() => onPick(term)} style={styles.recent}>
          <Ionicons name="time-outline" size={18} color={c.textTertiary} />
          <Txt variant="body" style={styles.flex}>
            {term}
          </Txt>
          <Ionicons name="arrow-up-outline" size={16} color={c.textTertiary} style={styles.arrow} />
        </PressableScale>
      ))}

      <Txt variant="captionStrong" color="textTertiary" style={[styles.label, styles.labelSpaced]}>
        TENDENCIAS 🔥
      </Txt>
      <View style={styles.wrap}>
        {TRENDING_SEARCHES.map((term) => (
          <PressableScale
            key={term}
            onPress={() => onPick(term)}
            style={[styles.chip, { backgroundColor: c.primarySoft }]}>
            <Ionicons name="trending-up" size={14} color={c.primary} />
            <Txt variant="captionStrong" color="primaryStrong">
              {term}
            </Txt>
          </PressableScale>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  label: {
    letterSpacing: 0.8,
    fontSize: 11,
    marginBottom: 4,
  },
  labelSpaced: {
    marginTop: 16,
    marginBottom: 12,
  },
  recent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 44,
  },
  arrow: {
    transform: [{ rotate: '-45deg' }],
  },
  flex: { flex: 1 },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
  },
});
