import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { Glow, pop, Pulse, rise } from '@/components/motion';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { Button, ScreenHeader } from '@/components/ui';
import { Shop, formatPrice } from '@/constants/shop';
import { Colors } from '@/constants/theme';
import { openShopMap, openWhatsApp } from '@/lib/links';
import { useShop } from '@/store/shop-store';
import { OrderSteps, RequestSteps, type Order, type PrivateRequest } from '@/store/types';

const orderLabels = ['Order placed', 'Packed by hand', 'Shipped', 'Delivered'];
const requestLabels = ['Received', 'Shop checking', 'Confirmed', 'Pickup / delivery'];

function expectedBy(order: Order) {
  const maxDays = Number(Shop.shippingDays.split(/\D+/).pop()) || 8;
  return new Date(order.createdAt + maxDays * 86_400_000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function Grow({ share }: { share: number }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.set(withDelay(300, withTiming(share, { duration: 1200, easing: Easing.bezier(0.2, 0.8, 0.2, 1) })));
  }, [share, h]);
  const style = useAnimatedStyle(() => ({ height: `${h.get() * 100}%` }));
  return <Animated.View style={[styles.lineFill, style]} />;
}

function OrderCard({ order, step }: { order: Order; step: number }) {
  const current = OrderSteps.indexOf(order.status);
  const names = order.lines.map((l) => l.name);
  const title = names.length > 2 ? `${names[0]} + ${names.length - 1} more` : names.join(' + ');

  return (
    <Animated.View entering={rise(step)} style={styles.card}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt size={12} color={Colors.muted}>
            Order #{order.id}
          </Txt>
          <Txt weight="bold" numberOfLines={2}>
            {title}
          </Txt>
        </View>
        <View style={[styles.chip, { backgroundColor: Colors.sageSoft }]}>
          <Txt weight="bold" size={12} color={Colors.sage}>
            {order.local ? 'Local delivery' : 'India Post / courier'}
          </Txt>
        </View>
      </View>

      <View style={styles.timeline}>
        <View style={styles.lineTrack}>
          <Grow share={current / (OrderSteps.length - 1)} />
        </View>
        {orderLabels.map((label, i) => {
          const done = i <= current;
          const dot = <View style={[styles.dot, { backgroundColor: done ? Colors.accent : Colors.line }]} />;
          const text = i === 3 && !done && !order.local ? `${label} · expected by ${expectedBy(order)}` : label;
          return (
            <View key={label} style={styles.step}>
              {i === current && i < 3 ? (
                <Pulse color={Colors.accent} size={14}>
                  {dot}
                </Pulse>
              ) : (
                dot
              )}
              <Txt weight={done ? 'bold' : 'regular'} size={14} color={done ? Colors.ink : Colors.muted}>
                {text}
              </Txt>
            </View>
          );
        })}
      </View>

      <View style={styles.cardFoot}>
        <Txt size={13} color={Colors.muted}>
          {order.payment === 'COD' ? 'Cash on delivery' : order.payment}
        </Txt>
        <Txt weight="bold">{formatPrice(order.total)}</Txt>
      </View>
    </Animated.View>
  );
}

function RequestCard({ request, step }: { request: PrivateRequest; step: number }) {
  const current = RequestSteps.indexOf(request.status);
  return (
    <Animated.View entering={rise(step)} style={[styles.card, { backgroundColor: Colors.ink }]}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt size={12} color={Colors.plumMist}>
            Private request #{request.id}
          </Txt>
          <Txt weight="bold" color={Colors.white}>
            {request.category} · size {request.size}
          </Txt>
        </View>
        <View style={[styles.chip, { backgroundColor: Colors.blush }]}>
          <Txt weight="bold" size={12}>
            {request.mode === 'local' ? request.area ?? 'Local' : 'Pickup'}
          </Txt>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <View style={styles.segments}>
          {requestLabels.map((label, i) => {
            const bar = (
              <View style={[styles.segment, { backgroundColor: i <= current ? Colors.blush : 'rgba(255,255,255,0.2)' }]} />
            );
            return (
              <View key={label} style={{ flex: 1 }}>
                {i === current ? <Glow>{bar}</Glow> : bar}
              </View>
            );
          })}
        </View>
        <View style={styles.segments}>
          {requestLabels.map((label, i) => (
            <Txt
              key={label}
              weight={i === current ? 'bold' : 'regular'}
              size={11}
              color={i === current ? Colors.white : Colors.plumMist}
              style={{ flex: 1 }}>
              {label}
            </Txt>
          ))}
        </View>
      </View>

      <Tap onPress={() => openWhatsApp(`Hi Shrungar, I am following up on my private request #${request.id}`)} style={styles.chat}>
        <Icon name="bubble" size={18} />
        <Txt weight="bold" size={14}>
          Chat with the shop
        </Txt>
      </Tap>
    </Animated.View>
  );
}

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { placed } = useLocalSearchParams<{ placed?: string }>();
  const { user, orders, requests } = useShop();

  const items = [
    ...orders.map((o) => ({ kind: 'order' as const, at: o.createdAt, order: o })),
    ...requests.map((r) => ({ kind: 'request' as const, at: r.createdAt, request: r })),
  ].sort((a, b) => b.at - a.at);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>
      <ScreenHeader title="Orders & requests" />

      {placed ? (
        <Animated.View entering={pop(1)} style={styles.placed}>
          <View style={styles.placedIcon}>
            <Icon name="check" size={20} color={Colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt weight="bold" color={Colors.sage}>
              Order placed
            </Txt>
            <Txt size={13} color={Colors.body}>
              Thank you! We will pack it by hand and share updates here.
            </Txt>
          </View>
        </Animated.View>
      ) : null}

      {!user ? (
        <Animated.View entering={rise(1)} style={styles.emptyCard}>
          <Txt size={14} color={Colors.body} style={{ textAlign: 'center', lineHeight: 21 }}>
            Sign in to see your orders and private requests.
          </Txt>
          <Button label="Sign in" tone="dark" height={50} onPress={() => router.push('/sign-in')} />
        </Animated.View>
      ) : items.length === 0 ? (
        <Animated.View entering={rise(1)} style={styles.emptyCard}>
          <Txt display size={20} style={{ textAlign: 'center' }}>
            Nothing here yet
          </Txt>
          <Txt size={14} color={Colors.body} style={{ textAlign: 'center', lineHeight: 21 }}>
            Your orders and private requests will appear here, step by step.
          </Txt>
          <Button label="Browse the shop" height={50} onPress={() => router.navigate('/shop')} />
        </Animated.View>
      ) : (
        items.map((item, i) =>
          item.kind === 'order' ? (
            <OrderCard key={item.order.id} order={item.order} step={Math.min(i + 1, 4)} />
          ) : (
            <RequestCard key={item.request.id} request={item.request} step={Math.min(i + 1, 4)} />
          ),
        )
      )}

      <Animated.View entering={rise(3)}>
        <Tap onPress={openShopMap} style={styles.shop}>
          <Icon name="pin" size={22} color={Colors.accent} />
          <View style={{ flex: 1 }}>
            <Txt weight="bold" size={13}>
              Shrungar shop
            </Txt>
            <Txt size={13} color={Colors.muted} style={{ lineHeight: 19 }}>
              {Shop.address}
              {Shop.hours ? `\n${Shop.hours}` : ''}
            </Txt>
          </View>
          <Txt weight="bold" size={13} color={Colors.accent}>
            Directions
          </Txt>
        </Tap>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.page },
  content: { paddingHorizontal: 20, gap: 18 },
  card: { backgroundColor: Colors.surface, borderRadius: 24, padding: 18, gap: 14 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chip: { borderRadius: 10, paddingVertical: 5, paddingHorizontal: 10 },
  timeline: { gap: 14, paddingLeft: 2 },
  lineTrack: {
    position: 'absolute',
    left: 8,
    top: 10,
    bottom: 10,
    width: 2,
    backgroundColor: Colors.line,
  },
  lineFill: { width: 2, backgroundColor: Colors.accent },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.lineSoft,
  },
  segments: { flexDirection: 'row', gap: 6 },
  segment: { height: 6, borderRadius: 3, alignSelf: 'stretch' },
  chat: {
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.sageSoft,
    borderRadius: 20,
    padding: 14,
  },
  placedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: { backgroundColor: Colors.surface, borderRadius: 24, padding: 22, gap: 12 },
  shop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
  },
});
