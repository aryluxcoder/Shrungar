import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ProductPhoto } from '@/components/product-photo';
import { Tap } from '@/components/tap';
import { Txt } from '@/components/txt';
import { formatPrice } from '@/constants/shop';
import { Colors } from '@/constants/theme';
import type { Product } from '@/data/catalogue';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Tap
      accessibilityLabel={`${product.name}, ${formatPrice(product.price)}`}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      style={styles.card}>
      <ProductPhoto photo={product.photos?.[0]} pattern={product.pattern} style={styles.photo} />
      <Txt weight="semibold" size={14} numberOfLines={2}>
        {product.name}
      </Txt>
      <Txt weight="bold" size={14} color={Colors.accent}>
        {formatPrice(product.price)}
      </Txt>
    </Tap>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 8,
  },
  photo: {
    height: 150,
    borderRadius: 20,
  },
});
