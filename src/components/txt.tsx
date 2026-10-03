import { Text, type TextProps } from 'react-native';

import { Colors, Fonts, type FontWeight } from '@/constants/theme';

type Props = TextProps & {
  weight?: FontWeight;
  display?: boolean;
  size?: number;
  color?: string;
};

// Custom fonts need one family per weight (fontWeight is ignored on Android),
// so weight picks the family instead.
export function Txt({ weight = 'regular', display, size = 14, color = Colors.ink, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[{ fontFamily: display ? Fonts.display : Fonts[weight], fontSize: size, color }, style]}
    />
  );
}
