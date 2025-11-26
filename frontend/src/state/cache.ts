import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CacheState = {
  categories: { data: string[], timestamp: number | null };
  brands: { data: string[], timestamp: number | null };
  setCategories: (data: string[]) => void;
  setBrands: (data: string[]) => void;
};

export const useCacheStore = create<CacheState>()(
  persist(
    (set) => ({
      categories: { data: [], timestamp: null },
      brands: { data: [], timestamp: null },
      setCategories: (data) => set({ categories: { data, timestamp: Date.now() } }),
      setBrands: (data) => set({ brands: { data, timestamp: Date.now() } }),
    }),
    {
      name: 'api-cache-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
