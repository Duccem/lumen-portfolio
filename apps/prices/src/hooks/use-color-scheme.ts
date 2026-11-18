import { useColorScheme as useRNColorScheme } from 'react-native';

import { useThemePreference } from '@/state/app-state';

/** Resolved color scheme: the user's choice in Ajustes, or the system one. */
export function useColorScheme(): 'light' | 'dark' {
  const preference = useThemePreference();
  const system = useRNColorScheme();
  if (preference !== 'system') return preference;
  return system === 'dark' ? 'dark' : 'light';
}
