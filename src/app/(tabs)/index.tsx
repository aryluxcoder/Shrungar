import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BagButton, IconButton } from '@/components/bag-button';
import { Icon } from '@/components/icons';
import { Mandala, pop, rise, Sway } from '@/components/motion';
import { ProductCard } from '@/components/product-card';
import { useTabBarSpace } from '@/components/tab-bar';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { Colors, Fonts, Shadows } from '@/constants/theme';
import { Categories, Products } from '@/data/catalogue';
import { openWhatsApp } from '@/lib/links';
import { useShop } from '@/store/shop-store';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const { pincode } = useShop();
  const [query, setQuery] = useState('');

  const fresh = Products.slice(0, 4);

  const search = () => {
    router.navigate({ pathname: '/shop', params: { q: query.trim() } });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: tabSpace + 96 }]}>
        <Animated.View entering={rise()} style={styles.topRow}>
          <View style={{ gap: 2, flex: 1 }}>
            <Txt display size={30} color={Colors.accent} style={{ letterSpacing: 0.5 }} accessibilityRole="header">
              Shrungar
            </Txt>
            <Tap onPress={() => router.push('/bag')} style={styles.location} accessibilityLabel="Set delivery pincode">
              <Icon name="pin" size={14} color={Colors.muted} strokeWidth={2} />
              <Txt size={13} color={Colors.muted}>
                {pincode ? `Delivering to ${pincode}` : 'Set your delivery pincode'}
              </Txt>
            </Tap>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <IconButton icon="user" label="Your account" onPress={() => router.navigate('/me')} />
            <BagButton />
          </View>
        </Animated.View>

        <Animated.View entering={rise(1)} style={styles.search}>
          <Icon name="search" size={18} color={Colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            returnKeyType="search"
            placeholder="Search kurtas, mats, bags…"
            placeholderTextColor={Colors.faint}
            accessibilityLabel="Search products"
            style={styles.searchInput}
          />
        </Animated.View>

        <Animated.View entering={rise(2)} style={styles.hero}>
          <Mandala size={230} style={{ right: -60, top: -40 }} />
          <View style={{ gap: 8, maxWidth: 230 }}>
            <Txt weight="bold" size={12} color={Colors.gold} style={styles.eyebrow}>
              Handmade · Pan-India
            </Txt>
            <Txt display size={30} color={Colors.white} style={{ lineHeight: 34 }}>
              Made by hand, delivered to your door
            </Txt>
          </View>
          <Tap onPress={() => router.navigate('/shop')} style={styles.heroButton}>
            <Txt weight="bold" size={15}>
              Shop handcrafted
            </Txt>
            <Icon name="arrow" size={16} />
          </Tap>
        </Animated.View>

        <View style={{ gap: 12 }}>
          <Animated.View entering={rise(3)} style={styles.sectionHead}>
            <Txt display size={21}>
              Shop by craft
            </Txt>
            <Tap onPress={() => router.navigate('/shop')} style={styles.seeAll}>
              <Txt weight="semibold" size={13} color={Colors.accent}>
                See all
              </Txt>
            </Tap>
          </Animated.View>
          <View style={styles.crafts}>
            {Categories.map((c, i) => (
              <Animated.View key={c.id} entering={pop(3 + i)} style={{ flex: 1 }}>
                <Tap
                  onPress={() => router.navigate({ pathname: '/shop', params: { category: c.id } })}
                  style={styles.craft}>
                  <View style={[styles.craftIcon, { backgroundColor: c.tint }]}>
                    <Icon name={c.id} size={26} color={c.ink} />
                  </View>
                  <Txt weight="semibold" size={13} style={{ textAlign: 'center' }}>
                    {c.label}
                  </Txt>
                </Tap>
              </Animated.View>
            ))}
          </View>
        </View>

        <Animated.View entering={rise(4)}>
          <Tap onPress={() => router.navigate('/request')} style={styles.private}>
            <Sway>
              <View style={styles.moon}>
                <Icon name="moon" size={28} color={Colors.accentDeep} strokeWidth={1.6} />
              </View>
            </Sway>
            <View style={{ flex: 1, gap: 4 }}>
              <Txt weight="bold" size={12} color={Colors.blush} style={styles.eyebrow}>
                Private · On request
              </Txt>
              <Txt display size={20} color={Colors.white}>
                Nightwear & lingerie
              </Txt>
              <Txt size={13} color={Colors.plumMist} style={{ lineHeight: 18 }}>
                Tell us your size and style. We confirm from our shop, then you pick up or we deliver nearby.
              </Txt>
            </View>
            <Icon name="chevron" size={20} color={Colors.white} />
          </Tap>
        </Animated.View>

        <Animated.View entering={rise(5)} style={styles.twoUp}>
          <View style={styles.info}>
            <Icon name="truck" size={24} color={Colors.sage} />
            <Txt weight="bold" size={14}>
              All-India shipping
            </Txt>
            <Txt size={12} color={Colors.muted} style={{ lineHeight: 17 }}>
              Handcrafted clothes, mats and bags
            </Txt>
          </View>
          <View style={styles.info}>
            <Icon name="shop" size={24} color={Colors.accent} />
            <Txt weight="bold" size={14}>
              Near our shop
            </Txt>
            <Txt size={12} color={Colors.muted} style={{ lineHeight: 17 }}>
              Local home delivery in New Panvel & nearby
            </Txt>
          </View>
        </Animated.View>

        <View style={{ gap: 12 }}>
          <Animated.View entering={rise(5)}>
            <Txt display size={21}>
              Fresh from the loom
            </Txt>
          </Animated.View>
          {[0, 2].map((start) => (
            <Animated.View key={start} entering={rise(6)} style={styles.twoUp}>
              {fresh.slice(start, start + 2).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <Animated.View entering={pop(6)} style={[styles.whatsapp, { bottom: tabSpace + 16 }]}>
        <Tap onPress={() => openWhatsApp('Hi Shrungar')} accessibilityLabel="Chat with Shrungar on WhatsApp" style={styles.whatsappButton}>
          <Icon name="whatsapp" size={24} color={Colors.white} />
          <Txt weight="bold" size={14} color={Colors.white}>
            WhatsApp us
          </Txt>
        </Tap>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.page },
  content: { paddingHorizontal: 20, gap: 22 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  location: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 2 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    boxShadow: Shadows.soft,
  },
  searchInput: { flex: 1, height: '100%', fontFamily: Fonts.regular, fontSize: 15, color: Colors.ink },
  hero: {
    borderRadius: 28,
    backgroundColor: Colors.accent,
    paddingVertical: 26,
    paddingHorizontal: 22,
    minHeight: 210,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  eyebrow: { letterSpacing: 1.5, textTransform: 'uppercase' },
  heroButton: {
    alignSelf: 'flex-start',
    marginTop: 18,
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 23,
    backgroundColor: Colors.marigold,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { minHeight: 44, justifyContent: 'center', paddingLeft: 12 },
  crafts: { flexDirection: 'row', gap: 10 },
  craft: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    boxShadow: Shadows.soft,
  },
  craftIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  private: {
    borderRadius: 24,
    backgroundColor: Colors.ink,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  moon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  twoUp: { flexDirection: 'row', gap: 12 },
  info: { flex: 1, backgroundColor: Colors.surface, borderRadius: 20, padding: 16, gap: 6 },
  whatsapp: { position: 'absolute', right: 20 },
  whatsappButton: {
    height: 54,
    paddingLeft: 14,
    paddingRight: 18,
    borderRadius: 27,
    backgroundColor: Colors.whatsapp,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    boxShadow: Shadows.whatsapp,
  },
});
