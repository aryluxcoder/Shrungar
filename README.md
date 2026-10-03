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
- **Shop admin** (Me → Shop admin, for the owner and admins): add and edit products with up to 5 photos,
  show or hide them, move orders and private requests through their steps, WhatsApp customers, and
  (owner only) add or remove admins

In test and store builds, products, sign-in, orders, requests, reviews and chat use Firebase. In Expo Go
and the browser they are simulated on the device (demo mode, where whoever signs in is the owner, so
Shop admin can be tried). Online payment is not connected yet.

## Fill in before launch

All in [src/constants/shop.ts](src/constants/shop.ts):

- Opening hours
- Shipping days, shipping fee and free-shipping threshold (current values are samples)

Home delivery from the shop covers Khanda Colony and New Panvel (`localAreas` in the same file).
Their pincode, 410206, also covers the rest of Panvel, so the bag asks local customers which area they are in.

Real products are added in the app under Shop admin. The products in [src/data/catalogue.ts](src/data/catalogue.ts)
are samples used only in demo mode.

## Firebase

Firebase project `shrungar-1958`. App ID (Android package and iOS bundle ID): `app.shrungar.com`.
The code is in [src/backend/firebase.ts](src/backend/firebase.ts); screens reach it through
[src/store/shop-store.tsx](src/store/shop-store.tsx).

- `google-services.json` is not committed because this repository is public. Download it from the
  Firebase console (Project settings → Your apps) into the project root. EAS builds read it from the
  `GOOGLE_SERVICES_JSON` file variable (see [app.config.js](app.config.js)).
- Security rules: [firestore.rules](firestore.rules) and [storage.rules](storage.rules). Publish them in the
  Firebase console, or with `npx firebase-tools deploy --only firestore:rules,storage`.
- Google sign-in needs each build's SHA-1 fingerprint added in Firebase (Project settings → Your apps),
  followed by a fresh `google-services.json`.
- Photos (products and reviews) use Cloud Storage, which needs the pay-as-you-go Blaze plan. Create the
  bucket in `us-central1`, where 5 GB of storage and 100 GB of downloads a month are free.
- Phone OTP sign-in is built but switched off (`Features` in [src/constants/shop.ts](src/constants/shop.ts))
  because each text costs money.
- Help chat and review replies are answered in the Firebase console (Firestore Database) for now.

### Shop team

The team lives in the Firestore collection `staff`, one document per Google email address:

- **owner**: set up once by hand. In Firestore, create collection `staff`, document ID = the owner's
  Gmail address, with fields `name` (string), `role` (string) `owner` and `active` (boolean) `true`.
- **admin**: added by the owner in the app (Shop admin → Team).
- **seller**: reserved for a future open marketplace. Products already record who listed them
  (`sellerId`) and the rules let a seller manage only their own products, but the app does not offer it yet.

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
  admin/            Shop admin: products, orders, private requests, team
src/backend/        Firebase sign-in, Firestore and Storage
src/components/     Shared UI: text, icons, buttons, tab bar, animations
src/constants/      Design tokens (theme.ts) and shop details (shop.ts)
src/data/           Sample catalogue
src/store/          App state used by every screen
```

## Next steps

1. **Replies in the app**: answer help chat and reviews from Shop admin.
2. **Payments**: Razorpay for UPI and cards.
3. **Store release**: production builds with EAS, then Play Store and App Store listings.
4. **Open marketplace (later)**: let makers apply to sell, owner approval, seller pages and payouts.
