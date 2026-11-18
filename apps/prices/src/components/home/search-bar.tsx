import { Ionicons } from '@expo/vector-icons';
import { type Ref } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View, type TextInputInstance } from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { PressableScale, Txt } from './primitives';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onOpenFilters: () => void;
  filterCount: number;
  ref?: Ref<TextInputInstance>;
};

export function SearchBar({
  value,
  onChangeText,
  focused,
  onFocus,
  onBlur,
  onOpenFilters,
  filterCount,
  ref,
}: Props) {
  const c = useTheme();

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.field,
          {
            backgroundColor: c.surface,
            borderColor: focused ? c.primary : c.border,
            boxShadow: focused
              ? `0 0 0 4px ${c.primarySoft}`
              : `0 6px 18px -10px ${c.shadow}33`,
          },
        ]}>
        <Ionicons name="search" size={20} color={focused ? c.primary : c.textTertiary} />
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Busca leche, palta, arroz…"
          placeholderTextColor={c.textTertiary}
          returnKeyType="search"
          autoCorrect={false}
          selectionColor={c.primary}
          style={[styles.input, { color: c.text }, Platform.OS === 'web' && styles.inputWeb]}
        />
        {value.length > 0 && (
          <Animated.View entering={ZoomIn.duration(160)} exiting={ZoomOut.duration(120)}>
            <Pressable
              hitSlop={10}
              accessibilityLabel="Limpiar búsqueda"
              onPress={() => onChangeText('')}
              style={[styles.clear, { backgroundColor: c.surfaceMuted }]}>
              <Ionicons name="close" size={14} color={c.textSecondary} />
            </Pressable>
          </Animated.View>
        )}
      </View>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Abrir filtros"
        onPress={onOpenFilters}
        style={[
          styles.filterButton,
          { backgroundColor: c.primary, boxShadow: `0 10px 20px -10px ${c.primary}` },
        ]}>
        <Ionicons name="options-outline" size={22} color={c.onPrimary} />
        {filterCount > 0 && (
          <Animated.View
            entering={ZoomIn.springify()}
            exiting={ZoomOut}
            style={[styles.badge, { backgroundColor: c.deal, borderColor: c.background }]}>
            <Txt variant="captionStrong" style={styles.badgeText}>
              {filterCount}
            </Txt>
          </Animated.View>
        )}
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  field: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: 500,
    height: '100%',
  },
  inputWeb: {
    // @ts-expect-error web-only style
    outlineStyle: 'none',
  },
  clear: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 4,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 14,
  },
});
