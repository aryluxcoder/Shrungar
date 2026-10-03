import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/txt';
import { ScreenHeader } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useShop } from '@/store/shop-store';

// Shows the screen only to the shop team (or only the owner). Firestore rules enforce the same.
export function AdminOnly({ owner, children }: { owner?: boolean; children: ReactNode }) {
  const { isAdmin, role } = useShop();
  const insets = useSafeAreaInsets();
  if (owner ? role === 'owner' : isAdmin) return children;
  return (
    <View style={[styles.locked, { paddingTop: insets.top + 16 }]}>
      <ScreenHeader title="Shop admin" />
      <Txt size={15} color={Colors.body} style={{ lineHeight: 22 }}>
        {owner ? 'Only the shop owner can manage the team.' : 'This area is for the Shrungar shop team.'}
      </Txt>
    </View>
  );
}

const tones = {
  sage: { bg: Colors.sageSoft, fg: Colors.sage },
  marigold: { bg: Colors.marigoldSoft, fg: Colors.marigoldInk },
  rani: { bg: Colors.blushSoft, fg: Colors.accent },
  grey: { bg: Colors.chip, fg: Colors.muted },
};

export function StatusChip({ label, tone }: { label: string; tone: keyof typeof tones }) {
  return (
    <View style={[styles.chip, { backgroundColor: tones[tone].bg }]}>
      <Txt weight="bold" size={12} color={tones[tone].fg}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  locked: { flex: 1, backgroundColor: Colors.page, paddingHorizontal: 20, gap: 18 },
  chip: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 9, alignSelf: 'flex-start' },
});
