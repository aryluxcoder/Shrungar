import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BagButton } from '@/components/bag-button';
import { Icon } from '@/components/icons';
import { rise } from '@/components/motion';
import { ProductCard } from '@/components/product-card';
import { useTabBarSpace } from '@/components/tab-bar';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { Colors, Fonts, Shadows } from '@/constants/theme';
import { Categories, type CategoryId } from '@/data/catalogue';
import { useShop } from '@/store/shop-store';

type Filter = CategoryId | 'all';

function isCategory(value: string | undefined): value is CategoryId {
  return Categories.some((c) => c.id === value);
}

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  // Home's search box and craft tiles open this tab with ?q= or ?category=.
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const filter: Filter = isCategory(params.category) ? params.category : 'all';
  const [query, setQuery] = useState(params.q ?? '');
  const [lastQ, setLastQ] = useState(params.q);
  if (params.q !== lastQ) {
    setLastQ(params.q);
    setQuery(params.q ?? '');
  }

  const { products, productsReady } = useShop();
  const q = query.trim().toLowerCase();
  const results = products.filter(
    (p) =>
      (filter === 'all' || p.category === filter) &&
      (!q || p.name.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))),
  );
  const rows = Array.from({ length: Math.ceil(results.length / 2) }, (_, i) => results.slice(i * 2, i * 2 + 2));

  const chips: { id: Filter; label: string }[] = [{ id: 'all', label: 'All' }, ...Categories];

  return (
    <ScrollView
      style={styles.screen}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: tabSpace + 28 }]}>
      <Animated.View entering={rise()} style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Txt display size={28} accessibilityRole="header">
            Shop
          </Txt>
          <Txt size={13} color={Colors.muted}>
            Handmade, shipped across India
          </Txt>
        </View>
        <BagButton />
      </Animated.View>

      <Animated.View entering={rise(1)} style={styles.search}>
        <Icon name="search" size={18} color={Colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          placeholder="Search kurtas, mats, bags…"
          placeholderTextColor={Colors.faint}
          accessibilityLabel="Search products"
          style={styles.searchInput}
        />
        {query ? (
          <Tap accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.clear}>
            <Icon name="close" size={16} color={Colors.muted} />
          </Tap>
        ) : null}
      </Animated.View>

      <Animated.View entering={rise(2)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {chips.map((c) => {
            const on = filter === c.id;
            return (
              <Tap
                key={c.id}
                accessibilityState={{ selected: on }}
                onPress={() => router.setParams({ category: c.id })}
                style={[styles.chip, on && { backgroundColor: Colors.ink }]}>
                <Txt weight="bold" size={14} color={on ? Colors.white : Colors.ink}>
                  {c.label}
                </Txt>
              </Tap>
            );
          })}
        </ScrollView>
      </Animated.View>

      {rows.length ? (
        rows.map((row, i) => (
          <Animated.View key={row.map((p) => p.id).join()} entering={rise(3 + Math.min(i, 3))} style={styles.row}>
            {row.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
            {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
          </Animated.View>
        ))
      ) : (
        <View style={styles.empty}>
          <Txt display size={20}>
            {!productsReady ? 'Loading…' : products.length ? 'Nothing found' : 'New pieces coming soon'}
          </Txt>
          {productsReady ? (
            <Txt size={14} color={Colors.muted} style={{ textAlign: 'center' }}>
              {products.length
                ? 'Try another word, or ask us on WhatsApp. We make custom pieces too.'
                : 'Our handmade collection is being added. Ask us on WhatsApp for what is in the shop today.'}
            </Txt>
          ) : null}
        </View>
      )}

      <Animated.View entering={rise(4)}>
        <Tap onPress={() => router.navigate('/request')} style={styles.privateLink}>
          <Icon name="moon" size={22} color={Colors.blush} />
          <Txt size={14} color={Colors.white} style={{ flex: 1 }}>
            Looking for nightwear or lingerie?{' '}
            <Txt weight="bold" size={14} color={Colors.blush}>
              Send a private request
            </Txt>
          </Txt>
          <Icon name="chevron" size={18} color={Colors.white} />
        </Tap>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.page },
  content: { paddingHorizontal: 20, gap: 18 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingLeft: 16,
    paddingRight: 6,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    boxShadow: Shadows.soft,
  },
  searchInput: { flex: 1, height: '100%', fontFamily: Fonts.regular, fontSize: 15, color: Colors.ink },
  clear: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  chips: { gap: 8 },
  chip: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', gap: 12 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 40, paddingHorizontal: 20 },
  privateLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.ink,
  },
});
