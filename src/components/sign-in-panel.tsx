import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { GoogleLogo } from '@/components/icons';
import { Mandala, rise } from '@/components/motion';
import { Txt } from '@/components/txt';
import { Button, Field, TextLink } from '@/components/ui';
import { Colors, Fonts, Shadows } from '@/constants/theme';
import { useShop } from '@/store/shop-store';

export function BrandHeader({ topInset, height = 330 }: { topInset: number; height?: number }) {
  return (
    <View style={[styles.brand, { height: height + topInset, paddingTop: topInset }]}>
      <Mandala size={300} color="rgba(255,255,255,0.2)" style={{ top: topInset + height / 2 - 150, alignSelf: 'center' }} />
      <Animated.View entering={rise(1)}>
        <Txt display size={44} color={Colors.white} style={{ lineHeight: 52 }}>
          Shrungar
        </Txt>
      </Animated.View>
      <Animated.View entering={rise(2)}>
        <Txt weight="bold" size={14} color={Colors.gold} style={styles.tagline}>
          Handmade · Made for you
        </Txt>
      </Animated.View>
    </View>
  );
}

// Google or phone OTP sign-in. Demo build: no real Google or SMS calls are made yet.
export function SignInPanel({ onDone, onSkip, skipLabel }: { onDone?: () => void; onSkip: () => void; skipLabel: string }) {
  const { signInWithGoogle, sendOtp, verifyOtp } = useShop();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'start' | 'otp'>('start');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const digits = phone.replace(/\D/g, '');

  const google = () => {
    signInWithGoogle();
    onDone?.();
  };

  const requestOtp = async () => {
    if (!(await sendOtp(digits))) return setError('Enter your 10-digit mobile number');
    setError('');
    setStep('otp');
  };

  const verify = async () => {
    if (!name.trim()) return setError('Tell us your name');
    if (!(await verifyOtp(digits, code, name))) return setError('Enter the 6-digit code');
    onDone?.();
  };

  if (step === 'otp') {
    return (
      <View style={styles.body}>
        <Animated.View entering={rise()} style={{ gap: 6 }}>
          <Txt display size={26}>
            Enter the code
          </Txt>
          <Txt size={14} color={Colors.body} style={{ lineHeight: 21 }}>
            We sent a 6-digit code to +91 {digits}.
          </Txt>
        </Animated.View>
        <Animated.View entering={rise(1)} style={{ gap: 12 }}>
          <TextInput
            value={code}
            onChangeText={(t) => {
              setCode(t.replace(/\D/g, ''));
              setError('');
            }}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="••••••"
            placeholderTextColor={Colors.line}
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            accessibilityLabel="One-time code"
            style={styles.code}
          />
          <Field value={name} onChangeText={setName} placeholder="Your name" autoComplete="name" accessibilityLabel="Your name" />
          {error ? (
            <Txt weight="semibold" size={13} color={Colors.accent}>
              {error}
            </Txt>
          ) : null}
          <Button label="Verify & continue" tone="dark" onPress={verify} />
          <Txt size={12} color={Colors.faint} style={{ textAlign: 'center' }}>
            Demo mode: any 6 digits will work.
          </Txt>
          <TextLink label="Change number" onPress={() => setStep('start')} />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.body}>
      <Animated.View entering={rise(2)} style={{ gap: 6 }}>
        <Txt display size={26}>
          Welcome
        </Txt>
        <Txt size={14} color={Colors.body} style={{ lineHeight: 21 }}>
          Sign in to save your bag, track orders, write reviews and send private requests.
        </Txt>
      </Animated.View>

      <Animated.View entering={rise(3)}>
        <Button label="Continue with Google" tone="outline" height={56} icon={<GoogleLogo />} onPress={google} style={{ boxShadow: Shadows.card }} />
      </Animated.View>

      <Animated.View entering={rise(4)} style={styles.divider}>
        <View style={styles.rule} />
        <Txt size={12} color={Colors.faint}>
          or use your phone
        </Txt>
        <View style={styles.rule} />
      </Animated.View>

      <Animated.View entering={rise(4)} style={styles.phone}>
        <Txt weight="bold" color={Colors.body}>
          +91
        </Txt>
        <TextInput
          value={phone}
          onChangeText={(t) => {
            setPhone(t);
            setError('');
          }}
          keyboardType="phone-pad"
          maxLength={10}
          autoComplete="tel-national"
          placeholder="Mobile number"
          placeholderTextColor={Colors.faint}
          accessibilityLabel="Mobile number"
          style={styles.phoneInput}
        />
      </Animated.View>
      {error ? (
        <Txt weight="semibold" size={13} color={Colors.accent}>
          {error}
        </Txt>
      ) : null}
      <Animated.View entering={rise(5)}>
        <Button label="Send OTP" tone="dark" onPress={requestOtp} />
      </Animated.View>

      <Animated.View entering={rise(5)}>
        <TextLink label={skipLabel} onPress={onSkip} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: {
    backgroundColor: Colors.accent,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  tagline: { letterSpacing: 1.4, textTransform: 'uppercase' },
  body: { paddingHorizontal: 22, paddingVertical: 28, gap: 14 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rule: { flex: 1, height: 1, backgroundColor: Colors.line },
  phone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 54,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    boxShadow: Shadows.soft,
  },
  phoneInput: { flex: 1, height: '100%', fontFamily: Fonts.regular, fontSize: 16, color: Colors.ink },
  code: {
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    textAlign: 'center',
    fontFamily: Fonts.bold,
    fontSize: 28,
    letterSpacing: 10,
    color: Colors.ink,
    boxShadow: Shadows.soft,
  },
});
