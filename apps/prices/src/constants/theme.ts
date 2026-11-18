/**
 * Preci design tokens. Green-forward palette following a 60/30/10 split:
 * neutral surfaces (60), ink text (30) and the green brand accent (10).
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Base template keys (kept for existing components)
    text: '#0E1F16',
    background: '#F3F7F4',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E2F1E7',
    textSecondary: '#5A6B61',

    // Preci tokens
    textTertiary: '#8C9A92',
    surface: '#FFFFFF',
    surfaceMuted: '#EBF3EE',
    border: '#E3ECE6',
    primary: '#17A04F',
    primaryStrong: '#0E7A3B',
    primarySoft: '#E1F4E8',
    onPrimary: '#FFFFFF',
    deal: '#E5484D',
    dealSoft: '#FDECEC',
    warning: '#E8A21A',
    overlay: 'rgba(8, 24, 15, 0.45)',
    shadow: '#0E4F2A',
  },
  dark: {
    text: '#ECF5EF',
    background: '#0A120E',
    backgroundElement: '#121D17',
    backgroundSelected: '#173324',
    textSecondary: '#A1B3A8',

    textTertiary: '#6D7F74',
    surface: '#121D17',
    surfaceMuted: '#1A2921',
    border: '#213128',
    primary: '#35C772',
    primaryStrong: '#7BE0A4',
    primarySoft: '#16301F',
    onPrimary: '#04140A',
    deal: '#FF6B6F',
    dealSoft: '#3A1C1E',
    warning: '#F5B740',
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: '#000000',
  },
} as const;

/** Preci brand colors (logo artwork). Used for splash, icons and brand moments. */
export const Brand = {
  green: '#35C772',
  ink: '#0E2A1B',
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type Palette = { [K in ThemeColor]: string };

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 12,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const MaxContentWidth = 800;
