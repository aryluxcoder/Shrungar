import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdminOnly } from '@/components/admin';
import { Icon, type IconName } from '@/components/icons';
import { rise } from '@/components/motion';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { Button, ScreenHeader } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useShop } from '@/store/shop-store';

function Tile({ icon, title, value, note, href }: { icon: IconName; title: string; value: number; note: string; href: Href }) {
  return (
    <Tap onPress={() => router.push(href)} style={styles.tile}>
      <Icon name={icon} size={24} color={Colors.accent} />
      <Txt display size={30} style={{ lineHeight: 34 }}>
        {value}
      </Txt>
      <Txt weight="bold" size={14}>
        {title}
      </Txt>
      <Txt size={12} color={Colors.muted}>
        {note}
      </Txt>
    </Tap>
  );
}

function Dashboard() {
  const insets = useSafeAreaInsets();
  const { demo, user, role, admin } = useShop();

  const hidden = admin.products.filter((p) => p.status === 'hidden').length;
  const newOrders = admin.orders.filter((o) => o.status === 'placed').length;
  const newRequests = admin.requests.filter((r) => r.status === 'received').length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>
      <ScreenHeader title="Shop admin" subtitle={`${role === 'owner' ? 'Owner' : 'Admin'} · ${user?.name ?? ''}`} />

      <Animated.View entering={rise(1)}>
        <Button
          label="Add a product"
          icon={<Icon name="camera" size={20} color={Colors.white} />}
          onPress={() => router.push({ pathname: '/admin/product/[id]', params: { id: 'new' } })}
        />
      </Animated.View>

      <Animated.View entering={rise(2)} style={styles.grid}>
        <View style={styles.row}>
          <Tile
            icon="grid"
            title="Products"
            value={admin.products.length}
            note={hidden ? `${hidden} hidden` : 'All in the shop'}
            href="/admin/products"
          />
          <Tile icon="bag" title="Orders" value={newOrders} note={`new of ${admin.orders.length}`} href="/admin/orders" />
        </View>
        <View style={styles.row}>
          <Tile
            icon="moon"
            title="Private requests"
            value={newRequests}
            note={`new of ${admin.requests.length}`}
            href="/admin/requests"
          />
          {role === 'owner' ? (
            <Tile icon="user" title="Team" value={admin.staff.length} note="Owner and admins" href="/admin/team" />
          ) : (
            <View style={{ flex: 1 }} />
          )}
        </View>
      </Animated.View>

      <Animated.View entering={rise(3)}>
        <Txt size={13} color={Colors.muted} style={{ lineHeight: 19 }}>
          {demo
            ? 'Demo mode: changes stay on this device. In the real app they reach every shopper instantly.'
            : 'Changes reach every shopper instantly. Help chat and review replies are answered in the Firebase console for now.'}
        </Txt>
      </Animated.View>
    </ScrollView>
  );
}

export default function AdminScreen() {
  return (
    <AdminOnly>
      <Dashboard />
    </AdminOnly>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.page },
  content: { paddingHorizontal: 20, gap: 18 },
  grid: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, backgroundColor: Colors.surface, borderRadius: 22, padding: 16, gap: 4 },
});
