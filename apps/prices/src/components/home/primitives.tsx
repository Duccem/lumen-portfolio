import { type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'display' | 'title' | 'body' | 'bodyStrong' | 'caption' | 'captionStrong';

export type TxtProps = TextProps & {
  variant?: Variant;
  color?: ThemeColor;
};

/** Typography with a fixed scale: 28 / 20 / 15 / 12, weights 500 & 700(+800 display). */
export function Txt({ variant = 'body', color = 'text', style, ...rest }: TxtProps) {
  const theme = useTheme();
  return <Text style={[styles[variant], { color: theme[color] }, style]} {...rest} />;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  /** Scale applied while pressed. */
  activeScale?: number;
};

/** Pressable with a springy scale-down, used for every tappable surface. */
export function PressableScale({
  style,
  children,
  activeScale = 0.96,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        scale.set(withSpring(activeScale, { damping: 18, stiffness: 400 }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, { damping: 14, stiffness: 300 }));
        onPressOut?.(e);
      }}
      style={[style, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <Animated.View style={styles.sectionHeader}>
      <Txt variant="title">{title}</Txt>
      {action ? (
        <Pressable hitSlop={12} onPress={onAction}>
          <Txt variant="captionStrong" color="primary">
            {action}
          </Txt>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 800,
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 700,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
    fontVariant: ['tabular-nums'],
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 500,
  },
  captionStrong: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 700,
    fontVariant: ['tabular-nums'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
});
