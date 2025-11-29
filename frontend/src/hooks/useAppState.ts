// src/hooks/useAppState.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Item, Product, productToItem, isProduct, isItem } from '../types';

interface AppState {
  // Wishlist
  wishlist: Item[];
  addToWishlist: (item: Item | Product) => void;
  removeFromWishlist: (itemId: string) => void;
  isInWishlist: (itemId: string) => boolean;
  
  // Cart
  cart: Item[];
  addToCart: (item: Item | Product) => void;
  removeFromCart: (itemId: string) => void;
  isInCart: (itemId: string) => boolean;
  clearCart: () => void;
  
  // Likes
  likedItems: Item[];
  addLikedItem: (item: Item | Product) => void;
  removeLikedItem: (itemId: string) => void;
}

export const useAppState = create<AppState>()(
  persist(
    (set, get) => ({
      // Wishlist state
      wishlist: [],
      addToWishlist: (item: Item | Product) => {
        const itemToAdd: Item = isProduct(item) ? productToItem(item) : item;
        
        set((state) => {
          if (state.wishlist.find((i) => i.id === itemToAdd.id)) {
            console.log('Item already in wishlist:', itemToAdd.id);
            return state; // Item already in wishlist
          }
          console.log('Adding to wishlist:', itemToAdd);
          return { wishlist: [...state.wishlist, itemToAdd] };
        });
      },
      removeFromWishlist: (itemId: string) => {
        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== itemId),
        }));
      },
      isInWishlist: (itemId: string) => {
        return get().wishlist.some((item) => item.id === itemId);
      },

      // Cart state
      cart: [],
      addToCart: (item: Item | Product) => {
        const itemToAdd: Item = isProduct(item) ? productToItem(item) : item;
        
        set((state) => {
          if (state.cart.find((i) => i.id === itemToAdd.id)) {
            console.log('Item already in cart:', itemToAdd.id);
            return state; // Item already in cart
          }
          console.log('Adding to cart:', itemToAdd);
          return { cart: [...state.cart, itemToAdd] };
        });
      },
      removeFromCart: (itemId: string) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== itemId),
        }));
      },
      isInCart: (itemId: string) => {
        return get().cart.some((item) => item.id === itemId);
      },
      clearCart: () => {
        set({ cart: [] });
      },

      // Liked items (for swipe functionality)
      likedItems: [],
      addLikedItem: (item: Item | Product) => {
        const itemToAdd: Item = isProduct(item) ? productToItem(item) : item;
        
        set((state) => {
          if (state.likedItems.find((i) => i.id === itemToAdd.id)) {
            return state; // Item already liked
          }
          return { likedItems: [...state.likedItems, itemToAdd] };
        });
      },
      removeLikedItem: (itemId: string) => {
        set((state) => ({
          likedItems: state.likedItems.filter((item) => item.id !== itemId),
        }));
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);