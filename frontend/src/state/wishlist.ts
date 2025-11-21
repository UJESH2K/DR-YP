import { create } from 'zustand';
import { apiCall } from '../lib/api';
import { Product } from '../types'; // Assuming you have a Product type defined

interface WishlistItem extends Product {}

interface WishlistState {
  items: WishlistItem[];
  setWishlist: (items: WishlistItem[]) => void;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  setWishlist: (items) => set({ items }),
  addToWishlist: async (product) => {
    try {
      const existingItem = get().items.find(item => item._id === product._id);
      if (existingItem) return; // Don't add if it's already there

      set(state => ({ items: [...state.items, product] }));
      await apiCall('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId: product._id }),
      });
    } catch (error) {
      console.error('Failed to add item to wishlist:', error);
      // Revert state on failure
      set(state => ({ items: state.items.filter(item => item._id !== product._id) }));
    }
  },
  removeFromWishlist: async (productId) => {
    const originalItems = get().items;
    try {
      set(state => ({ items: state.items.filter(item => item._id !== productId) }));
      await apiCall(`/api/wishlist/${productId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error);
      // Revert state on failure
      set({ items: originalItems });
    }
  },
  isWishlisted: (productId) => {
    return get().items.some(item => item._id === productId);
  },
}));
