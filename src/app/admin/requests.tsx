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
import { Colors } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import { openWhatsAppTo } from '@/lib/links';
import { useShop } from '@/store/shop-store';
import { RequestSteps, type PrivateRequest, type RequestStatus } from '@/store/types';

const labels: Record<RequestStatus, string> = { received: 'New', checking: 'Checking', confirmed: 'Confirmed', ready: 'Ready' };
const tone = (status: RequestStatus) => (status === 'received' ? 'rani' : status === 'ready' ? 'sage' : 'marigold');

function nextAction(request: PrivateRequest) {
  if (request.status === 'received') return 'Start checking stock';
  if (request.status === 'checking') return 'Mark confirmed';
  if (request.status === 'confirmed') return request.mode === 'local' ? 'Mark out for delivery' : 'Mark ready for pickup';
  return '';
}

type Filter = 'open' | 'done' | 'all';
const filters: { id: Filter; label: string }[] = [
  { id: 'open', label: 'To do' },
  { id: 'done', label: 'Ready' },
  { id: 'all', label: 'All' },
];

function RequestCard({ request, step }: { request: PrivateRequest; step: number }) {
  const { admin } = useShop();
  const at = RequestSteps.indexOf(request.status);
  const action = nextAction(request);

  return (
    <Animated.View entering={rise(step)} style={styles.card}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Txt weight="bold">
            {request.category} · size {request.size}
          </Txt>
          <Txt size={12} color={Colors.muted}>
            #{request.id} · {formatDate(request.createdAt)}
          </Txt>
        </View>
        <StatusChip label={labels[request.status]} tone={tone(request.status)} />
      </View>

      <View style={{ gap: 4 }}>
        <Txt size={13} color={Colors.body}>
          {request.mode === 'local' ? `Home delivery in ${request.area ?? 'local area'}` : 'Pickup at the shop'} · WhatsApp
          +91 {request.whatsapp}
        </Txt>
        {request.notes ? (
          <Txt size={14} style={{ lineHeight: 20 }}>
            “{request.notes}”
          </Txt>
        ) : null}
      </View>

      <View style={styles.actions}>
        {action ? (
          <Button
            label={action}
            tone="dark"
            height={44}
            style={{ flex: 1 }}
            onPress={() => admin.setRequestStatus(request.id, RequestSteps[at + 1])}
          />
        ) : null}
        <Tap
          accessibilityLabel="WhatsApp the customer"
          onPress={() =>
            openWhatsAppTo(
              request.whatsapp,
              `Namaste, this is Shrungar about your private request ${request.id} (${request.category.toLowerCase()}, size ${request.size}).`,
            )
          }
          style={styles.whatsapp}>
          <Icon name="whatsapp" size={20} color={Colors.white} />
        </Tap>
      </View>
      {at > 0 ? (
        <TextLink
          label={`Undo: back to ${labels[RequestSteps[at - 1]].toLowerCase()}`}
          color={Colors.muted}
          onPress={() => admin.setRequestStatus(request.id, RequestSteps[at - 1])}
        />
      ) : null}
    </Animated.View>
  );
}

function RequestsList() {
  const insets = useSafeAreaInsets();
  const { admin } = useShop();
  const [filter, setFilter] = useState<Filter>('open');

  const shown = admin.requests.filter((r) =>
    filter === 'all' ? true : filter === 'done' ? r.status === 'ready' : r.status !== 'ready',
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>
      <ScreenHeader title="Private requests" subtitle="Nightwear & lingerie" />
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
        shown.map((r, i) => <RequestCard key={r.id} request={r} step={Math.min(i + 1, 4)} />)
      ) : (
        <View style={styles.card}>
          <Txt size={14} color={Colors.body} style={{ textAlign: 'center' }}>
            {filter === 'open' ? 'All caught up. New requests appear here.' : 'Nothing here yet.'}
          </Txt>
        </View>
      )}
    </ScrollView>
  );
}

export default function AdminRequestsScreen() {
  return (
    <AdminOnly>
      <RequestsList />
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
