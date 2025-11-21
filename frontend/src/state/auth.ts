import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from '../lib/api';
import { useToastStore } from './toast';
import { useWishlistStore } from './wishlist'; // Import the wishlist store

// This should match the User model from the backend
export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'vendor' | 'admin';
  createdAt: string;
  preferences: {
    categories: string[];
    colors: string[];
    brands: string[];
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Actions
  register: (name: string, email: string, password: string) => Promise<User | null>;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      if (response && response.token) {
        const { token, user } = response;
        set({ user, token, isAuthenticated: true });
        await AsyncStorage.setItem('user_token', token);
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
        // Clear wishlist for a new user
        useWishlistStore.getState().setWishlist([]);
        useToastStore.getState().showToast('Registered successfully!');
        return user;
      } else {
        useToastStore.getState().showToast(response?.message || 'An unknown error occurred.', 'error');
        return null;
      }
    } catch (error) {
      console.error('Error registering:', error);
      useToastStore.getState().showToast('An unexpected error occurred. Please try again.', 'error');
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response && response.token) {
        const { token, user } = response;
        set({ user, token, isAuthenticated: true });
        await AsyncStorage.setItem('user_token', token);
        await AsyncStorage.setItem('user_data', JSON.stringify(user));

        // Fetch and set wishlist
        const wishlistItems = await apiCall('/api/wishlist');
        if (Array.isArray(wishlistItems)) {
          const validWishlistProducts = wishlistItems
            .filter(item => item && item.product) // Filter out null/undefined items and items with no product
            .map(item => item.product);
          useWishlistStore.getState().setWishlist(validWishlistProducts);
        }
        
        useToastStore.getState().showToast('Logged in successfully!');
        return user;
      } else {
        useToastStore.getState().showToast(response?.message || 'Invalid credentials.', 'error');
        return null;
      }
    } catch (error) {
      console.error('Error logging in:', error);
      useToastStore.getState().showToast('An unexpected error occurred. Please try again.', 'error');
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    set({ isLoading: true });
    try {
      await AsyncStorage.removeItem('user_token');
      await AsyncStorage.removeItem('user_data');
      set({ user: null, token: null, isAuthenticated: false });
      // Clear wishlist on logout
      useWishlistStore.getState().setWishlist([]);
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('user_token');
      const userData = await AsyncStorage.getItem('user_data');
      if (token && userData) {
        const user = JSON.parse(userData);
        set({ user, token, isAuthenticated: true });
        
        // Fetch and set wishlist
        const wishlistItems = await apiCall('/api/wishlist');
        if (Array.isArray(wishlistItems)) {
          const validWishlistProducts = wishlistItems
            .filter(item => item && item.product) // Filter out null/undefined items and items with no product
            .map(item => item.product);
          useWishlistStore.getState().setWishlist(validWishlistProducts);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: async (user: User) => {
    set({ user });
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
  },
}));