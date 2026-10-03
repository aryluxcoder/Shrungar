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

  // TODO: Add every pincode the shop delivers to locally (nightwear & lingerie, same-day delivery).
  localPincodes: ['410206'],
  // TODO: Local delivery radius in km, shown on the request screen.
  localRadiusKm: null as number | null,

  // SAMPLE values: confirm before launch.
  shippingDays: '5–8',
  shippingFee: 79,
  freeShippingAbove: 999,
  localDeliveryFee: 0,
} as const;

export function isLocalPincode(pin: string) {
  return (Shop.localPincodes as readonly string[]).includes(pin.trim());
}

export function formatPrice(amount: number) {
  return '₹' + amount.toLocaleString('en-IN');
}
