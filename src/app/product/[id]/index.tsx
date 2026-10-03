import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Stars } from '@/components/icons';
import { pop, rise } from '@/components/motion';
import { ProductPhoto } from '@/components/product-photo';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { BackButton, Button } from '@/components/ui';
import { Shop, formatPrice } from '@/constants/shop';
import { Colors } from '@/constants/theme';
import { getProduct } from '@/data/catalogue';
import { useShop } from '@/store/shop-store';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(id);
  const insets = useSafeAreaInsets();
  const { addToBag, wishlist, toggleWishlist, reviewsFor } = useShop();

  const [colour, setColour] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [needSize, setNeedSize] = useState(false);

  if (!product) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + 20 }]}>
        <BackButton />
        <Txt display size={24}>
          This piece is no longer available
        </Txt>
        <Button label="Browse the shop" onPress={() => router.navigate('/shop')} />
      </View>
    );
  }

  const reviews = reviewsFor(product.id);
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const comments = reviews.reduce((n, r) => n + r.comments.length, 0);
  const saved = wishlist.includes(product.id);
  const swatch = product.colours?.[colour];

  // Any change after adding turns the button back into "Add to bag".
  const change = (fn: () => void) => {
    fn();
    setAdded(false);
  };

  const add = () => {
    if (product.sizes && !size) {
      setNeedSize(true);
      return;
    }
    addToBag(product.id, qty, { colour: swatch?.name, size: size ?? undefined });
    setAdded(true);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Animated.View entering={FadeIn.duration(900)}>
          <ProductPhoto
            photo={product.photo}
            pattern={product.pattern}
            style={{ height: 400 + insets.top }}
            label={product.photo ? undefined : '[Product photo · swipe for more]'}
          />
        </Animated.View>

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Animated.View entering={rise(1)} style={{ gap: 6 }}>
            <View style={styles.tags}>
              {product.tags.map((tag, i) => (
                <View key={tag} style={[styles.tag, { backgroundColor: i === 0 ? Colors.sageSoft : Colors.marigoldSoft }]}>
                  <Txt weight="bold" size={12} color={i === 0 ? Colors.sage : '#6B3F07'}>
                    {tag}
                  </Txt>
                </View>
              ))}
            </View>
            <Txt display size={26} style={{ lineHeight: 30 }} accessibilityRole="header">
              {product.name}
            </Txt>
            <View style={styles.priceRow}>
              <Txt weight="bold" size={22} color={Colors.accent}>
                {formatPrice(product.price)}
              </Txt>
              <Txt size={13} color={Colors.muted}>
                {product.detail}
              </Txt>
            </View>
          </Animated.View>

          {product.colours ? (
            <Animated.View entering={rise(2)} style={{ gap: 10 }}>
              <Txt weight="bold" size={14}>
                Colour ·{' '}
                <Txt weight="medium" size={14} color={Colors.muted}>
                  {swatch?.name}
                </Txt>
              </Txt>
              <View style={styles.swatches}>
                {product.colours.map((c, i) => (
                  <Tap
                    key={c.name}
                    accessibilityLabel={c.name}
                    accessibilityState={{ selected: i === colour }}
                    onPress={() => change(() => setColour(i))}
                    style={[
                      styles.swatch,
                      { backgroundColor: c.hex },
                      i === colour && { boxShadow: `0 0 0 3px #FFFFFF, 0 0 0 5px ${Colors.ink}` },
                    ]}
                  />
                ))}
              </View>
            </Animated.View>
          ) : null}

          {product.sizes ? (
            <Animated.View entering={rise(2)} style={{ gap: 10 }}>
              <Txt weight="bold" size={14}>
                Size{' '}
                {needSize && !size ? (
                  <Txt weight="semibold" size={13} color={Colors.accent}>
                    · Please pick a size
                  </Txt>
                ) : null}
              </Txt>
              <View style={styles.sizes}>
                {product.sizes.map((s) => {
                  const on = s === size;
                  return (
                    <Tap
                      key={s}
                      accessibilityState={{ selected: on }}
                      onPress={() => change(() => setSize(s))}
                      style={[styles.size, on && { backgroundColor: Colors.accent }]}>
                      <Txt weight="bold" size={14} color={on ? Colors.white : Colors.ink}>
                        {s}
                      </Txt>
                    </Tap>
                  );
                })}
              </View>
            </Animated.View>
          ) : null}

          <Animated.View entering={rise(2)}>
            <Tap
              onPress={() => router.push({ pathname: '/product/[id]/reviews', params: { id: product.id } })}
              style={styles.reviewsLink}>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                <Stars rating={average} />
              </View>
              {reviews.length ? (
                <>
                  <Txt weight="bold" size={14}>
                    {average.toFixed(1)}
                  </Txt>
                  <Txt size={13} color={Colors.muted} style={{ flex: 1 }}>
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} · {comments}{' '}
                    {comments === 1 ? 'comment' : 'comments'}
                  </Txt>
                </>
              ) : (
                <Txt size={13} color={Colors.muted} style={{ flex: 1 }}>
                  No reviews yet · Be the first
                </Txt>
              )}
              <Icon name="chevron" size={18} color={Colors.muted} />
            </Tap>
          </Animated.View>

          <Animated.View entering={rise(3)}>
            <Txt size={14} color={Colors.body} style={{ lineHeight: 22 }}>
              {product.description}
            </Txt>
          </Animated.View>

          <Animated.View entering={rise(3)} style={styles.delivery}>
            <Icon name="truck" size={22} color={Colors.accent} />
            <View style={{ flex: 1 }}>
              <Txt weight="bold" size={13}>
                Delivered anywhere in India
              </Txt>
              <Txt size={13} color={Colors.muted} style={{ lineHeight: 18 }}>
                Estimated {Shop.shippingDays} days · free above {formatPrice(Shop.freeShippingAbove)}
              </Txt>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      <View style={[styles.topButtons, { top: insets.top + 12 }]}>
        <BackButton />
        <Tap
          accessibilityLabel={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          onPress={() => toggleWishlist(product.id)}
          style={styles.roundButton}>
          <Icon name="heart" size={20} color={Colors.accent} fill={saved ? Colors.accent : 'none'} />
        </Tap>
      </View>

      <Animated.View entering={rise(4)} style={[styles.buyBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.stepper}>
          <Tap accessibilityLabel="Decrease quantity" onPress={() => change(() => setQty(Math.max(1, qty - 1)))} style={styles.stepButton}>
            <Txt size={22}>−</Txt>
          </Tap>
          <Txt weight="bold" size={16} style={{ minWidth: 22, textAlign: 'center' }}>
            {qty}
          </Txt>
          <Tap accessibilityLabel="Increase quantity" onPress={() => change(() => setQty(qty + 1))} style={styles.stepButton}>
            <Txt size={22}>+</Txt>
          </Tap>
        </View>
        {added ? (
          <Animated.View entering={pop()} style={{ flex: 1 }}>
            <Button
              label="Added · View bag"
              tone="dark"
              height={52}
              style={{ backgroundColor: Colors.sage }}
              icon={<Icon name="check" size={18} color={Colors.white} />}
              onPress={() => router.push('/bag')}
            />
          </Animated.View>
        ) : (
          <Button label="Add to bag" height={52} style={{ flex: 1 }} onPress={add} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.surface },
  missing: { flex: 1, backgroundColor: Colors.page, padding: 20, gap: 20 },
  sheet: {
    marginTop: -40,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 14,
    gap: 16,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E8DAE0', alignSelf: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { borderRadius: 10, paddingVertical: 5, paddingHorizontal: 10 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  swatches: { flexDirection: 'row', gap: 12, paddingLeft: 4 },
  swatch: { width: 44, height: 44, borderRadius: 22 },
  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  size: {
    minWidth: 48,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: Colors.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.page,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  delivery: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.page,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  topButtons: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  roundButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 14,
    paddingHorizontal: 22,
    borderTopWidth: 1,
    borderTopColor: Colors.lineSoft,
    backgroundColor: Colors.surface,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.page, borderRadius: 26, height: 52 },
  stepButton: { width: 44, height: 52, alignItems: 'center', justifyContent: 'center' },
});
