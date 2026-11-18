import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Radius } from '@/constants/theme';
import { CATEGORIES, type CategoryId } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';

import { PressableScale, Txt } from './primitives';

type Props = {
  selected: CategoryId;
  onSelect: (id: CategoryId) => void;
};

export function CategoryChips({ selected, onSelect }: Props) {
  const c = useTheme();
  const dark = useColorScheme() === 'dark';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      {CATEGORIES.map((cat) => {
        const active = cat.id === selected;
        return (
          <PressableScale
            key={cat.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(cat.id)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? c.primary : c.surface,
                borderColor: active ? c.primary : c.border,
                boxShadow: active ? `0 8px 16px -8px ${c.primary}` : 'none',
              },
            ]}>
            <View
              style={[
                styles.emojiWrap,
                { backgroundColor: active ? 'rgba(255,255,255,0.22)' : dark ? c.surfaceMuted : cat.tint },
              ]}>
              <Text style={styles.emoji}>{cat.emoji}</Text>
            </View>
            <Txt variant="captionStrong" style={{ color: active ? c.onPrimary : c.text }}>
              {cat.label}
            </Txt>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
    paddingRight: 16,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  emojiWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 18,
  },
});
