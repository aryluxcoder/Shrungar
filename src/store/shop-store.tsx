// App state. Screens only talk to `useShop()`.
// In development and store builds, sign-in, orders, requests, reviews and chat go through Firebase
// (src/backend/firebase.ts). In Expo Go and the web preview they stay on the device (demo mode).
// The bag, wishlist, pincode and address are always kept on the device.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';

import * as live from '@/backend/firebase';
import type { AuthResult } from '@/backend/firebase';
import { Shop, isLocalDelivery } from '@/constants/shop';
import { getProduct } from '@/data/catalogue';
import { notify } from '@/lib/links';

import type {
  Address,
  BagItem,
  ChatMessage,
  Order,
  PaymentMethod,
  PrivateRequest,
  ReceiveMode,
  RequestCategory,
  Review,
  ReviewComment,
  User,
} from './types';

const STORAGE_KEY = 'shrungar/state/v1';
const demo = !live.firebaseEnabled;

type State = {
  // Demo mode only; with Firebase these come from the server.
  user: User | null;
  orders: Order[];
  requests: PrivateRequest[];
  reviews: Review[];
  chat: ChatMessage[];
  // Always on the device.
  bag: BagItem[];
  wishlist: string[];
  pincode: string;
  address: Address | null;
};

const initialState: State = {
  user: null,
  orders: [],
  requests: [],
  reviews: [],
  chat: [],
  bag: [],
  wishlist: [],
  pincode: '',
  address: null,
};

// The signed-in customer's own data from Firebase, tagged with whose it is.
type Mine = { uid: string; orders: Order[]; requests: PrivateRequest[]; chat: ChatMessage[] };

// Instant answers in the help chat. Shop replies arrive separately.
export const QuickAnswers: Record<string, string> = {
  'Track my order': '',
  'Bulk / big order':
    'Lovely! For big or bulk orders please tap "Chat on WhatsApp" above and we will share a quote.',
  'Size help':
    'Tell us your usual size and we will suggest the best fit. You can also try at our shop.',
  // TODO: Replace with the shop's real exchange policy.
  Returns:
    'Message us with your order number and we will help with an exchange for unused handmade items.',
};

const Welcome: ChatMessage = {
  id: 'welcome',
  from: 'shop',
  text: 'Namaste! How can we help you today?',
  createdAt: 0,
};

const offline = 'Please check your internet connection and try again.';

function makeId(prefix: string) {
  const time = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 4);
  return prefix + time + rand;
}

export function bagKey(productId: string, colour?: string, size?: string) {
  return [productId, colour ?? '', size ?? ''].join('|');
}

export function deliveryFor(subtotal: number, local: boolean) {
  if (local) return Shop.localDeliveryFee;
  return subtotal >= Shop.freeShippingAbove ? 0 : Shop.shippingFee;
}

function useShopState() {
  const [state, setState] = useState<State>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [typing, setTyping] = useState(false);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [liveUser, setLiveUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(demo);
  const [mine, setMine] = useState<Mine | null>(null);
  const [liveReviews, setLiveReviews] = useState<Review[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...initialState, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  useEffect(() => {
    if (demo) return;
    const stopAuth = live.watchAuth((u) => {
      setLiveUser(u);
      setAuthReady(true);
    });
    const stopReviews = live.watchReviews(setLiveReviews);
    return () => {
      stopAuth();
      stopReviews();
    };
  }, []);

  const user = demo ? state.user : liveUser;
  const userId = user?.id;

  useEffect(() => {
    if (demo || !userId) return;
    const patch = (part: Partial<Mine>) =>
      setMine((m) => ({ ...(m?.uid === userId ? m : { uid: userId, orders: [], requests: [], chat: [] }), ...part }));
    return live.watchMine(userId, {
      orders: (orders) => patch({ orders }),
      requests: (requests) => patch({ requests }),
      chat: (chat) => patch({ chat }),
    });
  }, [userId]);

  const update = (fn: (s: State) => Partial<State>) => setState((s) => ({ ...s, ...fn(s) }));
  const own = mine?.uid === userId ? mine : null;

  const orders = demo ? state.orders.filter((o) => o.userId === userId) : (own?.orders ?? []);
  const requests = demo ? state.requests.filter((r) => r.userId === userId) : (own?.requests ?? []);
  const reviews = demo ? state.reviews.map((r) => ({ ...r, helpfulBy: r.helpfulBy ?? [] })) : liveReviews;
  // Guests' quick answers stay on the device; signed-in chats are saved to Firebase.
  const chat = !demo && user ? (own?.chat ?? []) : state.chat;

  const bagLines = state.bag.flatMap((item) => {
    const product = getProduct(item.productId);
    return product ? [{ ...item, product }] : [];
  });
  const subtotal = bagLines.reduce((sum, l) => sum + l.product.price * l.qty, 0);

  const saveChat = (message: ChatMessage) => {
    if (!demo && user) live.addChatMessage(user.id, message).catch(() => {});
    else update((s) => ({ chat: [...s.chat, message] }));
  };

  return {
    ready: hydrated && authReady,
    demo,
    user,
    pincode: state.pincode,
    address: state.address,

    // Account
    async signInWithGoogle(): Promise<AuthResult> {
      if (!demo) return live.signInWithGoogle();
      update(() => ({ user: { id: 'demo-google', name: 'Demo shopper', provider: 'google' } }));
      return { ok: true };
    },
    async sendOtp(phone: string): Promise<AuthResult> {
      if (!/^\d{10}$/.test(phone)) return { ok: false, message: 'Enter your 10-digit mobile number' };
      return demo ? { ok: true } : live.sendOtp(phone);
    },
    async verifyOtp(phone: string, code: string, name: string): Promise<AuthResult> {
      if (!/^\d{6}$/.test(code)) return { ok: false, message: 'Enter the 6-digit code' };
      const cleanName = name.trim();
      if (demo) {
        update(() => ({
          user: { id: 'demo-phone-' + phone, name: cleanName || 'Shopper', phone: '+91' + phone, provider: 'phone' },
        }));
        return { ok: true };
      }
      const result = await live.verifyOtp(code, cleanName);
      // The sign-in event can arrive before the name is saved, so apply the name here too.
      if (result.ok && cleanName) setLiveUser((u) => (u ? { ...u, name: cleanName } : u));
      return result;
    },
    async signOut() {
      if (demo) update(() => ({ user: null }));
      else await live.signOutUser();
    },

    // Bag
    bag: bagLines,
    bagCount: state.bag.reduce((n, i) => n + i.qty, 0),
    subtotal,
    addToBag(productId: string, qty: number, options: { colour?: string; size?: string }) {
      const key = bagKey(productId, options.colour, options.size);
      update((s) => {
        const existing = s.bag.find((i) => i.key === key);
        return {
          bag: existing
            ? s.bag.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
            : [...s.bag, { key, productId, qty, ...options }],
        };
      });
    },
    setQty(key: string, qty: number) {
      update((s) => ({
        bag: qty <= 0 ? s.bag.filter((i) => i.key !== key) : s.bag.map((i) => (i.key === key ? { ...i, qty } : i)),
      }));
    },
    setPincode(pincode: string) {
      update(() => ({ pincode }));
    },

    // Wishlist
    wishlist: state.wishlist,
    toggleWishlist(productId: string) {
      update((s) => ({
        wishlist: s.wishlist.includes(productId)
          ? s.wishlist.filter((id) => id !== productId)
          : [...s.wishlist, productId],
      }));
    },

    // Orders
    orders,
    placeOrder(payment: PaymentMethod, address: Address) {
      if (!userId || bagLines.length === 0) return null;
      const local = isLocalDelivery(address.pincode, address.area);
      const delivery = deliveryFor(subtotal, local);
      const order: Order = {
        id: makeId('SH'),
        userId,
        createdAt: Date.now(),
        lines: bagLines.map(({ product, ...item }) => ({ ...item, name: product.name, price: product.price })),
        subtotal,
        delivery,
        total: subtotal + delivery,
        payment,
        address,
        local,
        status: 'placed',
      };
      const bagBefore = state.bag;
      update((s) => ({ bag: [], address, pincode: address.pincode, orders: demo ? [order, ...s.orders] : s.orders }));
      if (!demo) {
        live.createOrder(order).catch(() => {
          update(() => ({ bag: bagBefore }));
          notify('Order not placed', offline);
        });
      }
      return order.id;
    },

    // Private requests (nightwear & lingerie)
    requests,
    sendRequest(input: {
      category: RequestCategory;
      size: string;
      notes: string;
      mode: ReceiveMode;
      area?: string;
      whatsapp: string;
    }) {
      if (!userId) return null;
      const request: PrivateRequest = {
        ...input,
        id: makeId('RQ'),
        userId,
        createdAt: Date.now(),
        status: 'received',
      };
      if (demo) update((s) => ({ requests: [request, ...s.requests] }));
      else live.createRequest(request).catch(() => notify('Request not sent', offline));
      return request.id;
    },

    // Reviews
    reviewsFor(productId: string) {
      return reviews.filter((r) => r.productId === productId);
    },
    myReviews: reviews.filter((r) => r.userId === userId),
    postReview(input: { productId: string; rating: number; text: string; photo?: string }) {
      if (!user) return;
      const { photo, ...fields } = input;
      const review = {
        ...fields,
        id: makeId('RV'),
        userId: user.id,
        userName: user.name,
        verified: orders.some((o) => o.lines.some((l) => l.productId === input.productId)),
        createdAt: Date.now(),
        helpfulBy: [] as string[],
      };
      if (demo) {
        update((s) => ({ reviews: [{ ...review, photo, comments: [] }, ...s.reviews] }));
        return;
      }
      live
        .createReview(review, photo)
        .then((photoSaved) => {
          if (!photoSaved) notify('Photo not added', 'Your review is posted, but the photo could not be uploaded.');
        })
        .catch(() => notify('Review not posted', offline));
    },
    addComment(reviewId: string, text: string) {
      if (!user) return;
      const comment: ReviewComment = { id: makeId('CM'), userId: user.id, userName: user.name, text, createdAt: Date.now() };
      if (demo) {
        update((s) => ({
          reviews: s.reviews.map((r) => (r.id === reviewId ? { ...r, comments: [...r.comments, comment] } : r)),
        }));
      } else {
        live.addComment(reviewId, comment).catch(() => notify('Comment not posted', offline));
      }
    },
    toggleHelpful(reviewId: string) {
      const review = reviews.find((r) => r.id === reviewId);
      if (!user || !review) return;
      const helpful = !review.helpfulBy.includes(user.id);
      if (!demo) {
        live.setHelpful(reviewId, user.id, helpful).catch(() => {});
        return;
      }
      update((s) => ({
        reviews: s.reviews.map((r) => {
          if (r.id !== reviewId) return r;
          const others = (r.helpfulBy ?? []).filter((id) => id !== user.id);
          return { ...r, helpfulBy: helpful ? [...others, user.id] : others };
        }),
      }));
    },

    // Help chat
    chat: [Welcome, ...chat],
    typing,
    sendChat(text: string) {
      saveChat({ id: makeId('MS'), from: 'me', text, createdAt: Date.now() });
      setTyping(true);
      if (replyTimer.current) clearTimeout(replyTimer.current);
      const latest = orders[0];
      replyTimer.current = setTimeout(() => {
        const answer =
          text === 'Track my order'
            ? latest
              ? `Your latest order ${latest.id} is ${latest.status}. You can follow each step under Orders.`
              : 'You have no orders yet. Once you place one, you can follow each step under Orders.'
            : QuickAnswers[text] || 'Thank you! Our shop team will reply here shortly.';
        setTyping(false);
        saveChat({ id: makeId('MS'), from: 'bot', text: answer, createdAt: Date.now() });
      }, 1100);
    },
  };
}

type ShopContextValue = ReturnType<typeof useShopState>;

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const value = useShopState();
  return <ShopContext value={value}>{children}</ShopContext>;
}

export function useShop() {
  const value = use(ShopContext);
  if (!value) throw new Error('useShop must be used inside <ShopProvider>');
  return value;
}
