import { useState, useEffect } from 'react';
import { Item } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LIKED_ITEMS_KEY = 'liked_items';

export const useLikedItems = () => {
  const [likedItems, setLikedItems] = useState<Item[]>([]);

  useEffect(() => {
    loadLikedItems();
  }, []);

  const loadLikedItems = async () => {
    try {
      const stored = await AsyncStorage.getItem(LIKED_ITEMS_KEY);
      if (stored) {
        setLikedItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading liked items:', error);
    }
  };

  const addLikedItem = async (item: Item) => {
    try {
      // Check if item already exists to avoid duplicates
      const existingItem = likedItems.find(likedItem => likedItem.id === item.id);
      if (!existingItem) {
        const updatedItems = [...likedItems, item];
        setLikedItems(updatedItems);
        await AsyncStorage.setItem(LIKED_ITEMS_KEY, JSON.stringify(updatedItems));
        console.log("Item added to likes:", item.id);
      }
    } catch (error) {
      console.error('Error saving liked item:', error);
    }
  };

  const removeLikedItem = async (itemId: string) => {
    try {
      const updatedItems = likedItems.filter(item => item.id !== itemId);
      setLikedItems(updatedItems);
      await AsyncStorage.setItem(LIKED_ITEMS_KEY, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error removing liked item:', error);
    }
  };

  const getLikedItems = () => likedItems;

  const clearLikedItems = async () => {
    try {
      setLikedItems([]);
      await AsyncStorage.removeItem(LIKED_ITEMS_KEY);
    } catch (error) {
      console.error('Error clearing liked items:', error);
    }
  };

  const isItemLiked = (itemId: string) => {
    return likedItems.some(item => item.id === itemId);
  };

  return {
    likedItems,
    addLikedItem,
    removeLikedItem,
    getLikedItems,
    clearLikedItems,
    isItemLiked,
  };
};