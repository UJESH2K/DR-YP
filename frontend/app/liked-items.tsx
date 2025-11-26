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
import { Ionicons } from '@expo/vector-icons';
import { apiCall } from '../src/lib/api';
import type { Item } from '../src/types';
import { mapProductsToItems } from '../src/utils/productMapping';

// This screen shows items the user has 'liked' for recommendation purposes
export default function LikedItemsScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLikedItems = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch from the /api/likes endpoint
      const likedProducts = await apiCall('/api/likes');
      if (Array.isArray(likedProducts)) {
        const mappedItems = mapProductsToItems(likedProducts);
        setItems(mappedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch liked items:', error);
      Alert.alert('Error', 'Could not load your liked items. Please try again later.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLikedItems();
    }, [fetchLikedItems])
  );

  const handleUnlike = async (itemId: string, title: string) => {
    Alert.alert(
      'Remove from Liked Items',
      `This will affect your recommendations. Unlike "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlike',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await apiCall(`/api/likes/${itemId}`, { method: 'DELETE' });
              if (result && result.success) {
                setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
              } else {
                throw new Error(result?.message || 'Failed to unlike item.');
              }
            } catch (error) {
              console.error('Failed to unlike item:', error);
              Alert.alert('Error', 'Could not unlike item. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemBrand}>{item.brand}</Text>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Pressable onPress={() => handleUnlike(item.id, item.title)} style={styles.removeButton}>
          <Text style={styles.removeText}>Unlike</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><Text style={styles.headerTitle}>Liked Items</Text></View>
        <ActivityIndicator size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Liked Items ({items.length})</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Liked Items</Text>
            <Text style={styles.emptySubtitle}>Products you swipe right on will appear here.</Text>
          </View>
        }
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#ffffff',
      },
      headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
      },
      backButton: {},
      listContainer: {
        padding: 16,
      },
      itemContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
      },
      itemImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
      },
      itemDetails: {
        flex: 1,
        marginLeft: 16,
      },
      itemBrand: {
        fontSize: 12,
        color: '#888',
      },
      itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginVertical: 4,
      },
      removeButton: {
        alignSelf: 'flex-start',
        marginTop: 4,
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
        marginTop: -50,
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
      },
});
