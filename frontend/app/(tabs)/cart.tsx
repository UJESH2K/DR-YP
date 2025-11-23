import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore, CartItem } from '../../src/state/cart';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProductDetailModal from '../../src/components/ProductDetailModal';
import VariantSelectionModal from '../../src/components/VariantSelectionModal';

export default function CartScreen() {
  const { items, removeFromCart, updateQuantity } = useCartStore();
  const [selectedProductIdForModal, setSelectedProductIdForModal] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState<CartItem | null>(null);
  const [isVariantModalVisible, setIsVariantModalVisible] = useState(false);
  
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Items you add to your cart will appear here.</Text>
        </View>
      ) : (
        <>
          <ScrollView style={styles.itemList}>
            {items.map((item) => (
              <Pressable 
                key={item.id} 
                style={styles.itemCard} 
                onPress={() => {
                  setSelectedProductIdForModal(item.productId);
                  setIsModalVisible(true);
                }}
              >
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemBrand}>{item.brand}</Text>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.options && (
                    <View>
                      <Text style={styles.itemOptions}>
                        {Object.keys(item.options).map(key => `${key}: ${item.options[key]}`).join(', ')}
                      </Text>
                      <Pressable 
                        style={styles.changeButton}
                        onPress={() => {
                          setSelectedCartItem(item);
                          setIsVariantModalVisible(true);
                        }}
                      >
                        <Text style={styles.changeButtonText}>Change</Text>
                      </Pressable>
                    </View>
                  )}
                  <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                </View>
                <View style={styles.itemControls}>
                  <View style={styles.quantityControls}>
                    <Pressable onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>
                      <Ionicons name="remove-circle-outline" size={24} color="#666" />
                    </Pressable>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <Pressable onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Ionicons name="add-circle-outline" size={24} color="#666" />
                    </Pressable>
                  </View>
                  <Pressable onPress={() => removeFromCart(item.id)}>
                    <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <Pressable style={styles.checkoutButton} onPress={() => router.push('/checkout')}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </Pressable>
          </View>
        </>
      )}
      <ProductDetailModal
        productId={selectedProductIdForModal}
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
      <VariantSelectionModal
        cartItem={selectedCartItem}
        isVisible={isVariantModalVisible}
        onClose={() => setIsVariantModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#666' },
  itemList: { flex: 1 },
  itemCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 16 },
  itemInfo: { flex: 1 },
  itemBrand: { fontSize: 12, color: '#888', textTransform: 'uppercase' },
  itemTitle: { fontSize: 16, fontWeight: '600', marginVertical: 2 },
  itemOptions: { fontSize: 12, color: '#888', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: '#1a1a1a' },
  changeButton: {
    marginTop: 4,
    paddingVertical: 2,
  },
  changeButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  itemControls: { alignItems: 'flex-end' },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: { fontSize: 16, color: '#666' },
  summaryValue: { fontSize: 18, fontWeight: 'bold' },
  checkoutButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
