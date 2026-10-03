import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

// Pressable with the designs' "tap" feedback: a quick shrink while pressed.
export function Tap({ style, children, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.96 }], opacity: 0.94 }]}>
      {children}
    </Pressable>
  );
}
