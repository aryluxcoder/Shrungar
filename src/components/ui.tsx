import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon } from '@/components/icons';
import { rise } from '@/components/motion';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { Colors, Fonts, Shadows } from '@/constants/theme';

export function BackButton({ dark, onPress }: { dark?: boolean; onPress?: () => void }) {
  return (
    <Tap
      accessibilityLabel="Back"
      onPress={onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
      style={[styles.back, dark ? { backgroundColor: 'rgba(255,255,255,0.1)' } : { backgroundColor: Colors.surface }]}>
      <Icon name="back" size={20} color={dark ? Colors.white : Colors.ink} />
    </Tap>
  );
}

export function ScreenHeader({ title, subtitle, back = true }: { title: string; subtitle?: string; back?: boolean }) {
  return (
    <Animated.View entering={rise()} style={styles.header}>
      {back ? <BackButton /> : null}
      <View style={{ flex: 1 }}>
        <Txt display size={subtitle ? 24 : 26} accessibilityRole="header">
          {title}
        </Txt>
        {subtitle ? (
          <Txt size={12} color={Colors.muted} numberOfLines={1}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
    </Animated.View>
  );
}

type ButtonTone = 'accent' | 'dark' | 'light' | 'outline';

const tones: Record<ButtonTone, { bg: string; fg: string; border?: string }> = {
  accent: { bg: Colors.accent, fg: Colors.white },
  dark: { bg: Colors.ink, fg: Colors.white },
  light: { bg: Colors.surface, fg: Colors.ink },
  outline: { bg: Colors.surface, fg: Colors.ink, border: '#E2D4DA' },
};

export function Button({
  label,
  onPress,
  tone = 'accent',
  height = 54,
  icon,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  tone?: ButtonTone;
  height?: number;
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = tones[tone];
  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled }}
      style={[
        styles.button,
        { height, borderRadius: height / 2, backgroundColor: t.bg, opacity: disabled ? 0.5 : 1 },
        t.border ? { borderWidth: 1.5, borderColor: t.border } : null,
        style,
      ]}>
      {icon}
      <Txt weight="bold" size={16} color={t.fg}>
        {label}
      </Txt>
    </Tap>
  );
}

export function TextLink({ label, onPress, color = Colors.accent }: { label: string; onPress: () => void; color?: string }) {
  return (
    <Tap onPress={onPress} style={styles.textLink}>
      <Txt weight="semibold" size={14} color={color}>
        {label}
      </Txt>
    </Tap>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <Txt weight="bold" size={14}>
      {children}
    </Txt>
  );
}

export function Field({ style, multiline, ...rest }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={Colors.faint}
      multiline={multiline}
      {...rest}
      style={[styles.field, multiline && styles.fieldMulti, style]}
    />
  );
}

export const ui = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const styles = StyleSheet.create({
  back: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 22,
  },
  textLink: {
    minHeight: 44,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  field: {
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.ink,
    boxShadow: Shadows.soft,
  },
  fieldMulti: {
    height: 96,
    paddingTop: 14,
    paddingBottom: 14,
    textAlignVertical: 'top',
  },
});
