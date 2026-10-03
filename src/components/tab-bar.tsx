import { Tabs } from 'expo-router';
import { useEffect, useState, type ComponentProps } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons';
import { Txt } from '@/components/txt';
import { Colors, Shadows, TabBar } from '@/constants/theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const Meta: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Home', icon: 'home' },
  shop: { label: 'Shop', icon: 'grid' },
  request: { label: 'Request', icon: 'moon' },
  help: { label: 'Help', icon: 'chat' },
  me: { label: 'Me', icon: 'user' },
};

export function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setOpen(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return open;
}

// Space a tab screen should leave at the bottom so content clears the floating bar.
export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  return TabBar.height + TabBar.gap + insets.bottom;
}

// Floating rounded tab bar from the Home design.
export function FloatingTabBar({ state, navigation, insets }: TabBarProps) {
  const keyboardOpen = useKeyboardOpen();
  if (keyboardOpen) return null;

  return (
    <View style={[styles.bar, { bottom: TabBar.gap + insets.bottom }]} accessibilityRole="tablist">
      {state.routes.map((route, index) => {
        const meta = Meta[route.name];
        if (!meta) return null;
        const focused = state.index === index;
        const color = focused ? Colors.accent : Colors.muted;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={meta.label}
            onPress={onPress}
            style={styles.item}>
            <Icon name={meta.icon} size={22} color={color} strokeWidth={focused ? 2 : 1.8} />
            <Txt size={11} weight={focused ? 'bold' : 'semibold'} color={color}>
              {meta.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: TabBar.height,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    boxShadow: Shadows.bar,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
});
