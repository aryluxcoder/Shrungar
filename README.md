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

Scan the QR code with the **Expo Go** app to try the app in demo mode, where everything stays on the phone.
Press `w` in the terminal to open it in a browser instead. For real sign-in and saved orders, use a
test build (see below).

Before committing, run `npm run lint` and `npm run typecheck`.

## What works

Every screen from the designs works end to end:

- Home, Shop (search and craft filters), product pages with colour/size and wishlist
- Bag with pincode check, local-delivery areas, delivery address, UPI/Card/COD choice
- Orders & requests tracking with step-by-step progress
- Private nightwear & lingerie requests
- Reviews with ratings, comments, "Helpful" counts and "Verified buyer" for people who ordered the piece
- Help chat with quick answers, WhatsApp, call and map links
- Sign in with Google
- After an order or request, the customer can send its details to the shop on WhatsApp

In test and store builds, sign-in, orders, requests, reviews and chat use Firebase. In Expo Go and the
browser they are simulated on the device (demo mode). Online payment is not connected yet.

## Fill in before launch

All in [src/constants/shop.ts](src/constants/shop.ts):

- Opening hours
- Shipping days, shipping fee and free-shipping threshold (current values are samples)

Home delivery from the shop covers Khanda Colony and New Panvel (`localAreas` in the same file).
Their pincode, 410206, also covers the rest of Panvel, so the bag asks local customers which area they are in.

Products, prices and descriptions in [src/data/catalogue.ts](src/data/catalogue.ts) are samples.
Product photos replace the striped placeholders once a `photo` URL is set.

## Firebase

Firebase project `shrungar-f6de8`. App ID (Android package and iOS bundle ID): `app.shrungar.com`.
The code is in [src/backend/firebase.ts](src/backend/firebase.ts); screens reach it through
[src/store/shop-store.tsx](src/store/shop-store.tsx).

- `google-services.json` is not committed because this repository is public. Download it from the
  Firebase console (Project settings → Your apps) into the project root. EAS builds read it from the
  `GOOGLE_SERVICES_JSON` file variable (see [app.config.js](app.config.js)).
- Security rules: [firestore.rules](firestore.rules) and [storage.rules](storage.rules). Publish them in the
  Firebase console, or with `npx firebase-tools deploy --only firestore:rules,storage`.
- Google sign-in needs each build's SHA-1 fingerprint added in Firebase (Project settings → Your apps),
  followed by a fresh `google-services.json`.
- Phone OTP sign-in and review photos are built but switched off (`Features` in
  [src/constants/shop.ts](src/constants/shop.ts)), because they need Firebase's pay-as-you-go Blaze plan.
- Until the shop has its own tools, update order and request status, review replies and chat replies
  in the Firebase console (Firestore Database).

### Test build on an Android phone

```bash
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest env:set --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json \
  --visibility secret --environment development --environment preview --environment production
npx eas-cli@latest build --profile development --platform android
```

Install the APK from the link EAS shows, then run `npx expo start` on the computer and open the
project from the installed Shrungar app (phone and computer on the same Wi-Fi).

## Project layout

```
src/app/            Screens (Expo Router: each file is a route)
  (tabs)/           Home, Shop, Request, Help, Me
  product/[id]/     Product page and its reviews
  bag.tsx           Bag and checkout
  orders.tsx        Orders & requests tracking
  sign-in.tsx       Sign-in sheet opened when a guest needs an account
src/backend/        Firebase sign-in, Firestore and Storage
src/components/     Shared UI: text, icons, buttons, tab bar, animations
src/constants/      Design tokens (theme.ts) and shop details (shop.ts)
src/data/           Sample catalogue
src/store/          App state used by every screen
```

## Next steps

1. **Shop admin**: screens for the shop team to add products and photos, update order status and reply to chat and reviews.
2. **Payments**: Razorpay for UPI and cards.
3. **Store release**: production builds with EAS, then Play Store and App Store listings.
