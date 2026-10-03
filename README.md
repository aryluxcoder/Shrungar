# Shrungar

Shopping app for Shrungar, a handmade clothing, mats and bags shop in New Panvel.
Handcrafted pieces ship across India. Nightwear and lingerie are requested privately,
then picked up at the shop or delivered locally.

Built with Expo (React Native) for Android and iOS. Screen designs live in [design/](design/).

## Run it

You need Node.js 20 or newer.

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone (Play Store / App Store).
Press `w` in the terminal to open it in a browser instead.

Before committing, run `npm run lint` and `npm run typecheck`.

## What works today (demo build)

Every screen from the designs works end to end, with data saved on the phone:

- Home, Shop (search and craft filters), product pages with colour/size and wishlist
- Bag with pincode check, local-delivery detection, delivery address, UPI/Card/COD choice
- Orders & requests tracking with step-by-step progress
- Private nightwear & lingerie requests
- Reviews with ratings, photos, comments and "Verified buyer" for people who ordered the piece
- Help chat with quick answers, WhatsApp, call and map links
- Sign in with Google or phone OTP

Sign-in, payments and the shop's replies are simulated. Nothing leaves the phone yet.

## Fill in before launch

All in [src/constants/shop.ts](src/constants/shop.ts):

- Opening hours
- Shipping days, shipping fee and free-shipping threshold (current values are samples)

Home delivery from the shop covers Khanda Colony and New Panvel (`localAreas` in the same file).
Their pincode, 410206, also covers the rest of Panvel, so the bag asks local customers which area they are in.

Products, prices and descriptions in [src/data/catalogue.ts](src/data/catalogue.ts) are samples.
Product photos replace the striped placeholders once a `photo` URL is set.

## Firebase config

Firebase project: `shrungar-f6de8`. Android package and iOS bundle ID: `app.shrungar.com`.

This repository is public, so `google-services.json` is not committed. Download it from the Firebase
console (Project settings → Your apps) and put it in the project root. EAS builds will read it from a
`GOOGLE_SERVICES_JSON` file environment variable instead (see [app.config.js](app.config.js)).

## Project layout

```
src/app/            Screens (Expo Router: each file is a route)
  (tabs)/           Home, Shop, Request, Help, Me
  product/[id]/     Product page and its reviews
  bag.tsx           Bag and checkout
  orders.tsx        Orders & requests tracking
  sign-in.tsx       Sign-in sheet opened when a guest needs an account
src/components/     Shared UI: text, icons, buttons, tab bar, animations
src/constants/      Design tokens (theme.ts) and shop details (shop.ts)
src/data/           Sample catalogue
src/store/          App state; the single place to connect a backend
```

## Next steps

1. **Firebase**: real Google and phone OTP sign-in, products and photos from Firestore and Storage,
   orders, requests, reviews and chat saved online. Only `src/store/shop-store.tsx` needs to change.
2. **Shop admin**: a way for the shop team to add products, update order status and reply to chat and reviews.
3. **Payments**: Razorpay for UPI and cards.
4. **Store release**: build with EAS (`npx eas-cli@latest build`) and publish to Play Store and App Store.
