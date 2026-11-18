import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useThemePreference } from '@/state/app-state';

const subscribe = () => () => {};

/**
 * To support static rendering, the system value is only trusted after hydration
 * (server snapshot = false, client snapshot = true).
 */
export function useColorScheme(): 'light' | 'dark' {
  const preference = useThemePreference();
  const system = useRNColorScheme();
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (preference !== 'system') return preference;
  if (!hydrated) return 'light';
  return system === 'dark' ? 'dark' : 'light';
}
