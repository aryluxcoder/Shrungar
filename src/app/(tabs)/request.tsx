import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { pop, Pulse, rise } from '@/components/motion';
import { useTabBarSpace } from '@/components/tab-bar';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { Button, Field, Label, TextLink } from '@/components/ui';
import { Shop, localAreasLabel } from '@/constants/shop';
import { Colors, Fonts } from '@/constants/theme';
import { useShop } from '@/store/shop-store';
import type { ReceiveMode, RequestCategory } from '@/store/types';

const categories: RequestCategory[] = ['Nightwear', 'Lingerie'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const modes: { id: ReceiveMode; label: string; sub: string }[] = [
  { id: 'pickup', label: 'Pick up at our shop', sub: `${Shop.shortAddress} · try before you buy` },
  { id: 'local', label: 'Local home delivery', sub: `${localAreasLabel} only · discreet packing` },
];

export default function RequestScreen() {
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const focused = useIsFocused();
  const { user, sendRequest } = useShop();

  const [category, setCategory] = useState<RequestCategory>('Nightwear');
  const [size, setSize] = useState('M');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState<ReceiveMode>('pickup');
  const [area, setArea] = useState<string>();
  const [whatsapp, setWhatsapp] = useState(user?.phone?.replace(/^\+91/, '') ?? '');
  const [error, setError] = useState('');
  const [sentSummary, setSentSummary] = useState('');

  const submit = () => {
    const digits = whatsapp.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (mode === 'local' && !area) return setError('Choose your area for home delivery');
    if (digits.length !== 10) return setError('Enter your 10-digit WhatsApp number');
    if (!user) return router.push('/sign-in');
    sendRequest({ category, size, notes: notes.trim(), mode, area: mode === 'local' ? area : undefined, whatsapp: digits });
    setError('');
    setSentSummary(`${category.toLowerCase()} in size ${size}`);
  };

  const reset = () => {
    setNotes('');
    setSentSummary('');
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      {focused ? <StatusBar style="light" /> : null}
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[styles.top, { paddingTop: insets.top + 16 }]}>
          <View style={styles.badge}>
            <Icon name="lock" size={14} color={Colors.blush} />
            <Txt weight="bold" size={12} color={Colors.blush}>
              Private & discreet
            </Txt>
          </View>
          <Animated.View entering={rise()}>
            <Txt display size={30} color={Colors.white} style={{ lineHeight: 34 }} accessibilityRole="header">
              Request nightwear & lingerie
            </Txt>
          </Animated.View>
          <Animated.View entering={rise(1)}>
            <Txt size={14} color={Colors.plumMist} style={{ lineHeight: 21 }}>
              Share what you are looking for. Our shop team checks stock and replies on WhatsApp or a call. Nothing is
              charged until you confirm.
            </Txt>
          </Animated.View>
        </View>

        <View style={[styles.sheet, { paddingBottom: tabSpace + 28 }]}>
          {sentSummary ? (
            <View style={styles.sent}>
              <Animated.View entering={pop()}>
                <Pulse color={Colors.blush} size={96}>
                  <View style={styles.sentBadge}>
                    <Icon name="check" size={44} color={Colors.accentDeep} />
                  </View>
                </Pulse>
              </Animated.View>
              <Animated.View entering={rise(1)}>
                <Txt display size={26}>
                  Request sent
                </Txt>
              </Animated.View>
              <Animated.View entering={rise(2)}>
                <Txt size={14} color={Colors.body} style={styles.sentText}>
                  We will message you on WhatsApp {Shop.hours ? `(${Shop.hours})` : 'during shop hours'} with photos and
                  price for your {sentSummary}.
                </Txt>
              </Animated.View>
              <Animated.View entering={rise(3)} style={{ alignSelf: 'stretch', gap: 4, marginTop: 8 }}>
                <Button label="Track my request" tone="dark" height={52} onPress={() => router.push('/orders')} />
                <TextLink label="Make another request" onPress={reset} />
              </Animated.View>
            </View>
          ) : (
            <View style={{ gap: 18 }}>
              <Animated.View entering={rise(1)} style={{ gap: 10 }}>
                <Label>I am looking for</Label>
                <View style={styles.twoUp}>
                  {categories.map((c) => {
                    const on = c === category;
                    return (
                      <Tap
                        key={c}
                        accessibilityState={{ selected: on }}
                        onPress={() => setCategory(c)}
                        style={[styles.category, on && { backgroundColor: Colors.ink, borderColor: Colors.ink }]}>
                        <Txt weight="bold" size={15} color={on ? Colors.white : Colors.ink}>
                          {c}
                        </Txt>
                      </Tap>
                    );
                  })}
                </View>
              </Animated.View>

              <Animated.View entering={rise(2)} style={{ gap: 10 }}>
                <Label>Size</Label>
                <View style={styles.sizes}>
                  {sizes.map((s) => {
                    const on = s === size;
                    return (
                      <Tap
                        key={s}
                        accessibilityState={{ selected: on }}
                        onPress={() => setSize(s)}
                        style={[styles.size, on && { backgroundColor: Colors.accent }]}>
                        <Txt weight="bold" size={14} color={on ? Colors.white : Colors.ink}>
                          {s}
                        </Txt>
                      </Tap>
                    );
                  })}
                </View>
              </Animated.View>

              <Animated.View entering={rise(3)} style={{ gap: 8 }}>
                <Label>Style, fabric or colour you prefer</Label>
                <Field
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="e.g. cotton night suit, pastel, full sleeves"
                  accessibilityLabel="Style, fabric or colour you prefer"
                />
              </Animated.View>

              <Animated.View entering={rise(4)} style={{ gap: 10 }}>
                <Label>How would you like to receive it?</Label>
                {modes.map((m) => {
                  const on = m.id === mode;
                  return (
                    <Tap
                      key={m.id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: on }}
                      onPress={() => {
                        setMode(m.id);
                        setError('');
                      }}
                      style={[styles.mode, { borderColor: on ? Colors.accent : Colors.line }]}>
                      <View style={[styles.radio, { borderColor: on ? Colors.accent : Colors.line }]}>
                        {on ? <View style={styles.radioDot} /> : null}
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Txt weight="bold" size={15}>
                          {m.label}
                        </Txt>
                        <Txt size={12} color={Colors.muted}>
                          {m.sub}
                        </Txt>
                      </View>
                    </Tap>
                  );
                })}
                {mode === 'local' ? (
                  <Animated.View entering={FadeIn.duration(250)} style={{ gap: 8 }}>
                    <Txt weight="semibold" size={13} color={Colors.body}>
                      Your area
                    </Txt>
                    <View style={styles.areas}>
                      {Shop.localAreas.map((a) => {
                        const on = a === area;
                        return (
                          <Tap
                            key={a}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: on }}
                            onPress={() => {
                              setArea(a);
                              setError('');
                            }}
                            style={[styles.area, on && { backgroundColor: Colors.ink }]}>
                            <Txt weight="bold" size={14} color={on ? Colors.white : Colors.ink}>
                              {a}
                            </Txt>
                          </Tap>
                        );
                      })}
                    </View>
                  </Animated.View>
                ) : null}
              </Animated.View>

              <Animated.View entering={rise(5)} style={{ gap: 8 }}>
                <Label>WhatsApp number</Label>
                <View style={styles.phone}>
                  <Txt weight="bold" color={Colors.body}>
                    +91
                  </Txt>
                  <Field
                    value={whatsapp}
                    onChangeText={(t) => {
                      setWhatsapp(t);
                      setError('');
                    }}
                    keyboardType="phone-pad"
                    maxLength={14}
                    placeholder="Mobile number"
                    accessibilityLabel="WhatsApp number"
                    style={styles.phoneInput}
                  />
                </View>
              </Animated.View>

              <Animated.View entering={rise(5)} style={{ gap: 8 }}>
                {error ? (
                  <Txt weight="semibold" size={13} color={Colors.accent} style={{ textAlign: 'center' }}>
                    {error}
                  </Txt>
                ) : null}
                <Button label={user ? 'Send request to shop' : 'Sign in & send request'} height={56} onPress={submit} />
              </Animated.View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ink },
  top: { paddingHorizontal: 20, paddingBottom: 34, gap: 16 },
  badge: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(246,201,214,0.12)',
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  sheet: {
    flexGrow: 1,
    backgroundColor: Colors.page,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  twoUp: { flexDirection: 'row', gap: 10 },
  category: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.line,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  size: {
    minWidth: 48,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: Colors.surface,
  },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  areas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  area: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent },
  phone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    paddingLeft: 14,
    boxShadow: '0 2px 10px rgba(43,22,34,0.05)',
  },
  phoneInput: { flex: 1, height: 50, paddingHorizontal: 0, boxShadow: 'none', backgroundColor: 'transparent', fontFamily: Fonts.regular },
  sent: { alignItems: 'center', gap: 16, paddingTop: 40 },
  sentBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentText: { textAlign: 'center', lineHeight: 22, maxWidth: 290 },
});
