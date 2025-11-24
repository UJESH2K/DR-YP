import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { apiCall } from '../../src/lib/api';
import { useAuthStore } from '../../src/state/auth';

export default function VendorOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  const fetchOrders = useCallback(async () => {
    if (user?.role !== 'vendor') {
      setError("You are not authorized to view this page.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiCall('/api/orders/vendor');
      if (Array.isArray(data)) {
        const vendorOrders = data.map(order => {
          const vendorItems = order.items.filter(item => item.vendor.toString() === user._id);
          return { ...order, items: vendorItems };
        }).filter(order => order.items.length > 0);
        setOrders(vendorOrders);
      } else {
        throw new Error(data?.message || 'Failed to fetch orders');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
        <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.cardBody}>
        {item.items.map(productItem => (
          <View key={productItem.product._id} style={styles.productItem}>
            <Text>{productItem.product.name} (x{productItem.quantity})</Text>
            <Text>${(productItem.price * productItem.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.totalAmount}>Total: ${item.totalAmount.toFixed(2)}</Text>
        <Text style={[styles.status, styles[`status_${item.status}`]]}>{item.status}</Text>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error: {error}</Text>
        <Pressable onPress={fetchOrders}><Text style={styles.retryText}>Retry</Text></Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Orders</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>You have no orders yet.</Text>}
        onRefresh={fetchOrders}
        refreshing={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 24, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 28, fontWeight: 'bold' },
  list: { padding: 16 },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  orderNumber: { fontWeight: 'bold' },
  orderDate: { color: '#666' },
  cardBody: { marginVertical: 10 },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  totalAmount: { fontWeight: 'bold', fontSize: 16 },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  status_pending: { backgroundColor: '#f0ad4e' },
  status_delivered: { backgroundColor: '#5cb85c' },
  status_cancelled: { backgroundColor: '#d9534f' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  retryText: { color: 'blue', marginTop: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
});