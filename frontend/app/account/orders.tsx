import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Image, // Import Image component
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCustomRouter } from '../../src/hooks/useCustomRouter';
import { useFocusEffect } from 'expo-router';
import { apiCall } from '../../src/lib/api';
import { useAuthStore } from '../../src/state/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.9:5000'; // Define API_BASE_URL

export default function OrdersScreen() {
  const router = useCustomRouter();
  const { user, isGuest, guestId } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user && (!isGuest || !guestId)) {
      setError("User not logged in or no guest session found.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall('/api/orders/mine');
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        throw new Error(data?.message || 'Failed to fetch orders');
      }
    } catch (e) {
      console.error("Failed to fetch user orders:", e);
      setError(e.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [user, isGuest, guestId]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#4CAF50';
      case 'shipped': return '#2196F3';
      case 'processing': return '#FF9800';
      case 'pending': return '#FF9800';
      default: return '#666666';
    }
  };

  const formatPrice = useCallback((price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  , []);

  const renderOrderItem = ({ item }) => (
    <View key={item._id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.orderNumber}</Text>
        <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
      
      <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      
      <View style={styles.productItemsList}>
        {item.items.map((productItem, index) => (
          <View key={index} style={styles.productItemContainer}>
            {productItem.product?.images?.[0] && (
              <Image 
                source={{ uri: `${API_BASE_URL}${productItem.product.images[0]}` }} 
                style={styles.productImage} 
              />
            )}
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{productItem.product?.name || 'Unknown Product'}</Text>
              {productItem.size && <Text style={styles.productVariant}>Size: {productItem.size}</Text>}
              <View style={styles.productQuantityPrice}>
                <Text style={styles.productQuantity}>Qty: {productItem.quantity}</Text>
                <Text style={styles.productPrice}>{formatPrice(productItem.price)}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Total: {formatPrice(item.totalAmount)}</Text>
        <Pressable style={styles.trackButton}>
          <Text style={styles.trackButtonText}>Track Order</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1a1a1a" style={styles.centered} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Pressable onPress={fetchOrders}><Text style={styles.retryText}>Retry</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={[styles.content, orders.length === 0 && styles.centered]}
        ListEmptyComponent={<Text style={styles.emptyText}>You have no orders yet.</Text>}
        refreshing={loading}
        onRefresh={fetchOrders}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20, // Adjusted for better spacing
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Zaloga',
    fontSize: 16,
    color: '#ff3b30',
    marginBottom: 10,
  },
  retryText: {
    fontFamily: 'Zaloga',
    fontSize: 16,
    color: '#007AFF',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, // Reduced shadow for cleaner look
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontFamily: 'JosefinSans_600SemiBold',
    fontSize: 18,
    color: '#1a1a1a',
  },
  orderStatus: {
    fontFamily: 'JosefinSans_600SemiBold',
    fontSize: 16,
  },
  orderDate: {
    fontFamily: 'JosefinSans_400Regular',
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  productItemsList: { // New style for the list of products in an order
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginBottom: 12,
  },
  productItemContainer: { // New style for individual product item
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fcfcfc',
    borderRadius: 8,
    padding: 8,
  },
  productImage: { // New style for product image
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: 'cover',
  },
  productDetails: { // New style for product details text container
    flex: 1,
  },
  productName: { // New style for product name
    fontFamily: 'JosefinSans_500Medium',
    fontSize: 15,
    color: '#333333',
  },
  productVariant: { // New style for product variant (size)
    fontFamily: 'JosefinSans_400Regular',
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  productQuantityPrice: { // New style for quantity and price in one row
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productQuantity: { // New style for product quantity
    fontFamily: 'JosefinSans_400Regular',
    fontSize: 14,
    color: '#6c757d',
  },
  productPrice: { // New style for product price
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 16,
    color: '#1a1a1a',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  orderTotal: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 20,
    color: '#1a1a1a',
  },
  trackButton: {
    backgroundColor: '#1a1a1a', // Consistent primary button color
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  trackButtonText: {
    fontFamily: 'JosefinSans_600SemiBold',
    color: '#ffffff',
    fontSize: 15,
  },
  emptyText: {
    fontFamily: 'JosefinSans_400Regular',
    textAlign: 'center',
    fontSize: 16,
    color: '#6c757d',
    marginTop: 20,
  },
});
