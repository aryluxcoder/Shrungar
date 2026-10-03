// Line icons copied from the screen designs (24 × 24 grid).

import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const star = 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z';
const whatsapp = 'M4 20l1.3-3.9A8 8 0 1 1 8 19z';
const truck = 'M3 7h11v9H3zM14 10h4l3 3v3h-7z';

const shapes = {
  back: { sw: 2.2, draw: () => <Path d="M15 6l-6 6 6 6" /> },
  chevron: { sw: 2, draw: () => <Path d="M9 6l6 6-6 6" /> },
  arrow: { sw: 2.2, draw: () => <Path d="M5 12h14M13 6l6 6-6 6" /> },
  external: { sw: 2, draw: () => <Path d="M7 17L17 7M9 7h8v8" /> },
  check: { sw: 2.4, draw: () => <Path d="M5 12l5 5 9-10" /> },
  close: { sw: 2, draw: () => <Path d="M6 6l12 12M18 6L6 18" /> },
  pin: {
    sw: 1.8,
    draw: () => (
      <>
        <Path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
        <Circle cx="12" cy="10" r="2.5" />
      </>
    ),
  },
  user: {
    sw: 1.8,
    draw: () => (
      <>
        <Circle cx="12" cy="8.5" r="3.8" />
        <Path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </>
    ),
  },
  bag: {
    sw: 1.8,
    draw: () => (
      <>
        <Path d="M5 8h14l-1.2 12H6.2z" />
        <Path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),
  },
  search: {
    sw: 2,
    draw: () => (
      <>
        <Circle cx="11" cy="11" r="7" />
        <Path d="M20 20l-3.5-3.5" />
      </>
    ),
  },
  home: { sw: 2, draw: () => <Path d="M4 10l8-6 8 6v10H4z" /> },
  shop: {
    sw: 1.8,
    draw: () => (
      <>
        <Path d="M4 10l8-6 8 6v10H4z" />
        <Path d="M10 20v-6h4v6" />
      </>
    ),
  },
  grid: {
    sw: 1.8,
    draw: () => (
      <>
        <Rect x="4" y="4" width="7" height="7" rx="2" />
        <Rect x="13" y="4" width="7" height="7" rx="2" />
        <Rect x="4" y="13" width="7" height="7" rx="2" />
        <Rect x="13" y="13" width="7" height="7" rx="2" />
      </>
    ),
  },
  moon: { sw: 1.8, draw: () => <Path d="M20 15.5A8 8 0 1 1 8.5 4a6.5 6.5 0 0 0 11.5 11.5z" /> },
  chat: { sw: 1.8, draw: () => <Path d="M4 5h16v11H9l-5 4z" /> },
  whatsapp: {
    sw: 1.8,
    draw: () => (
      <>
        <Path d={whatsapp} />
        <Path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.6-2-1-1 1c-1-.5-1.9-1.4-2.4-2.4l1-1-1-2z" />
      </>
    ),
  },
  bubble: { sw: 1.8, draw: () => <Path d={whatsapp} /> },
  heart: { sw: 2, draw: () => <Path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /> },
  star: { sw: 1.8, draw: () => <Path d={star} /> },
  truck: {
    sw: 1.8,
    draw: () => (
      <>
        <Path d={truck} />
        <Circle cx="7" cy="17.5" r="1.8" />
        <Circle cx="17" cy="17.5" r="1.8" />
      </>
    ),
  },
  phone: {
    sw: 1.8,
    draw: () => <Path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  },
  camera: {
    sw: 1.8,
    draw: () => (
      <>
        <Rect x="3" y="5" width="18" height="14" rx="3" />
        <Circle cx="12" cy="12" r="3.5" />
      </>
    ),
  },
  send: { sw: 2, draw: () => <Path d="M4 12l16-8-6 16-2.5-6.5z" /> },
  lock: {
    sw: 2,
    draw: () => (
      <>
        <Rect x="5" y="11" width="14" height="9" rx="2" />
        <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </>
    ),
  },
  clothes: { sw: 1.6, draw: () => <Path d="M8 3l4 2 4-2 4 4-3 3v11H7V10L4 7z" /> },
  mats: {
    sw: 1.6,
    draw: () => (
      <>
        <Rect x="3" y="6" width="18" height="12" rx="2" />
        <Path d="M3 10h18M3 14h18M7 6v12M12 6v12M17 6v12" />
      </>
    ),
  },
  bags: {
    sw: 1.6,
    draw: () => (
      <>
        <Path d="M4 9h16l-1.5 11h-13z" />
        <Path d="M8 9a4 4 0 0 1 8 0" />
      </>
    ),
  },
} satisfies Record<string, { sw: number; draw: () => ReactNode }>;

export type IconName = keyof typeof shapes;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 22, color = '#2B1622', fill = 'none', strokeWidth }: IconProps) {
  const shape = shapes[name];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth ?? shape.sw}
      strokeLinecap="round"
      strokeLinejoin="round">
      {shape.draw()}
    </Svg>
  );
}

export function GoogleLogo({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4" />
      <Path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853" />
      <Path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2z" fill="#FBBC05" />
      <Path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" fill="#EA4335" />
    </Svg>
  );
}

export function Stars({ rating, size = 16, color = '#E9A23B' }: { rating: number; size?: number; color?: string }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={size} color={color} fill={n <= Math.round(rating) ? color : 'none'} strokeWidth={2} />
      ))}
    </>
  );
}
