// Entrance and looping animations matching the designs' rise / pop / spin / pulse classes.
// Reanimated skips these when the device has "reduce motion" turned on.

import { useEffect, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

const ease = Easing.bezier(0.2, 0.8, 0.2, 1);

export const rise = (step = 0) => FadeInDown.duration(650).delay(step * 80).easing(ease);
export const pop = (step = 0) => ZoomIn.springify().damping(13).delay(step * 80);
export const slideIn = (step = 0) => FadeInRight.duration(550).delay(step * 80).easing(ease);
export const bubbleIn = (mine: boolean) => (mine ? FadeInRight : FadeInLeft).duration(420).easing(ease);

function useLoop(duration: number, from = 0, to = 1, reverse = false) {
  const reduced = useReducedMotion();
  const value = useSharedValue(from);
  useEffect(() => {
    if (reduced) return;
    value.set(withRepeat(withTiming(to, { duration, easing: reverse ? Easing.inOut(Easing.ease) : Easing.linear }), -1, reverse));
  }, [duration, from, to, reverse, reduced, value]);
  return value;
}

// Decorative mandala that slowly turns behind headers.
export function Mandala({ size, color = 'rgba(255,255,255,0.22)', style }: { size: number; color?: string; style?: StyleProp<ViewStyle> }) {
  const turn = useLoop(28000, 0, 360);
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get()}deg` }] }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size }, style, spin]}>
      <Svg width={size} height={size} viewBox="0 0 200 200" fill="none" stroke={color} strokeWidth={1.4}>
        <Circle cx="100" cy="100" r="90" />
        <Circle cx="100" cy="100" r="64" />
        <Circle cx="100" cy="100" r="36" />
        <Path d="M100 10c12 30 12 60 0 90-12-30-12-60 0-90zM100 190c-12-30-12-60 0-90 12 30 12 60 0 90zM10 100c30-12 60-12 90 0-30 12-60 12-90 0zM190 100c-30 12-60 12-90 0 30-12 60-12 90 0z" />
        <Path d="M36 36c28 6 50 28 64 64-36-14-58-36-64-64zM164 164c-28-6-50-28-64-64 36 14 58 36 64 64zM164 36c-6 28-28 50-64 64 14-36 36-58 64-64zM36 164c6-28 28-50 64-64-14 36-36 58-64 64z" />
      </Svg>
    </Animated.View>
  );
}

// Gentle up-and-down sway (moon badge on Home).
export function Sway({ children }: { children: ReactNode }) {
  const t = useLoop(2250, -1, 1, true);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -4 - 4 * t.get() }, { rotate: `${3 * t.get()}deg` }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

// Soft ring that pulses outward from a dot or badge.
export function Pulse({ color, size, radius, children }: { color: string; size: number; radius?: number; children: ReactNode }) {
  const t = useLoop(1800, 0, 1);
  const ring = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - t.get()),
    transform: [{ scale: 1 + 0.6 * t.get() }],
  }));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        pointerEvents="none"
        style={[{ position: 'absolute', width: size, height: size, borderRadius: radius ?? size / 2, backgroundColor: color }, ring]}
      />
      {children}
    </View>
  );
}

// Fades its children in and out to mark the current step.
export function Glow({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useLoop(900, 0, 1, true);
  const glow = useAnimatedStyle(() => ({ opacity: 1 - 0.55 * t.get() }));
  return <Animated.View style={[style, glow]}>{children}</Animated.View>;
}

function Dot({ delay }: { delay: number }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    t.set(withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 480 }), withTiming(0, { duration: 480 }), withTiming(0, { duration: 240 })), -1)));
  }, [delay, reduced, t]);
  const style = useAnimatedStyle(() => ({ opacity: 0.25 + 0.75 * t.get(), transform: [{ translateY: -3 * t.get() }] }));
  return <Animated.View style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#8A7180' }, style]} />;
}

export function TypingDots() {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}
