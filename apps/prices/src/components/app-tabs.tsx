import { Ionicons } from '@expo/vector-icons';
import { type Href } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabListProps, type TabTriggerSlotProps } from 'expo-router/ui';
import { createContext, use, useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth } from '@/constants/theme';
import { TAB_BAR_HEIGHT, tabBarBottom } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';

type IconName = 'home' | 'storefront' | 'list' | 'settings';

const TABS: { name: string; href: Href; icon: IconName; label: string }[] = [
  { name: 'home', href: '/' as Href, icon: 'home', label: 'Inicio' },
  { name: 'explore', href: '/explore', icon: 'storefront', label: 'Explorar' },
  { name: 'lists', href: '/lists', icon: 'list', label: 'Listas' },
  { name: 'settings', href: '/settings', icon: 'settings', label: 'Ajustes' },
];

const PADDING = 6;
const timing = { duration: 280, easing: Easing.out(Easing.cubic) };

/** Active tab content sits on the white bubble, so it always uses the deep brand green. */
const ACTIVE_COLOR = Colors.light.primary;
const BUBBLE_COLOR = '#FFFFFF';

type BarContext = { active: SharedValue<number>; tabWidth: SharedValue<number> };
const TabBarContext = createContext<BarContext | null>(null);

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <FloatingTabList>
          {TABS.map((tab, index) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton index={index} icon={tab.icon} label={tab.label} />
            </TabTrigger>
          ))}
        </FloatingTabList>
      </TabList>
    </Tabs>
  );
}

function FloatingTabList(props: TabListProps) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const active = useSharedValue(0);
  const tabWidth = useSharedValue(0);
  const hidden = useSharedValue(0);
  const [ctx] = useState<BarContext>(() => ({ active, tabWidth }));

  // Slide the bar away while the keyboard is open (native only).
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const show = Keyboard.addListener('keyboardDidShow', () => hidden.set(withTiming(1, timing)));
    const hide = Keyboard.addListener('keyboardDidHide', () => hidden.set(withTiming(0, timing)));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [hidden]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: tabWidth.get(),
    transform: [{ translateX: active.get() * tabWidth.get() }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    opacity: 1 - hidden.get(),
    transform: [{ translateY: hidden.get() * (TAB_BAR_HEIGHT + 40) }],
  }));

  return (
    <View {...props} style={[styles.container, { bottom: tabBarBottom(insets.bottom) }]} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: c.primary,
            borderColor: 'rgba(255,255,255,0.18)',
            boxShadow: `0 18px 36px -16px ${c.primary}B3, 0 2px 8px -4px ${c.shadow}33`,
          },
          barStyle,
        ]}
        onLayout={(e) => tabWidth.set((e.nativeEvent.layout.width - PADDING * 2) / TABS.length)}>
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: BUBBLE_COLOR, boxShadow: '0 4px 12px -4px rgba(0,0,0,0.25)' },
            indicatorStyle,
          ]}
        />
        <TabBarContext value={ctx}>{props.children}</TabBarContext>
      </Animated.View>
    </View>
  );
}

type TabButtonProps = TabTriggerSlotProps & { index: number; icon: IconName; label: string };

function TabButton({ isFocused, index, icon, label, ...props }: TabButtonProps) {
  const c = useTheme();
  const bar = use(TabBarContext)!;
  // Read the shared value directly inside each animated style so Reanimated
  // subscribes to it (values reached through helper closures aren't tracked).
  const active = bar.active;

  useEffect(() => {
    if (isFocused) active.set(withTiming(index, timing));
  }, [isFocused, index, active]);

  // d = 0 when the bubble sits on this tab, 1 when it's a full tab (or more) away.
  const activeIconStyle = useAnimatedStyle(() => {
    const d = Math.min(1, Math.abs(active.get() - index));
    return {
      opacity: interpolate(d, [0, 1], [1, 0]),
      transform: [
        { scale: interpolate(d, [0, 1], [1.08, 0.9]) },
        { translateY: interpolate(d, [0, 1], [-1, 0]) },
      ],
    };
  });
  const inactiveIconStyle = useAnimatedStyle(() => {
    const d = Math.min(1, Math.abs(active.get() - index));
    return {
      opacity: interpolate(d, [0, 1], [0, 1]),
      transform: [{ scale: interpolate(d, [0, 1], [1.08, 1]) }],
    };
  });
  const labelStyle = useAnimatedStyle(() => {
    const d = Math.min(1, Math.abs(active.get() - index));
    return { color: interpolateColor(d, [0, 1], [ACTIVE_COLOR, c.onPrimary]) };
  });

  return (
    // expo-router's slot ref type doesn't match Pressable's; the ref is still forwarded at runtime.
    <Pressable
      {...(props as PressableProps)}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={styles.tab}>
      <View style={styles.iconBox}>
        <Animated.View style={[styles.iconLayer, inactiveIconStyle]}>
          <Ionicons name={`${icon}-outline`} size={21} color={c.onPrimary} />
        </Animated.View>
        <Animated.View style={[styles.iconLayer, activeIconStyle]}>
          <Ionicons name={icon} size={21} color={ACTIVE_COLOR} />
        </Animated.View>
      </View>
      <Animated.Text numberOfLines={1} style={[styles.label, labelStyle]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1 },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    maxWidth: Math.min(MaxContentWidth, 460),
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    padding: PADDING,
    borderRadius: TAB_BAR_HEIGHT / 2,
    borderWidth: 1,
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: PADDING,
    borderRadius: (TAB_BAR_HEIGHT - PADDING * 2) / 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLayer: {
    position: 'absolute',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: 700,
  },
});
