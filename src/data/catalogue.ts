// SAMPLE catalogue used until products are loaded from Firebase.
// Names follow the designs; prices, sizes and descriptions are placeholders to replace.

export type CategoryId = 'clothes' | 'mats' | 'bags';

export type Category = {
  id: CategoryId;
  label: string;
  tint: string;
  ink: string;
};

export const Categories: Category[] = [
  { id: 'clothes', label: 'Handmade clothes', tint: '#FBE3EA', ink: '#A3214F' },
  { id: 'mats', label: 'Crafted mats', tint: '#FDEFD8', ink: '#9A5B0C' },
  { id: 'bags', label: 'Bags', tint: '#DDEBE5', ink: '#2E5E4E' },
];

export type Swatch = { name: string; hex: string };

// Striped placeholder shown until a product has a real photo.
export type PhotoPattern = { a: string; b: string; angle: number; stripe: number; ink: string };

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  detail: string;
  tags: string[];
  description: string;
  colours?: Swatch[];
  sizes?: string[];
  photo?: string;
  pattern: PhotoPattern;
};

const blush: PhotoPattern = { a: '#F6D7C3', b: '#F1C8B0', angle: 45, stripe: 10, ink: '#6E5563' };
const sage: PhotoPattern = { a: '#D9E7E0', b: '#C7DBD1', angle: 90, stripe: 12, ink: '#4A5F56' };
const marigold: PhotoPattern = { a: '#FBE7C6', b: '#F6D9A8', angle: 135, stripe: 10, ink: '#7A5A2A' };
const rose: PhotoPattern = { a: '#F7DCE4', b: '#F0C9D5', angle: 90, stripe: 9, ink: '#7A4A5C' };

export const Products: Product[] = [
  {
    id: 'block-print-kurta',
    name: 'Block-print cotton kurta',
    category: 'clothes',
    price: 1290,
    detail: 'Cotton · straight fit',
    tags: ['Hand block-printed', 'Ships across India'],
    description:
      'Printed by hand with carved wooden blocks on soft cotton. Each piece varies a little, that is the mark of the hand. Gentle hand wash, dry in shade.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    pattern: blush,
  },
  {
    id: 'woven-floor-mat',
    name: 'Hand-woven cotton floor mat',
    category: 'mats',
    price: 890,
    detail: '2 × 3 ft',
    tags: ['Handwoven', 'Ships across India'],
    description:
      'Woven by hand on a pit loom from cotton yarn. Each piece varies a little, that is the mark of the hand. Shake out and spot clean.',
    colours: [
      { name: 'Sage', hex: '#9DBFAE' },
      { name: 'Indigo', hex: '#3E4C7A' },
      { name: 'Marigold', hex: '#E9A23B' },
      { name: 'Rani', hex: '#A3214F' },
    ],
    pattern: sage,
  },
  {
    id: 'embroidered-tote',
    name: 'Embroidered jute tote',
    category: 'bags',
    price: 650,
    detail: '14 × 16 in',
    tags: ['Hand-embroidered', 'Ships across India'],
    description:
      'Sturdy jute tote finished with hand embroidery and a cotton lining. Roomy enough for daily shopping. Spot clean only.',
    colours: [
      { name: 'Natural', hex: '#D8C3A0' },
      { name: 'Rani', hex: '#A3214F' },
    ],
    pattern: marigold,
  },
  {
    id: 'mul-cotton-dupatta',
    name: 'Mul cotton dupatta',
    category: 'clothes',
    price: 590,
    detail: '2.25 m',
    tags: ['Hand-dyed', 'Ships across India'],
    description:
      'Feather-light mul cotton, dyed by hand in small batches. Colours may shift slightly between pieces. Cold hand wash separately.',
    colours: [
      { name: 'Rose', hex: '#E7A5B8' },
      { name: 'Indigo', hex: '#3E4C7A' },
      { name: 'Haldi', hex: '#E9A23B' },
    ],
    pattern: rose,
  },
  {
    id: 'yoga-mat',
    name: 'Handloom cotton yoga mat',
    category: 'mats',
    price: 1150,
    detail: '2 × 6 ft',
    tags: ['Handwoven', 'Ships across India'],
    description:
      'Dense, flat-woven cotton that grips well and rolls up small. Woven on a handloom. Machine wash gentle, dry flat.',
    colours: [
      { name: 'Sage', hex: '#9DBFAE' },
      { name: 'Clay', hex: '#B4441C' },
    ],
    pattern: { ...sage, angle: 45 },
  },
  {
    id: 'potli-bag',
    name: 'Silk potli bag',
    category: 'bags',
    price: 450,
    detail: '8 × 9 in',
    tags: ['Handmade', 'Ships across India'],
    description:
      'A drawstring potli in festive silk with hand-stitched trims. Perfect for weddings and gifting. Dry clean only.',
    colours: [
      { name: 'Rani', hex: '#A3214F' },
      { name: 'Marigold', hex: '#E9A23B' },
      { name: 'Teal', hex: '#2E5E4E' },
    ],
    pattern: { ...rose, angle: 45 },
  },
];

export function getProduct(id: string | undefined) {
  return Products.find((p) => p.id === id);
}

export function getCategory(id: CategoryId) {
  return Categories.find((c) => c.id === id)!;
}
