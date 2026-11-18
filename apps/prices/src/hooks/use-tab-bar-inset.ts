import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Height of the floating tab bar itself. */
export const TAB_BAR_HEIGHT = 64;

/** Distance from the screen bottom to the floating bar. */
export const tabBarBottom = (safeBottom: number) => (safeBottom > 0 ? safeBottom : 16);

/**
 * Space a tab screen must leave at the bottom so content can scroll above the
 * floating tab bar (bar + its offset + a small gap).
 */
export function useTabBarInset() {
  const { bottom } = useSafeAreaInsets();
  return tabBarBottom(bottom) + TAB_BAR_HEIGHT + 16;
}
