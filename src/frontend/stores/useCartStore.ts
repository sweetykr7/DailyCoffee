'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Cart, CartItem } from '@/types';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  totalAmount: number;

  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number, selectedOptions?: Record<string, string>) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  itemCount: 0,
  totalAmount: 0,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get<Cart>('/cart');
      if (res.success && res.data) {
        const cart = res.data;
        set({
          cart,
          itemCount: cart.items.reduce((c, i) => c + i.quantity, 0),
          totalAmount: calculateTotal(cart.items),
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity, selectedOptions) => {
    const res = await api.post<Cart>('/cart', { productId, quantity, selectedOptions });
    if (res.success && res.data) {
      const cart = res.data;
      set({
        cart,
        itemCount: cart.items.reduce((c, i) => c + i.quantity, 0),
        totalAmount: calculateTotal(cart.items),
      });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    const res = await api.put<Cart>(`/cart/${itemId}`, { quantity });
    if (res.success && res.data) {
      const cart = res.data;
      set({
        cart,
        itemCount: cart.items.reduce((c, i) => c + i.quantity, 0),
        totalAmount: calculateTotal(cart.items),
      });
    }
  },

  removeItem: async (itemId) => {
    const res = await api.del<Cart>(`/cart/${itemId}`);
    if (res.success && res.data) {
      const cart = res.data;
      set({
        cart,
        itemCount: cart.items.reduce((c, i) => c + i.quantity, 0),
        totalAmount: calculateTotal(cart.items),
      });
    }
  },

  clearCart: async () => {
    const res = await api.del<Cart>('/cart');
    if (res.success && res.data) {
      set({ cart: res.data, itemCount: 0, totalAmount: 0 });
    }
  },
}));
