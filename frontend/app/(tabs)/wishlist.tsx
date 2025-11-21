import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useCartStore } from '../../src/state/cart';
import { apiCall } from '../../src/lib/api';
import type { Item } from '../../src/types';
import { mapProductsToItems } from '../../src/utils/productMapping';

export default function WishlistScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const likedProducts = await apiCall('/api/wishlist');
      if (Array.isArray(likedProducts)) {
        const mappedItems = mapProductsToItems(likedProducts);
        setItems(mappedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      Alert.alert('Error', 'Could not load your wishlist. Please try again later.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // useFocusEffect will re-fetch data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, [fetchWishlist])
  );

  const handleAddToCart = (item: Item) => {
    try {
      addToCart({
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        brand: item.brand,
        quantity: 1,
      });
      Alert.alert('Success', `${item.title} added to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleRemoveFromWishlist = async (itemId: string, title: string) => {
    Alert.alert(
      'Remove from Wishlist',
      `Are you sure you want to remove "${title}" from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await apiCall(`/api/wishlist/${itemId}`, { method: 'DELETE' });
              if (result && result.success) {
                // Optimistically update the UI
                setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
                Alert.alert('Removed', `"${title}" has been removed from your wishlist.`);
              } else {
                throw new Error(result?.message || 'Failed to remove item.');
              }
            } catch (error) {
              console.error('Failed to remove from wishlist:', error);
              Alert.alert('Error', 'Could not remove item. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const renderWishlistItem = ({ item }: { item: Item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemBrand}>{item.brand}</Text>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.itemActions}>
          <Pressable onPress={() => handleAddToCart(item)} style={styles.addToCartButton}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </Pressable>
          <Pressable onPress={() => handleRemoveFromWishlist(item.id, item.title)} style={styles.removeButton}>
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><Text style={styles.headerTitle}>Wishlist</Text></View>
        <ActivityIndicator size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.header}><Text style={styles.headerTitle}>Wishlist</Text></View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>Items you like will appear here.</Text>
          <Pressable onPress={() => router.push('/(tabs)/home')} style={styles.discoverButton}>
            <Text style={styles.discoverText}>Discover Items</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}><Text style={styles.headerTitle}>Wishlist ({items.length})</Text></View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderWishlistItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  itemBrand: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 10,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  discoverButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
  },
  discoverText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});