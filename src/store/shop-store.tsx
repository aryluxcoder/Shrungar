// App state for the demo build. Everything is kept on the device with AsyncStorage.
// Screens only use `useShop()`, so this file is the one place to swap for Firebase later.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';

import { Shop, isLocalDelivery } from '@/constants/shop';
import { getProduct } from '@/data/catalogue';

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
  User,
} from './types';

const STORAGE_KEY = 'shrungar/state/v1';

type State = {
  user: User | null;
  bag: BagItem[];
  wishlist: string[];
  orders: Order[];
  requests: PrivateRequest[];
  reviews: Review[];
  helpful: string[];
  chat: ChatMessage[];
  pincode: string;
  address: Address | null;
};

const initialState: State = {
  user: null,
  bag: [],
  wishlist: [],
  orders: [],
  requests: [],
  reviews: [],
  helpful: [],
  chat: [],
  pincode: '',
  address: null,
};

// Quick answers for the in-app chat until the shop team replies from Firebase.
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

  const update = (fn: (s: State) => Partial<State>) => setState((s) => ({ ...s, ...fn(s) }));
  const userId = state.user?.id;

  const bagLines = state.bag.flatMap((item) => {
    const product = getProduct(item.productId);
    return product ? [{ ...item, product }] : [];
  });
  const subtotal = bagLines.reduce((sum, l) => sum + l.product.price * l.qty, 0);

  return {
    hydrated,
    user: state.user,
    pincode: state.pincode,
    address: state.address,

    // Account (demo: no real Google or SMS calls yet)
    signInWithGoogle() {
      update(() => ({ user: { id: 'demo-google', name: 'Demo shopper', provider: 'google' } }));
    },
    async sendOtp(phone: string) {
      return /^\d{10}$/.test(phone);
    },
    async verifyOtp(phone: string, code: string, name: string) {
      if (!/^\d{6}$/.test(code)) return false;
      update(() => ({
        user: { id: 'demo-phone-' + phone, name: name.trim() || 'Shopper', phone: '+91' + phone, provider: 'phone' },
      }));
      return true;
    },
    signOut() {
      update(() => ({ user: null }));
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
    orders: state.orders.filter((o) => o.userId === userId),
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
      update((s) => ({ orders: [order, ...s.orders], bag: [], address, pincode: address.pincode }));
      return order.id;
    },

    // Private requests (nightwear & lingerie)
    requests: state.requests.filter((r) => r.userId === userId),
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
      update((s) => ({ requests: [request, ...s.requests] }));
      return request.id;
    },

    // Reviews
    reviewsFor(productId: string) {
      return state.reviews.filter((r) => r.productId === productId);
    },
    myReviews: state.reviews.filter((r) => r.userId === userId),
    helpful: state.helpful,
    postReview(input: { productId: string; rating: number; text: string; photo?: string }) {
      if (!state.user) return;
      const verified = state.orders.some(
        (o) => o.userId === userId && o.lines.some((l) => l.productId === input.productId),
      );
      const review: Review = {
        ...input,
        id: makeId('RV'),
        userId: state.user.id,
        userName: state.user.name,
        verified,
        createdAt: Date.now(),
        comments: [],
      };
      update((s) => ({ reviews: [review, ...s.reviews] }));
    },
    addComment(reviewId: string, text: string) {
      if (!state.user) return;
      const comment = { id: makeId('CM'), userName: state.user.name, text, createdAt: Date.now() };
      update((s) => ({
        reviews: s.reviews.map((r) => (r.id === reviewId ? { ...r, comments: [...r.comments, comment] } : r)),
      }));
    },
    toggleHelpful(reviewId: string) {
      update((s) => ({
        helpful: s.helpful.includes(reviewId) ? s.helpful.filter((id) => id !== reviewId) : [...s.helpful, reviewId],
      }));
    },

    // Help chat
    chat: [Welcome, ...state.chat],
    typing,
    sendChat(text: string) {
      const mine: ChatMessage = { id: makeId('MS'), from: 'me', text, createdAt: Date.now() };
      update((s) => ({ chat: [...s.chat, mine] }));
      setTyping(true);
      if (replyTimer.current) clearTimeout(replyTimer.current);
      replyTimer.current = setTimeout(() => {
        const latest = state.orders.find((o) => o.userId === userId);
        const answer =
          text === 'Track my order'
            ? latest
              ? `Your latest order ${latest.id} is ${latest.status}. You can follow each step under Orders.`
              : 'You have no orders yet. Once you place one, you can follow each step under Orders.'
            : QuickAnswers[text] || 'Thank you! Our shop team will reply here shortly.';
        setTyping(false);
        update((s) => ({ chat: [...s.chat, { id: makeId('MS'), from: 'shop', text: answer, createdAt: Date.now() }] }));
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
