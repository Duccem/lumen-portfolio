import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Brand } from '@/constants/theme';

/** Must match `imageWidth` of expo-splash-screen in app.json so the hand-off is seamless. */
const MARK_WIDTH = 88;
const MARK_HEIGHT = Math.round(MARK_WIDTH * (384 / 302));
const WORDMARK_WIDTH = 220;
const WORDMARK_HEIGHT = Math.round(WORDMARK_WIDTH * (281 / 1200));

const ease = Easing.out(Easing.cubic);

/**
 * Brand intro shown on top of the app right after the native splash:
 * the "P" mark (same size/position as the native splash) gives way to the
 * full Preci wordmark, then the green layer fades out to reveal the app.
 */
export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);

  const mark = useSharedValue(1);
  const word = useSharedValue(0);
  const overlay = useSharedValue(1);

  const markStyle = useAnimatedStyle(() => ({
    opacity: mark.get(),
    transform: [{ scale: 0.85 + mark.get() * 0.15 }],
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.get(),
    transform: [{ translateY: (1 - word.get()) * 8 }, { scale: 0.96 + word.get() * 0.04 }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlay.get(),
    transform: [{ scale: 1 + (1 - overlay.get()) * 0.04 }],
  }));

  const start = () => {
    mark.set(withDelay(150, withTiming(0, { duration: 260, easing: ease })));
    word.set(withDelay(260, withTiming(1, { duration: 320, easing: ease })));
    overlay.set(
      withDelay(
        1000,
        withTiming(0, { duration: 320, easing: Easing.in(Easing.quad) }, (finished) => {
          'worklet';
          if (finished) scheduleOnRN(setVisible, false);
        }),
      ),
    );
  };

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.overlay, overlayStyle]}
      onLayout={() => {
        SplashScreen.hideAsync().finally(start);
      }}>
      <View style={styles.center}>
        <Animated.View style={[styles.layer, markStyle]}>
          <Image
            source={require('@/assets/images/preci-mark-white.png')}
            style={{ width: MARK_WIDTH, height: MARK_HEIGHT }}
            contentFit="contain"
          />
        </Animated.View>
        <Animated.View style={[styles.layer, wordStyle]}>
          <Image
            source={require('@/assets/images/preci-wordmark-white.png')}
            style={{ width: WORDMARK_WIDTH, height: WORDMARK_HEIGHT }}
            contentFit="contain"
            accessibilityLabel="Preci"
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Brand.green,
    zIndex: 1000,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
