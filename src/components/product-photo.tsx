import { Image } from 'expo-image';
import { useId, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

import { Txt } from '@/components/txt';
import type { PhotoPattern } from '@/data/catalogue';

type Props = {
  photo?: string;
  pattern: PhotoPattern;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

// Shows the product photo, or the striped placeholder from the designs until one is added.
export function ProductPhoto({ photo, pattern, label, style }: Props) {
  const id = 'stripes' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const w = pattern.stripe;

  return (
    <View style={[{ overflow: 'hidden', backgroundColor: pattern.a }, style]}>
      {photo ? (
        <Image source={photo} style={{ flex: 1 }} contentFit="cover" transition={200} />
      ) : (
        <>
          <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
            <Defs>
              <Pattern id={id} patternUnits="userSpaceOnUse" width={w * 2} height={w * 2} patternTransform={`rotate(${pattern.angle})`}>
                <Rect x={0} y={0} width={w} height={w * 2} fill={pattern.a} />
                <Rect x={w} y={0} width={w} height={w * 2} fill={pattern.b} />
              </Pattern>
            </Defs>
            <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
          </Svg>
          {label ? (
            <Txt size={11} color={pattern.ink} style={{ position: 'absolute', left: 10, bottom: 10 }}>
              {label}
            </Txt>
          ) : null}
        </>
      )}
    </View>
  );
}

// Full-width swipeable photos with page dots (product page).
export function PhotoGallery({ photos, pattern, height }: { photos: string[]; pattern: PhotoPattern; height: number }) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);

  if (photos.length <= 1) return <ProductPhoto photo={photos[0]} pattern={pattern} style={{ height }} />;

  return (
    <View style={{ height }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}>
        {photos.map((uri) => (
          <Image key={uri} source={uri} style={{ width, height }} contentFit="cover" transition={200} />
        ))}
      </ScrollView>
      <View style={styles.dots} pointerEvents="none">
        {photos.map((uri, i) => (
          <View key={uri} style={[styles.dot, i === page && styles.dotOn]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { position: 'absolute', bottom: 54, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.6)' },
  dotOn: { width: 18, backgroundColor: '#FFFFFF' },
});
