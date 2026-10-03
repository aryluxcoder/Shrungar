import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { pop, rise } from '@/components/motion';
import { ProductPhoto } from '@/components/product-photo';
import { BrandHeader, SignInPanel } from '@/components/sign-in-panel';
import { useTabBarSpace } from '@/components/tab-bar';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { TextLink } from '@/components/ui';
import { formatPrice } from '@/constants/shop';
import { Colors } from '@/constants/theme';
import { Products } from '@/data/catalogue';
import { initial } from '@/lib/format';
import { useShop } from '@/store/shop-store';

function Row({ label, value, onPress }: { label: string; value?: ReactNode; onPress?: () => void }) {
  const content = (
    <>
      <Txt weight="bold" style={{ flex: 1 }}>
        {label}
      </Txt>
      {value}
      {onPress ? <Icon name="chevron" size={18} color={Colors.muted} /> : null}
    </>
  );
  return onPress ? (
    <Tap onPress={onPress} style={styles.row}>
      {content}
    </Tap>
  ) : (
    <View style={styles.row}>{content}</View>
  );
}

export default function MeScreen() {
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const focused = useIsFocused();
  const { user, signOut, orders, requests, myReviews, address, wishlist } = useShop();

  const saved = Products.filter((p) => wishlist.includes(p.id));

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      {focused ? <StatusBar style="light" /> : null}
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: tabSpace + 24 }}>
        <BrandHeader topInset={insets.top} height={user ? 220 : 300} />

        {!user ? (
          <SignInPanel onSkip={() => router.navigate('/')} skipLabel="Browse as guest" />
        ) : (
          <View style={styles.account}>
            <Animated.View entering={pop()} style={styles.avatar}>
              <Txt display size={34} color={Colors.accentDeep}>
                {initial(user.name)}
              </Txt>
            </Animated.View>
            <Animated.View entering={rise(1)} style={{ alignItems: 'center', gap: 4 }}>
              <Txt display size={26}>
                Hello, {user.name}
              </Txt>
              <Txt size={13} color={Colors.muted}>
                {user.provider === 'google' ? 'Signed in with Google' : `Signed in with ${user.phone}`} · demo mode
              </Txt>
            </Animated.View>

            <Animated.View entering={rise(2)} style={styles.rows}>
              <Row
                label="My orders & requests"
                value={<Txt color={Colors.muted}>{orders.length + requests.length || ''}</Txt>}
                onPress={() => router.push('/orders')}
              />
              <Row
                label="My reviews"
                value={<Txt color={Colors.muted}>{myReviews.length || ''}</Txt>}
                onPress={() => router.push('/my-reviews')}
              />
              <Row label="Help & chat" onPress={() => router.navigate('/help')} />
              <Row
                label="Saved address"
                value={
                  <Txt size={13} color={Colors.muted} numberOfLines={1} style={{ maxWidth: 160 }}>
                    {address ? `${address.city} ${address.pincode}` : 'Added at checkout'}
                  </Txt>
                }
              />
            </Animated.View>

            {saved.length ? (
              <Animated.View entering={rise(3)} style={{ alignSelf: 'stretch', gap: 10 }}>
                <Txt display size={20}>
                  Saved pieces
                </Txt>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {saved.map((p) => (
                    <Tap
                      key={p.id}
                      onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })}
                      style={{ width: 132, gap: 6 }}>
                      <ProductPhoto photo={p.photo} pattern={p.pattern} style={{ height: 110, borderRadius: 16 }} />
                      <Txt weight="semibold" size={13} numberOfLines={1}>
                        {p.name}
                      </Txt>
                      <Txt weight="bold" size={13} color={Colors.accent}>
                        {formatPrice(p.price)}
                      </Txt>
                    </Tap>
                  ))}
                </ScrollView>
              </Animated.View>
            ) : null}

            <Animated.View entering={rise(3)}>
              <TextLink label="Sign out" onPress={signOut} />
            </Animated.View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.page },
  account: { paddingHorizontal: 22, alignItems: 'center', gap: 16 },
  avatar: {
    marginTop: -44,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.blush,
    borderWidth: 4,
    borderColor: Colors.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rows: { alignSelf: 'stretch', gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 52,
  },
});
