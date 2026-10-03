import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdminOnly, StatusChip } from '@/components/admin';
import { rise } from '@/components/motion';
import { Txt } from '@/components/txt';
import { Button, Field, Label, ScreenHeader, TextLink } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { initial } from '@/lib/format';
import { confirmAction } from '@/lib/links';
import { useShop } from '@/store/shop-store';
import type { StaffMember } from '@/store/types';

function Member({ member, onRemove }: { member: StaffMember; onRemove?: () => void }) {
  return (
    <View style={styles.member}>
      <View style={styles.avatar}>
        <Txt weight="bold">{initial(member.name || member.email)}</Txt>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt weight="bold" size={14}>
          {member.name || member.email}
        </Txt>
        <Txt size={12} color={Colors.muted} numberOfLines={1}>
          {member.email}
        </Txt>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <StatusChip label={member.role === 'owner' ? 'Owner' : 'Admin'} tone={member.role === 'owner' ? 'rani' : 'sage'} />
        {onRemove ? <TextLink label="Remove" color={Colors.muted} onPress={onRemove} /> : null}
      </View>
    </View>
  );
}

function Team() {
  const insets = useSafeAreaInsets();
  const { admin } = useShop();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const add = async () => {
    const address = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return setMessage('Enter their Google (Gmail) address');
    if (admin.staff.some((m) => m.email === address)) return setMessage('They are already on the team');
    setBusy(true);
    try {
      await admin.addStaff({ email: address, name: name.trim(), role: 'admin' });
      setName('');
      setEmail('');
      setMessage(`Added. They can now sign in with ${address} and open Shop admin.`);
    } catch {
      setMessage('Could not add them. Check your internet connection and try again.');
    }
    setBusy(false);
  };

  const remove = async (member: StaffMember) => {
    const sure = await confirmAction(
      `Remove ${member.name || member.email}?`,
      'They will no longer be able to edit products or orders.',
      'Remove',
    );
    if (sure) admin.removeStaff(member.email).catch(() => setMessage('Could not remove them. Please try again.'));
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>
        <ScreenHeader title="Team" subtitle="People who can manage the shop" />

        <Animated.View entering={rise(1)} style={styles.card}>
          {admin.staff
            .filter((m) => m.role !== 'seller')
            .map((m) => (
              <Member key={m.email} member={m} onRemove={m.role === 'owner' ? undefined : () => remove(m)} />
            ))}
        </Animated.View>

        <Animated.View entering={rise(2)} style={[styles.card, { gap: 12 }]}>
          <Label>Add an admin</Label>
          <Txt size={13} color={Colors.body} style={{ lineHeight: 19 }}>
            Admins can add and edit products, and update orders and private requests. They sign in to the app with
            this Google account.
          </Txt>
          <Field value={name} onChangeText={setName} placeholder="Name" accessibilityLabel="Name" style={styles.field} />
          <Field
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setMessage('');
            }}
            placeholder="Gmail address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Gmail address"
            style={styles.field}
          />
          {message ? (
            <Txt weight="semibold" size={13} color={message.startsWith('Added') ? Colors.sage : Colors.accent}>
              {message}
            </Txt>
          ) : null}
          <Button label={busy ? 'Adding…' : 'Add admin'} tone="dark" height={50} disabled={busy} onPress={add} />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function AdminTeamScreen() {
  return (
    <AdminOnly owner>
      <Team />
    </AdminOnly>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.page },
  content: { paddingHorizontal: 20, gap: 16 },
  card: { backgroundColor: Colors.surface, borderRadius: 22, padding: 16, gap: 14 },
  member: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: { backgroundColor: Colors.page, boxShadow: 'none' },
});
