// src/hooks/useLikedItems.ts
import { useAppState } from './useAppState';
import { Item } from '../types';

export const useLikedItems = () => {
  const { addLikedItem, likedItems } = useAppState();

  return {
    addLikedItem,
    likedItems,
  };
};