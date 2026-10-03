import { Image } from 'expo-image';
import { useId } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
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
