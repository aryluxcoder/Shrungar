import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { rise, slideIn } from '@/components/motion';
import { ProductPhoto } from '@/components/product-photo';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { Button, Field, Label, ScreenHeader } from '@/components/ui';
import { Shop, formatPrice, isLocalPincode } from '@/constants/shop';
import { Colors, Shadows } from '@/constants/theme';
import { deliveryFor, useShop } from '@/store/shop-store';
import type { Address, PaymentMethod } from '@/store/types';

const payments: PaymentMethod[] = ['UPI', 'Card', 'COD'];

const addressFields: { key: Exclude<keyof Address, 'pincode'>; placeholder: string; numeric?: boolean }[] = [
  { key: 'name', placeholder: 'Full name' },
  { key: 'phone', placeholder: 'Mobile number', numeric: true },
  { key: 'line1', placeholder: 'House / flat, building, street' },
  { key: 'line2', placeholder: 'Area, landmark (optional)' },
  { key: 'city', placeholder: 'City' },
  { key: 'state', placeholder: 'State' },
];

export default function BagScreen() {
  const insets = useSafeAreaInsets();
  const { user, bag, subtotal, setQty, pincode: savedPin, setPincode, address: savedAddress, placeOrder } = useShop();

  const [pin, setPin] = useState(savedPin);
  const [checkedPin, setCheckedPin] = useState(savedPin);
  const [payment, setPayment] = useState<PaymentMethod>('UPI');
  const [address, setAddress] = useState<Omit<Address, 'pincode'>>({
    name: savedAddress?.name ?? user?.name ?? '',
    phone: savedAddress?.phone ?? user?.phone?.replace(/^\+91/, '') ?? '',
    line1: savedAddress?.line1 ?? '',
    line2: savedAddress?.line2 ?? '',
    city: savedAddress?.city ?? '',
    state: savedAddress?.state ?? '',
  });
  const [error, setError] = useState('');

  const local = checkedPin ? isLocalPincode(checkedPin) : false;
  const delivery = checkedPin ? deliveryFor(subtotal, local) : null;

  const check = () => {
    const clean = pin.replace(/\D/g, '');
    if (clean.length !== 6) return setError('Enter a 6-digit pincode');
    setError('');
    setPin(clean);
    setCheckedPin(clean);
    setPincode(clean);
  };

  const order = () => {
    if (!checkedPin) return setError('Check your pincode first');
    if (!address.name.trim() || !address.line1.trim() || !address.city.trim() || !address.state.trim())
      return setError('Please fill in your delivery address');
    if (address.phone.replace(/\D/g, '').length !== 10) return setError('Enter a 10-digit mobile number');
    if (!user) return router.push('/sign-in');
    const id = placeOrder(payment, { ...address, pincode: checkedPin });
    if (id) router.replace({ pathname: '/orders', params: { placed: id } });
  };

  if (bag.length === 0) {
    return (
      <View style={[styles.screen, styles.content, { paddingTop: insets.top + 16 }]}>
        <ScreenHeader title="Your bag" />
        <Animated.View entering={rise(1)} style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Icon name="bag" size={34} color={Colors.accent} />
          </View>
          <Txt display size={22}>
            Your bag is empty
          </Txt>
          <Txt size={14} color={Colors.muted} style={{ textAlign: 'center', lineHeight: 21 }}>
            Handmade clothes, mats and bags, shipped across India.
          </Txt>
          <Button label="Browse the shop" onPress={() => router.navigate('/shop')} style={{ alignSelf: 'stretch', marginTop: 8 }} />
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 24 }]}>
        <ScreenHeader title="Your bag" />

        <Animated.View entering={rise(1)} style={{ gap: 10 }}>
          <View style={styles.shipsRow}>
            <Icon name="truck" size={18} color={Colors.sage} strokeWidth={2} />
            <Txt weight="bold" size={13} color={Colors.sage}>
              Ships across India
            </Txt>
          </View>
          {bag.map((line, i) => (
            <Animated.View key={line.key} entering={slideIn(i + 1)} style={styles.item}>
              <Tap
                accessibilityLabel={line.product.name}
                onPress={() => router.push({ pathname: '/product/[id]', params: { id: line.productId } })}>
                <ProductPhoto photo={line.product.photo} pattern={{ ...line.product.pattern, stripe: 8 }} style={styles.thumb} />
              </Tap>
              <View style={{ flex: 1, gap: 4 }}>
                <Txt weight="bold" size={14} numberOfLines={2}>
                  {line.product.name}
                </Txt>
                <Txt size={12} color={Colors.muted}>
                  {[line.colour, line.size && `Size ${line.size}`].filter(Boolean).join(' · ') || line.product.detail}
                </Txt>
                <Txt weight="bold" color={Colors.accent}>
                  {formatPrice(line.product.price * line.qty)}
                </Txt>
              </View>
              <View style={styles.qty}>
                <Tap
                  accessibilityLabel={line.qty === 1 ? 'Remove from bag' : 'Decrease quantity'}
                  onPress={() => setQty(line.key, line.qty - 1)}
                  style={styles.qtyButton}>
                  {line.qty === 1 ? <Icon name="close" size={14} color={Colors.muted} /> : <Txt size={18}>−</Txt>}
                </Tap>
                <Txt weight="bold" size={14}>
                  {line.qty}
                </Txt>
                <Tap accessibilityLabel="Increase quantity" onPress={() => setQty(line.key, line.qty + 1)} style={styles.qtyButton}>
                  <Txt size={18}>+</Txt>
                </Tap>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View entering={rise(2)} style={{ gap: 10 }}>
          <Label>Deliver to</Label>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Field
              value={pin}
              onChangeText={(t) => {
                setPin(t);
                setError('');
              }}
              onSubmitEditing={check}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="Pincode"
              accessibilityLabel="Pincode"
              style={{ flex: 1, boxShadow: 'none' }}
            />
            <Button label="Check" tone="dark" height={50} onPress={check} style={{ borderRadius: 16, paddingHorizontal: 18 }} />
          </View>
          {checkedPin ? (
            <Animated.View key={checkedPin} entering={FadeIn.duration(300)} style={styles.checkCard}>
              <View style={styles.checkLine}>
                <Txt weight="bold" color={Colors.sage}>
                  ✓
                </Txt>
                <Txt size={13} style={{ flex: 1, lineHeight: 19 }}>
                  Handcrafted items: delivered to {checkedPin} in {Shop.shippingDays} days
                </Txt>
              </View>
              <View style={styles.checkLine}>
                <Txt weight="bold" color={local ? Colors.sage : Colors.faint}>
                  {local ? '✓' : '–'}
                </Txt>
                <Txt size={13} style={{ flex: 1, lineHeight: 19 }}>
                  {local
                    ? 'You are near our shop: local home delivery and nightwear/lingerie requests available'
                    : 'Outside our local area: nightwear and lingerie are available for shop pickup only'}
                </Txt>
              </View>
            </Animated.View>
          ) : null}
        </Animated.View>

        {checkedPin ? (
          <Animated.View entering={rise()} style={{ gap: 10 }}>
            <Label>Delivery address</Label>
            {addressFields.map((f) => (
              <Field
                key={f.key}
                value={address[f.key]}
                onChangeText={(t) => {
                  setAddress({ ...address, [f.key]: t });
                  setError('');
                }}
                placeholder={f.placeholder}
                accessibilityLabel={f.placeholder}
                keyboardType={f.numeric ? 'phone-pad' : 'default'}
                maxLength={f.numeric ? 10 : undefined}
                style={{ boxShadow: 'none' }}
              />
            ))}
          </Animated.View>
        ) : null}

        <Animated.View entering={rise(3)} style={{ gap: 10 }}>
          <Label>Pay with</Label>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {payments.map((p) => {
              const on = p === payment;
              return (
                <Tap
                  key={p}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  onPress={() => setPayment(p)}
                  style={[styles.pay, { borderColor: on ? Colors.accent : Colors.line }]}>
                  <Txt weight="bold" size={14}>
                    {p}
                  </Txt>
                </Tap>
              );
            })}
          </View>
          <Txt size={12} color={Colors.faint}>
            Demo build: no payment is taken yet.
          </Txt>
        </Animated.View>

        <Animated.View entering={rise(4)} style={styles.summary}>
          <View style={styles.sumRow}>
            <Txt color={Colors.muted}>Items</Txt>
            <Txt>{formatPrice(subtotal)}</Txt>
          </View>
          <View style={styles.sumRow}>
            <Txt color={Colors.muted}>Delivery</Txt>
            <Txt>{delivery === null ? 'Check pincode' : delivery === 0 ? 'Free' : formatPrice(delivery)}</Txt>
          </View>
          {!local && subtotal < Shop.freeShippingAbove ? (
            <Txt size={12} color={Colors.sage}>
              Add {formatPrice(Shop.freeShippingAbove - subtotal)} more for free delivery
            </Txt>
          ) : null}
          <View style={styles.rule} />
          <View style={styles.sumRow}>
            <Txt weight="bold" size={16}>
              Total
            </Txt>
            <Txt weight="bold" size={16}>
              {formatPrice(subtotal + (delivery ?? 0))}
            </Txt>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={rise(5)} style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {error ? (
          <Txt weight="semibold" size={13} color={Colors.accent} style={{ textAlign: 'center' }}>
            {error}
          </Txt>
        ) : null}
        <Button
          label={user ? 'Place order' : 'Sign in & place order'}
          height={58}
          onPress={order}
          style={{ boxShadow: Shadows.accent }}
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.page },
  content: { paddingHorizontal: 20, gap: 18 },
  shipsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 12,
  },
  thumb: { width: 72, height: 72, borderRadius: 14 },
  qty: { alignItems: 'center', gap: 2 },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 14, gap: 6 },
  checkLine: { flexDirection: 'row', gap: 8 },
  pay: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: { backgroundColor: Colors.surface, borderRadius: 20, padding: 16, gap: 8 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  rule: { height: 1, backgroundColor: Colors.lineSoft },
  footer: { paddingHorizontal: 20, paddingTop: 10, gap: 8 },
  empty: { alignItems: 'center', gap: 10, paddingTop: 60, paddingHorizontal: 10 },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.blushSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
});
