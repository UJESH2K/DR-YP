import { create } from 'zustand';
import { Product, ProductVariant } from '../types';

interface CartItem {
  product: Product;
  variant?: ProductVariant | null;
  quantity: number;
}

interface WishlistItem {
  product: Product;
  variant?: ProductVariant | null;
}

interface CartWishlistState {
  cart: CartItem[];
  wishlist: WishlistItem[];
  
  // Cart actions
  addToCart: (product: Product, variant?: ProductVariant | null) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateCartQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  clearCart: () => void;
  
  // Wishlist actions
  addToWishlist: (product: Product, variant?: ProductVariant | null) => void;
  removeFromWishlist: (productId: string, variantId?: string) => void;
  clearWishlist: () => void;
  
  // Getters
  getCartCount: () => number;
  getWishlistCount: () => number;
  isInCart: (productId: string, variantId?: string) => boolean;
  isInWishlist: (productId: string, variantId?: string) => boolean;
}

export const useCartWishlistStore = create<CartWishlistState>((set, get) => ({
  cart: [],
  wishlist: [],

  // Cart actions
  addToCart: (product, variant = null) => {
    set((state) => {
      const existingItemIndex = state.cart.findIndex(
        item => 
          item.product.id === product.id && 
          item.variant?.id === variant?.id
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex].quantity += 1;
        return { cart: updatedCart };
      } else {
        // Add new item
        return { 
          cart: [...state.cart, { product, variant, quantity: 1 }] 
        };
      }
    });
  },

  removeFromCart: (productId, variantId) => {
    set((state) => ({
      cart: state.cart.filter(
        item => 
          !(item.product.id === productId && item.variant?.id === variantId)
      )
    }));
  },

  updateCartQuantity: (productId, variantId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId, variantId || undefined);
      return;
    }

    set((state) => ({
      cart: state.cart.map(item =>
        item.product.id === productId && item.variant?.id === variantId
          ? { ...item, quantity }
          : item
      )
    }));
  },

  clearCart: () => set({ cart: [] }),

  // Wishlist actions
  addToWishlist: (product, variant = null) => {
    set((state) => {
      const exists = state.wishlist.some(
        item => 
          item.product.id === product.id && 
          item.variant?.id === variant?.id
      );

      if (exists) {
        // Remove if already in wishlist (toggle behavior)
        return {
          wishlist: state.wishlist.filter(
            item => 
              !(item.product.id === product.id && item.variant?.id === variant?.id)
          )
        };
      } else {
        // Add to wishlist
        return { 
          wishlist: [...state.wishlist, { product, variant }] 
        };
      }
    });
  },

  removeFromWishlist: (productId, variantId) => {
    set((state) => ({
      wishlist: state.wishlist.filter(
        item => 
          !(item.product.id === productId && item.variant?.id === variantId)
      )
    }));
  },

  clearWishlist: () => set({ wishlist: [] }),

  // Getters
  getCartCount: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },

  getWishlistCount: () => {
    return get().wishlist.length;
  },

  isInCart: (productId, variantId) => {
    return get().cart.some(
      item => 
        item.product.id === productId && 
        item.variant?.id === variantId
    );
  },

  isInWishlist: (productId, variantId) => {
    return get().wishlist.some(
      item => 
        item.product.id === productId && 
        item.variant?.id === variantId
    );
  },
}));