// Firebase sign-in, Firestore data and Storage uploads for development and store builds.
// Expo Go and the web preview don't contain the native Firebase code, so there the app keeps
// its on-device demo data and nothing in this file is called.

import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import type { User as FirebaseUser } from '@react-native-firebase/auth';

import { patternFor, type Product } from '@/data/catalogue';
import type {
  ChatMessage,
  Order,
  OrderStatus,
  PrivateRequest,
  RequestStatus,
  Review,
  ReviewComment,
  Role,
  StaffMember,
  User,
} from '@/store/types';

export const firebaseEnabled =
  Platform.OS !== 'web' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

export type AuthResult = { ok: true } | { ok: false; message: string };

type Modules = {
  auth: typeof import('@react-native-firebase/auth');
  firestore: typeof import('@react-native-firebase/firestore');
  storage: typeof import('@react-native-firebase/storage');
  google: typeof import('@react-native-google-signin/google-signin');
};

// Read from google-services.json by app.config.js; empty until Google sign-in is enabled in Firebase.
const googleWebClientId: string | undefined = Constants.expoConfig?.extra?.googleWebClientId ?? undefined;

let modules: Modules | null = null;

// Loaded on first use: these packages throw on import when the native code is missing (Expo Go).
function fb(): Modules {
  if (!modules) {
    /* eslint-disable @typescript-eslint/no-require-imports */
    modules = {
      auth: require('@react-native-firebase/auth'),
      firestore: require('@react-native-firebase/firestore'),
      storage: require('@react-native-firebase/storage'),
      google: require('@react-native-google-signin/google-signin'),
    };
    /* eslint-enable @typescript-eslint/no-require-imports */
    if (googleWebClientId) modules.google.GoogleSignin.configure({ webClientId: googleWebClientId });
  }
  return modules;
}

function db() {
  return fb().firestore.getFirestore();
}

// Firestore rejects undefined values, and everything stored here is plain JSON.
function clean<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function newestFirst<T extends { createdAt: number }>(a: T, b: T) {
  return b.createdAt - a.createdAt;
}

function oldestFirst<T extends { createdAt: number }>(a: T, b: T) {
  return a.createdAt - b.createdAt;
}

function ignore(error: Error) {
  console.warn('[firebase]', error.message);
}

function friendly(error: unknown): string {
  const code = String((error as { code?: string })?.code ?? '');
  if (code.includes('invalid-phone-number')) return 'That phone number does not look right.';
  if (code.includes('invalid-verification-code')) return 'That code is not right. Please check it and try again.';
  if (code.includes('session-expired') || code.includes('code-expired')) return 'The code has expired. Please ask for a new one.';
  if (code.includes('too-many-requests') || code.includes('quota-exceeded')) return 'Too many tries. Please wait a while and try again.';
  if (code.includes('network-request-failed')) return 'No internet connection. Please try again.';
  if (code.includes('operation-not-allowed') || code.includes('billing-not-enabled'))
    return 'This sign-in option is not switched on yet.';
  if (code === 'PLAY_SERVICES_NOT_AVAILABLE') return 'Google Play services are needed for Google sign-in.';
  if (code === 'DEVELOPER_ERROR' || code === '10') return 'Google sign-in is not set up for this build yet.';
  return 'Something went wrong. Please try again.';
}

// ---------- Account ----------

function toUser(u: FirebaseUser): User {
  const google = u.providerData.some((p) => p.providerId === 'google.com');
  return {
    id: u.uid,
    name: u.displayName || 'Shopper',
    email: u.email ?? undefined,
    phone: u.phoneNumber ?? undefined,
    provider: google ? 'google' : 'phone',
  };
}

export function watchAuth(onChange: (user: User | null) => void) {
  const { getAuth, onAuthStateChanged } = fb().auth;
  return onAuthStateChanged(getAuth(), (u) => onChange(u ? toUser(u) : null));
}

async function saveProfile(user: User) {
  const { doc, setDoc } = fb().firestore;
  await setDoc(doc(db(), 'users', user.id), clean({ ...user, updatedAt: Date.now() }), { merge: true }).catch(ignore);
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const { auth, google } = fb();
  if (!googleWebClientId) return { ok: false, message: 'Google sign-in is not set up for this build yet.' };
  try {
    await google.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await google.GoogleSignin.signIn();
    if (!google.isSuccessResponse(response)) return { ok: false, message: '' };
    const idToken = response.data.idToken;
    if (!idToken) return { ok: false, message: 'Google sign-in is not set up for this build yet.' };
    const { user } = await auth.signInWithCredential(auth.getAuth(), auth.GoogleAuthProvider.credential(idToken));
    await saveProfile(toUser(user));
    return { ok: true };
  } catch (error) {
    return { ok: false, message: friendly(error) };
  }
}

let confirmation: { confirm(code: string): Promise<{ user: FirebaseUser }> } | null = null;

export async function sendOtp(phone: string): Promise<AuthResult> {
  const { getAuth, signInWithPhoneNumber } = fb().auth;
  try {
    confirmation = await signInWithPhoneNumber(getAuth(), '+91' + phone);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: friendly(error) };
  }
}

export async function verifyOtp(code: string, name: string): Promise<AuthResult> {
  if (!confirmation) return { ok: false, message: 'Please ask for a new code.' };
  try {
    const { user } = await confirmation.confirm(code);
    confirmation = null;
    if (name) await fb().auth.updateProfile(user, { displayName: name });
    await saveProfile({ ...toUser(user), name: name || toUser(user).name });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: friendly(error) };
  }
}

export async function signOutUser() {
  const { auth, google } = fb();
  await google.GoogleSignin.signOut().catch(() => {});
  await auth.signOut(auth.getAuth());
}

// ---------- Orders, requests and chat (per customer) ----------

export function watchMine(
  uid: string,
  on: { orders(list: Order[]): void; requests(list: PrivateRequest[]): void; chat(list: ChatMessage[]): void },
) {
  const { collection, onSnapshot, query, where } = fb().firestore;
  const subscriptions = [
    onSnapshot(
      query(collection(db(), 'orders'), where('userId', '==', uid)),
      (snap) => on.orders(snap.docs.map((d) => d.data() as Order).sort(newestFirst)),
      ignore,
    ),
    onSnapshot(
      query(collection(db(), 'requests'), where('userId', '==', uid)),
      (snap) => on.requests(snap.docs.map((d) => d.data() as PrivateRequest).sort(newestFirst)),
      ignore,
    ),
    onSnapshot(
      collection(db(), 'chats', uid, 'messages'),
      (snap) => on.chat(snap.docs.map((d) => ({ ...(d.data() as Omit<ChatMessage, 'id'>), id: d.id })).sort(oldestFirst)),
      ignore,
    ),
  ];
  return () => subscriptions.forEach((unsubscribe) => unsubscribe());
}

export async function createOrder(order: Order) {
  const { doc, setDoc } = fb().firestore;
  await setDoc(doc(db(), 'orders', order.id), clean(order));
}

export async function createRequest(request: PrivateRequest) {
  const { doc, setDoc } = fb().firestore;
  await setDoc(doc(db(), 'requests', request.id), clean(request));
}

export async function addChatMessage(uid: string, message: ChatMessage) {
  const { doc, setDoc } = fb().firestore;
  const { id, ...data } = message;
  await setDoc(doc(db(), 'chats', uid, 'messages', id), clean(data));
}

// ---------- Reviews (public) ----------

export function watchReviews(onChange: (reviews: Review[]) => void) {
  const { collection, collectionGroup, onSnapshot } = fb().firestore;
  let reviews: Omit<Review, 'comments'>[] = [];
  let comments = new Map<string, ReviewComment[]>();
  const emit = () => onChange(reviews.map((r) => ({ ...r, comments: comments.get(r.id) ?? [] })).sort(newestFirst));

  const subscriptions = [
    onSnapshot(
      collection(db(), 'reviews'),
      (snap) => {
        reviews = snap.docs.map((d) => {
          const data = d.data() as Omit<Review, 'id' | 'comments'>;
          return { ...data, id: d.id, helpfulBy: data.helpfulBy ?? [] };
        });
        emit();
      },
      ignore,
    ),
    onSnapshot(
      collectionGroup(db(), 'comments'),
      (snap) => {
        const next = new Map<string, ReviewComment[]>();
        for (const d of snap.docs) {
          const reviewId = d.ref.parent.parent?.id;
          if (!reviewId) continue;
          next.set(reviewId, [...(next.get(reviewId) ?? []), { ...(d.data() as Omit<ReviewComment, 'id'>), id: d.id }]);
        }
        for (const list of next.values()) list.sort(oldestFirst);
        comments = next;
        emit();
      },
      ignore,
    ),
  ];
  return () => subscriptions.forEach((unsubscribe) => unsubscribe());
}

async function uploadReviewPhoto(uid: string, reviewId: string, uri: string) {
  const { getDownloadURL, getStorage, putFile, ref } = fb().storage;
  const png = uri.toLowerCase().endsWith('.png');
  const file = ref(getStorage(), `reviews/${uid}/${reviewId}.${png ? 'png' : 'jpg'}`);
  await putFile(file, uri, { contentType: png ? 'image/png' : 'image/jpeg' });
  return getDownloadURL(file);
}

// Posts the review; returns false when the photo could not be uploaded (the review is still saved).
export async function createReview(review: Omit<Review, 'comments'>, photoUri?: string) {
  const { doc, setDoc } = fb().firestore;
  const photo = photoUri ? await uploadReviewPhoto(review.userId, review.id, photoUri).catch(() => undefined) : undefined;
  const { id, ...data } = review;
  await setDoc(doc(db(), 'reviews', id), clean({ ...data, photo }));
  return !photoUri || !!photo;
}

export async function addComment(reviewId: string, comment: ReviewComment) {
  const { doc, setDoc } = fb().firestore;
  const { id, ...data } = comment;
  await setDoc(doc(db(), 'reviews', reviewId, 'comments', id), clean(data));
}

export async function setHelpful(reviewId: string, uid: string, helpful: boolean) {
  const { arrayRemove, arrayUnion, doc, updateDoc } = fb().firestore;
  await updateDoc(doc(db(), 'reviews', reviewId), { helpfulBy: helpful ? arrayUnion(uid) : arrayRemove(uid) });
}

// ---------- Products ----------

function toProduct(id: string, data: Omit<Product, 'id' | 'pattern'>): Product {
  return { ...data, id, pattern: patternFor(data.category) };
}

// Shoppers see products in the shop; admins (`all`) also see hidden ones.
export function watchProducts(all: boolean, onChange: (products: Product[]) => void) {
  const { collection, onSnapshot, query, where } = fb().firestore;
  const source = all ? collection(db(), 'products') : query(collection(db(), 'products'), where('status', '==', 'active'));
  return onSnapshot(
    source,
    (snap) =>
      onChange(
        snap.docs
          .map((d) => toProduct(d.id, d.data() as Omit<Product, 'id' | 'pattern'>))
          .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)),
      ),
    ignore,
  );
}

async function uploadProductPhoto(productId: string, uri: string) {
  const { getDownloadURL, getStorage, putFile, ref } = fb().storage;
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`;
  const file = ref(getStorage(), `products/${productId}/${name}`);
  await putFile(file, uri, { contentType: 'image/jpeg' });
  return getDownloadURL(file);
}

// Uploads any new (local) photos, then saves the product.
export async function saveProduct(product: Product) {
  const { doc, setDoc } = fb().firestore;
  const photos = await Promise.all(
    (product.photos ?? []).map((uri) => (uri.startsWith('http') ? uri : uploadProductPhoto(product.id, uri))),
  );
  const data: Partial<Product> = { ...product, photos };
  delete data.id;
  delete data.pattern;
  await setDoc(doc(db(), 'products', product.id), clean(data));
}

export async function deleteProduct(id: string) {
  const { deleteDoc, doc } = fb().firestore;
  await deleteDoc(doc(db(), 'products', id));
}

// ---------- Shop team ----------

export function watchMyRole(email: string, onChange: (role: Role | null) => void) {
  const { doc, onSnapshot } = fb().firestore;
  return onSnapshot(
    doc(db(), 'staff', email),
    (snap) => {
      const member = snap.data() as StaffMember | undefined;
      onChange(member?.active ? member.role : null);
    },
    () => onChange(null),
  );
}

export function watchStaff(onChange: (team: StaffMember[]) => void) {
  const { collection, onSnapshot } = fb().firestore;
  return onSnapshot(
    collection(db(), 'staff'),
    (snap) => onChange(snap.docs.map((d) => ({ ...(d.data() as StaffMember), email: d.id }))),
    ignore,
  );
}

export async function saveStaff(member: StaffMember) {
  const { doc, setDoc } = fb().firestore;
  const { email, ...data } = member;
  await setDoc(doc(db(), 'staff', email), clean(data));
}

export async function removeStaff(email: string) {
  const { deleteDoc, doc } = fb().firestore;
  await deleteDoc(doc(db(), 'staff', email));
}

// ---------- All orders and requests (shop admins) ----------

export function watchAllOrders(onChange: (orders: Order[]) => void) {
  const { collection, onSnapshot } = fb().firestore;
  return onSnapshot(
    collection(db(), 'orders'),
    (snap) => onChange(snap.docs.map((d) => d.data() as Order).sort(newestFirst)),
    ignore,
  );
}

export function watchAllRequests(onChange: (requests: PrivateRequest[]) => void) {
  const { collection, onSnapshot } = fb().firestore;
  return onSnapshot(
    collection(db(), 'requests'),
    (snap) => onChange(snap.docs.map((d) => d.data() as PrivateRequest).sort(newestFirst)),
    ignore,
  );
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  const { doc, updateDoc } = fb().firestore;
  await updateDoc(doc(db(), 'orders', id), { status, updatedAt: Date.now() });
}

export async function setRequestStatus(id: string, status: RequestStatus) {
  const { doc, updateDoc } = fb().firestore;
  await updateDoc(doc(db(), 'requests', id), { status, updatedAt: Date.now() });
}
