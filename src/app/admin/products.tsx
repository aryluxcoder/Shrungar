import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdminOnly, StatusChip } from '@/components/admin';
import { Icon } from '@/components/icons';
import { rise } from '@/components/motion';
import { ProductPhoto } from '@/components/product-photo';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { Button, ScreenHeader } from '@/components/ui';
import { formatPrice } from '@/constants/shop';
import { Colors } from '@/constants/theme';
import { getCategory } from '@/data/catalogue';
import { useShop } from '@/store/shop-store';

function ProductList() {
  const insets = useSafeAreaInsets();
  const { admin } = useShop();

  const addNew = () => router.push({ pathname: '/admin/product/[id]', params: { id: 'new' } });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>
      <ScreenHeader title="Products" subtitle={`${admin.products.length} in the catalogue`} />

      <Animated.View entering={rise(1)}>
        <Button label="Add a product" height={50} onPress={addNew} />
      </Animated.View>

      {admin.products.length === 0 ? (
        <Animated.View entering={rise(2)} style={styles.empty}>
          <Txt size={14} color={Colors.body} style={{ textAlign: 'center', lineHeight: 21 }}>
            No products yet. Add your first piece with a few photos, a price and a short description.
          </Txt>
        </Animated.View>
      ) : (
        admin.products.map((p, i) => (
          <Animated.View key={p.id} entering={rise(Math.min(i + 2, 5))}>
            <Tap
              onPress={() => router.push({ pathname: '/admin/product/[id]', params: { id: p.id } })}
              style={styles.row}>
              <ProductPhoto photo={p.photos?.[0]} pattern={p.pattern} style={styles.thumb} />
              <View style={{ flex: 1, gap: 4 }}>
                <Txt weight="bold" size={14} numberOfLines={1}>
                  {p.name}
                </Txt>
                <Txt size={12} color={Colors.muted}>
                  {formatPrice(p.price)} · {getCategory(p.category).label}
                </Txt>
                <StatusChip
                  label={p.status === 'hidden' ? 'Hidden' : 'In the shop'}
                  tone={p.status === 'hidden' ? 'grey' : 'sage'}
                />
              </View>
              <Icon name="chevron" size={18} color={Colors.muted} />
            </Tap>
          </Animated.View>
        ))
      )}
    </ScrollView>
  );
}

export default function AdminProductsScreen() {
  return (
    <AdminOnly>
      <ProductList />
    </AdminOnly>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.page },
  content: { paddingHorizontal: 20, gap: 12 },
  empty: { backgroundColor: Colors.surface, borderRadius: 22, padding: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 12,
  },
  thumb: { width: 64, height: 64, borderRadius: 14 },
});
