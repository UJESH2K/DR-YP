import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiCall } from '../../src/lib/api';

export default function ManageProductsScreen() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiCall('/api/vendors/me/products');
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        throw new Error(data?.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.productItem}>
      <View>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDetails}>Price: ${item.price.toFixed(2)} | Stock: {item.stock}</Text>
      </View>
      <Pressable onPress={() => router.push(`/vendor/edit-product/${item._id}`)}>
        <Ionicons name="pencil-outline" size={24} color="#1a1a1a" />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Products</Text>
        <Pressable style={styles.addButton} onPress={() => router.push('/vendor/add-product')}>
          <Ionicons name="add-circle-outline" size={28} color="#1a1a1a" />
          <Text style={styles.addButtonText}>Add New</Text>
        </Pressable>
      </View>
      {isLoading ? (
        <ActivityIndicator style={styles.centered} size="large" />
      ) : error ? (
        <View style={styles.centered}>
          <Text>{error}</Text>
          <Pressable onPress={fetchProducts}><Text style={styles.retryText}>Retry</Text></Pressable>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>You haven't added any products yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
  },
  productDetails: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    color: 'blue',
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666666',
  },
});
