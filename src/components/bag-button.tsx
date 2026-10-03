import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icons';
import { pop } from '@/components/motion';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { Colors, Shadows } from '@/constants/theme';
import { useShop } from '@/store/shop-store';

export function BagButton() {
  const { bagCount } = useShop();
  return (
    <Tap
      accessibilityLabel={bagCount ? `Open bag, ${bagCount} items` : 'Open bag'}
      onPress={() => router.push('/bag')}
      style={styles.button}>
      <Icon name="bag" />
      {bagCount > 0 ? (
        <Animated.View key={bagCount} entering={pop()} style={styles.badge}>
          <Txt weight="bold" size={11} color={Colors.white}>
            {bagCount > 9 ? '9+' : bagCount}
          </Txt>
        </Animated.View>
      ) : null}
    </Tap>
  );
}

export function IconButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Tap accessibilityLabel={label} onPress={onPress} style={styles.button}>
      <Icon name={icon} />
    </Tap>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: Shadows.card,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 3,
    borderRadius: 9,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
