// Shop details shown across the app.
// Fields marked TODO are still unknown. The app hides or softens anything left empty.

export const Shop = {
  name: 'Shrungar',
  address:
    'Shop No. 20, Plot No. 52, Sector 9, Khanda Colony (West), New Panvel East, Panvel, Maharashtra 410206',
  shortAddress: 'Shop 20, Sector 9, New Panvel',
  mapsUrl: 'https://maps.app.goo.gl/LLK6xsNwBBf3t9rn7',

  // WhatsApp number with country code and no "+".
  whatsappNumber: '919930594593',
  phoneNumber: '+919930594593',
  // TODO: Opening hours, e.g. 'Mon–Sat, 10 am – 9 pm'.
  hours: '',

  // Home delivery from the shop (handmade orders and nightwear & lingerie requests), mostly Khanda Colony.
  // Both areas share pincode 410206, which also covers the rest of Panvel, so customers pick their area.
  localAreas: ['Khanda Colony', 'New Panvel'],
  localPincodes: ['410206'],

  // SAMPLE values: confirm before launch.
  shippingDays: '5–8',
  shippingFee: 79,
  freeShippingAbove: 999,
  localDeliveryFee: 0,
} as const;

// Features that need Firebase's pay-as-you-go Blaze plan. Turn them on after upgrading.
export const Features = {
  // Phone OTP sign-in: texts cost about ₹6 each after the first 10 a day.
  phoneSignIn: false,
  // Photos on reviews: uploads use Cloud Storage.
  reviewPhotos: true,
} as const;

export const localAreasLabel = Shop.localAreas.join(' & ');

export function isLocalPincode(pin: string) {
  return (Shop.localPincodes as readonly string[]).includes(pin.trim());
}

export function isLocalArea(area: string | undefined) {
  return !!area && (Shop.localAreas as readonly string[]).includes(area);
}

export function isLocalDelivery(pin: string, area: string | undefined) {
  return isLocalPincode(pin) && isLocalArea(area);
}

export function formatPrice(amount: number) {
  return '₹' + amount.toLocaleString('en-IN');
}
