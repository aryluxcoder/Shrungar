import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { BrandHeader, SignInPanel } from '@/components/sign-in-panel';
import { Tap } from '@/components/tap';
import { Colors } from '@/constants/theme';
import { useShop } from '@/store/shop-store';

// Opened as a modal whenever a guest tries something that needs an account.
export default function SignInModal() {
  const insets = useSafeAreaInsets();
  const { user } = useShop();
  // iOS shows modals as a sheet below the status bar, so it needs no top inset.
  const top = Platform.OS === 'ios' ? 0 : insets.top;
  const close = () => router.back();

  // Return to what the guest was doing as soon as they are signed in.
  useEffect(() => {
    if (user) router.back();
  }, [user]);

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <StatusBar style="light" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <BrandHeader topInset={top} height={240} />
        <SignInPanel onSkip={close} skipLabel="Not now" />
      </ScrollView>
      <Tap accessibilityLabel="Close" onPress={close} style={[styles.close, { top: top + 14 }]}>
        <Icon name="close" size={20} color={Colors.white} />
      </Tap>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.page },
  close: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
