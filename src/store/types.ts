export type User = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  provider: 'google' | 'phone';
};

export type BagItem = {
  key: string;
  productId: string;
  qty: number;
  colour?: string;
  size?: string;
};

export type Address = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  // Local delivery area (Khanda Colony / New Panvel) when the pincode is near the shop.
  area?: string;
};

export type PaymentMethod = 'UPI' | 'Card' | 'COD';

export const OrderSteps = ['placed', 'packed', 'shipped', 'delivered'] as const;
export type OrderStatus = (typeof OrderSteps)[number];

export type OrderLine = BagItem & { name: string; price: number };

export type Order = {
  id: string;
  userId: string;
  createdAt: number;
  lines: OrderLine[];
  subtotal: number;
  delivery: number;
  total: number;
  payment: PaymentMethod;
  address: Address;
  local: boolean;
  status: OrderStatus;
};

export type RequestCategory = 'Nightwear' | 'Lingerie';
export type ReceiveMode = 'pickup' | 'local';

export const RequestSteps = ['received', 'checking', 'confirmed', 'ready'] as const;
export type RequestStatus = (typeof RequestSteps)[number];

export type PrivateRequest = {
  id: string;
  userId: string;
  createdAt: number;
  category: RequestCategory;
  size: string;
  notes: string;
  mode: ReceiveMode;
  area?: string;
  whatsapp: string;
  status: RequestStatus;
};

export type ReviewComment = {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: number;
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  photo?: string;
  verified: boolean;
  createdAt: number;
  reply?: string;
  // Users who marked the review helpful.
  helpfulBy: string[];
  comments: ReviewComment[];
};

export type ChatMessage = {
  id: string;
  // 'bot' is an instant quick answer, 'shop' a reply from the shop team.
  from: 'me' | 'shop' | 'bot';
  text: string;
  createdAt: number;
};
