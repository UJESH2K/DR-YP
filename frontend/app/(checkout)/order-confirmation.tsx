import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, Pressable } from 'react-native';
import { useCustomRouter } from '../../src/hooks/useCustomRouter';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiCall } from '../../src/lib/api';

export default function OrderConfirmationScreen() {
  const router = useCustomRouter();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const result = await apiCall(`/api/orders/by-number/${orderId}`);
        if (result) {
          setOrder(result);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Order not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="checkmark-circle-outline" size={100} color="green" />
        <Text style={styles.title}>Thank you for your order!</Text>
        <Text style={styles.subtitle}>
          Your order #{order.orderNumber} has been placed successfully.
        </Text>

        <View style={styles.orderDetails}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <FlatList
            data={order.items}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <Image source={{ uri: item.product.images[0] }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.product.name}</Text>
                  <Text>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>
            )}
            keyExtractor={(item) => item.product._id}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalAmount}>${order.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <Pressable style={styles.button} onPress={() => router.replace('/(tabs)/home')}>
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginTop: 20,
    fontFamily: 'JosefinSans_600SemiBold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'JosefinSans_400Regular',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'JosefinSans_600SemiBold',
  },
  orderDetails: {
    width: '100%',
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'JosefinSans_600SemiBold',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'JosefinSans_400Regular',
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond_700Bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalText: {
    fontSize: 18,
    fontFamily: 'JosefinSans_600SemiBold',
  },
  totalAmount: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond_700Bold',
  },
});
