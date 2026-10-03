// Design tokens taken from the screen designs in /design.

export const Colors = {
  page: '#FFF7F2',
  surface: '#FFFFFF',
  ink: '#2B1622',
  inkSoft: '#3E2A35',
  body: '#5A4250',
  muted: '#6E5563',
  faint: '#8A7180',
  accent: '#A3214F',
  accentDeep: '#7A1739',
  blush: '#F6C9D6',
  blushSoft: '#FBE3EA',
  plumMist: '#E6D3DC',
  marigold: '#E9A23B',
  marigoldSoft: '#FDEFD8',
  marigoldInk: '#9A5B0C',
  gold: '#FCD9A4',
  sage: '#2E5E4E',
  sageSoft: '#DDEBE5',
  whatsapp: '#1A7F45',
  whatsappMist: '#D6F0E1',
  line: '#EADCE2',
  lineSoft: '#F1E6EA',
  chip: '#F7EEF1',
  dashed: '#C9B3BD',
  barTrack: '#F3E8EC',
  white: '#FFFFFF',
} as const;

export const Fonts = {
  display: 'Marcellus_400Regular',
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
} as const;

export type FontWeight = Exclude<keyof typeof Fonts, 'display'>;

export const Shadows = {
  soft: '0 2px 10px rgba(43,22,34,0.05)',
  card: '0 4px 14px rgba(43,22,34,0.08)',
  bar: '0 10px 30px rgba(43,22,34,0.12)',
  whatsapp: '0 10px 24px rgba(26,127,69,0.35)',
  accent: '0 12px 26px rgba(163,33,79,0.28)',
} as const;

// Floating tab bar geometry, shared so tab screens can pad their content.
export const TabBar = {
  height: 70,
  gap: 14,
} as const;
