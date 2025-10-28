import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendAuth } from '../lib/api';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  preferences: {
    categories: string[];
    priceRange: { min: number; max: number };
    brands: string[];
  };
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Actions
  login: (email: string, otp: string) => Promise<boolean>;
  loginWithPhone: (phone: string, otp: string) => Promise<boolean>;
  sendOTP: (emailOrPhone: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  sendOTP: async (emailOrPhone: string) => {
    set({ isLoading: true });
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`OTP sent to ${emailOrPhone}`);
      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, otp: string) => {
    set({ isLoading: true });
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (otp === '123456') { // Mock OTP verification
        const user: User = {
          id: `user_${Date.now()}`,
          email,
          name: email.split('@')[0],
          preferences: {
            categories: [],
            priceRange: { min: 0, max: 1000 },
            brands: [],
          },
          createdAt: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
        // Send user data to backend API
        try { sendAuth(email, user.name || email.split('@')[0]) } catch {}
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithPhone: async (phone: string, otp: string) => {
    set({ isLoading: true });
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (otp === '123456') { // Mock OTP verification
        const user: User = {
          id: `user_${Date.now()}`,
          phone,
          name: `User ${phone.slice(-4)}`,
          preferences: {
            categories: [],
            priceRange: { min: 0, max: 1000 },
            brands: [],
          },
          createdAt: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
        // Send user data to backend API
        try { sendAuth(phone, user.name || `User ${phone.slice(-4)}`) } catch {}
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error logging in with phone:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  updateUser: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));