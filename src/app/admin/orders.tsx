import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdminOnly, StatusChip } from '@/components/admin';
import { Icon } from '@/components/icons';
import { rise } from '@/components/motion';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { Button, ScreenHeader, TextLink } from '@/components/ui';
import { formatPrice } from '@/constants/shop';
import { Colors } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import { openWhatsAppTo } from '@/lib/links';
import { useShop } from '@/store/shop-store';
import { OrderSteps, type Order, type OrderStatus } from '@/store/types';

const labels: Record<OrderStatus, string> = { placed: 'New', packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered' };
const nextAction: Record<OrderStatus, string> = {
  placed: 'Mark packed',
  packed: 'Mark shipped',
  shipped: 'Mark delivered',
  delivered: '',
};
const tone = (status: OrderStatus) => (status === 'placed' ? 'rani' : status === 'delivered' ? 'sage' : 'marigold');

type Filter = 'open' | 'done' | 'all';
const filters: { id: Filter; label: string }[] = [
  { id: 'open', label: 'To do' },
  { id: 'done', label: 'Delivered' },
  { id: 'all', label: 'All' },
];

function OrderCard({ order, step }: { order: Order; step: number }) {
  const { admin } = useShop();
  const at = OrderSteps.indexOf(order.status);
  const a = order.address;
  const where = [a.line1, a.line2, a.area, a.city, a.state, a.pincode].filter(Boolean).join(', ');

  return (
    <Animated.View entering={rise(step)} style={styles.card}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Txt weight="bold">#{order.id}</Txt>
          <Txt size={12} color={Colors.muted}>
            {formatDate(order.createdAt)} · {order.local ? 'Local delivery' : 'Courier'}
          </Txt>
        </View>
        <StatusChip label={labels[order.status]} tone={tone(order.status)} />
      </View>

      <View style={{ gap: 2 }}>
        <Txt weight="semibold" size={14}>
          {a.name} · +91 {a.phone}
        </Txt>
        <Txt size={13} color={Colors.body} style={{ lineHeight: 19 }}>
          {where}
        </Txt>
      </View>

      <View style={styles.lines}>
        {order.lines.map((l) => (
          <View key={l.key} style={styles.line}>
            <Txt size={13} style={{ flex: 1 }}>
              {l.name}
              {l.colour ? `, ${l.colour}` : ''}
              {l.size ? `, size ${l.size}` : ''} × {l.qty}
            </Txt>
            <Txt size={13}>{formatPrice(l.price * l.qty)}</Txt>
          </View>
        ))}
        <View style={styles.line}>
          <Txt weight="bold" size={14} style={{ flex: 1 }}>
            Total · {order.payment === 'COD' ? 'cash on delivery' : order.payment}
          </Txt>
          <Txt weight="bold" size={14}>
            {formatPrice(order.total)}
          </Txt>
        </View>
      </View>

      <View style={styles.actions}>
        {nextAction[order.status] ? (
          <Button
            label={nextAction[order.status]}
            tone="dark"
            height={44}
            style={{ flex: 1 }}
            onPress={() => admin.setOrderStatus(order.id, OrderSteps[at + 1])}
          />
        ) : null}
        <Tap
          accessibilityLabel="WhatsApp the customer"
          onPress={() => openWhatsAppTo(a.phone, `Namaste ${a.name}, this is Shrungar about your order ${order.id}.`)}
          style={styles.whatsapp}>
          <Icon name="whatsapp" size={20} color={Colors.white} />
        </Tap>
      </View>
      {at > 0 ? (
        <TextLink
          label={`Undo: back to ${labels[OrderSteps[at - 1]].toLowerCase()}`}
          color={Colors.muted}
          onPress={() => admin.setOrderStatus(order.id, OrderSteps[at - 1])}
        />
      ) : null}
    </Animated.View>
  );
}

function OrdersList() {
  const insets = useSafeAreaInsets();
  const { admin } = useShop();
  const [filter, setFilter] = useState<Filter>('open');

  const shown = admin.orders.filter((o) =>
    filter === 'all' ? true : filter === 'done' ? o.status === 'delivered' : o.status !== 'delivered',
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>
      <ScreenHeader title="Orders" subtitle={`${admin.orders.length} in total`} />
      <View style={styles.filters}>
        {filters.map((f) => (
          <Tap
            key={f.id}
            accessibilityState={{ selected: f.id === filter }}
            onPress={() => setFilter(f.id)}
            style={[styles.filter, f.id === filter && { backgroundColor: Colors.ink }]}>
            <Txt weight="bold" size={13} color={f.id === filter ? Colors.white : Colors.ink}>
              {f.label}
            </Txt>
          </Tap>
        ))}
      </View>
      {shown.length ? (
        shown.map((o, i) => <OrderCard key={o.id} order={o} step={Math.min(i + 1, 4)} />)
      ) : (
        <View style={styles.card}>
          <Txt size={14} color={Colors.body} style={{ textAlign: 'center' }}>
            {filter === 'open' ? 'All caught up. New orders appear here.' : 'Nothing here yet.'}
          </Txt>
        </View>
      )}
    </ScrollView>
  );
}

export default function AdminOrdersScreen() {
  return (
    <AdminOnly>
      <OrdersList />
    </AdminOnly>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.page },
  content: { paddingHorizontal: 20, gap: 14 },
  filters: { flexDirection: 'row', gap: 8 },
  filter: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
  },
  card: { backgroundColor: Colors.surface, borderRadius: 22, padding: 16, gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lines: { gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.lineSoft },
  line: { flexDirection: 'row', gap: 10 },
  actions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  whatsapp: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.whatsapp,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
