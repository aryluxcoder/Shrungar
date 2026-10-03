import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { rise } from '@/components/motion';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { ScreenHeader } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { getProduct } from '@/data/catalogue';
import { formatDate } from '@/lib/format';
import { useShop } from '@/store/shop-store';

export default function MyReviewsScreen() {
  const insets = useSafeAreaInsets();
  const { myReviews } = useShop();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>
      <ScreenHeader title="My reviews" />
      {myReviews.length === 0 ? (
        <Animated.View entering={rise(1)} style={styles.card}>
          <Txt size={14} color={Colors.body} style={{ textAlign: 'center', lineHeight: 21 }}>
            You have not reviewed anything yet. Open a product and tap its stars to share how you liked it.
          </Txt>
        </Animated.View>
      ) : (
        myReviews.map((r, i) => (
          <Animated.View key={r.id} entering={rise(Math.min(i + 1, 4))}>
            <Tap
              onPress={() => router.push({ pathname: '/product/[id]/reviews', params: { id: r.productId } })}
              style={styles.card}>
              <View style={styles.head}>
                <Txt weight="bold" style={{ flex: 1 }} numberOfLines={1}>
                  {getProduct(r.productId)?.name ?? 'Product'}
                </Txt>
                <Txt weight="bold" size={13} color={Colors.marigoldInk}>
                  ★ {r.rating}
                </Txt>
                <Icon name="chevron" size={16} color={Colors.muted} />
              </View>
              <Txt size={14} color={Colors.inkSoft} numberOfLines={3} style={{ lineHeight: 20 }}>
                {r.text}
              </Txt>
              <Txt size={12} color={Colors.muted}>
                {formatDate(r.createdAt)}
                {r.comments.length ? ` · ${r.comments.length} comments` : ''}
              </Txt>
            </Tap>
          </Animated.View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.page },
  content: { paddingHorizontal: 20, gap: 14 },
  card: { backgroundColor: Colors.surface, borderRadius: 22, padding: 16, gap: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
