import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { PressableScale, Txt } from './primitives';

export function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  const c = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(260)} style={styles.root}>
      <View style={[styles.circle, { backgroundColor: c.primarySoft }]}>
        <Text style={styles.emoji}>🔎</Text>
      </View>
      <Txt variant="title" style={styles.center}>
        No encontramos {query ? `“${query}”` : 'productos'}
      </Txt>
      <Txt variant="body" color="textSecondary" style={styles.center}>
        Prueba con otra palabra o quita algunos filtros para ver más opciones.
      </Txt>
      <PressableScale
        onPress={onReset}
        style={[styles.button, { backgroundColor: c.primary, boxShadow: `0 12px 20px -12px ${c.primary}` }]}>
        <Txt variant="bodyStrong" style={{ color: c.onPrimary }}>
          Limpiar búsqueda
        </Txt>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 8,
  },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 44,
  },
  center: {
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    height: 48,
    paddingHorizontal: 24,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
