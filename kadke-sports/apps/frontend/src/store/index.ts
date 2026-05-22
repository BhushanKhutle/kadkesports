import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { User, CartItem } from '@/types';

// ─── User ─────────────────────────────────────
interface UserState { user: User | null; }
const userSlice = createSlice({
  name: 'user',
  initialState: { user: null } as UserState,
  reducers: {
    setUser: (s, a: PayloadAction<User | null>) => { s.user = a.payload; },
    logout: (s) => { s.user = null; },
  },
});
export const { setUser, logout } = userSlice.actions;

// ─── Cart ─────────────────────────────────────
interface CartState { items: CartItem[]; subtotal: number; count: number; }
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], subtotal: 0, count: 0 } as CartState,
  reducers: {
    setCart: (s, a: PayloadAction<{ items: CartItem[]; subtotal: number; count: number }>) => {
      s.items = a.payload.items; s.subtotal = a.payload.subtotal; s.count = a.payload.count;
    },
    clearCart: (s) => { s.items = []; s.subtotal = 0; s.count = 0; },
  },
});
export const { setCart, clearCart } = cartSlice.actions;

// ─── Wishlist ─────────────────────────────────
interface WishlistState { productIds: string[]; }
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { productIds: [] } as WishlistState,
  reducers: {
    setWishlist: (s, a: PayloadAction<string[]>) => { s.productIds = a.payload; },
    toggle: (s, a: PayloadAction<string>) => {
      const id = a.payload;
      s.productIds = s.productIds.includes(id) ? s.productIds.filter(x => x !== id) : [...s.productIds, id];
    },
  },
});
export const { setWishlist, toggle: toggleWishlist } = wishlistSlice.actions;

export const store = configureStore({
  reducer: { user: userSlice.reducer, cart: cartSlice.reducer, wishlist: wishlistSlice.reducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
