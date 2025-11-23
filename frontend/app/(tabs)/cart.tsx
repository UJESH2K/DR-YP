import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiCall } from '../../src/lib/api';
import { useCartStore, CartItem } from '../../src/state/cart';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProductDetailModal from '../../src/components/ProductDetailModal';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.9:5000';

export default function CartScreen() {
  const { items, removeFromCart, updateQuantity, updateCartItem } = useCartStore();
  const [selectedProductIdForModal, setSelectedProductIdForModal] = React.useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [productDetails, setProductDetails] = React.useState<any>({});

  const handleVariantChange = React.useCallback((cartItem: CartItem, newOptions: { [key: string]: string }) => {
    const product = productDetails[cartItem.productId];
    if (!product) return;

    const newVariant = product.variants.find((v: any) => {
      return Object.keys(newOptions).every(key => v.options[key] === newOptions[key]);
    });

    const price = newVariant?.price ?? product.basePrice;

    if (typeof price === 'number') {
      updateCartItem(cartItem.id, {
        ...cartItem,
        price,
        options: newOptions,
        image: newVariant?.images?.[0] || cartItem.image,
      });
    } else {
      console.warn("Selected variant not found or price is invalid");
    }
  }, [productDetails, updateCartItem]);

  React.useEffect(() => {
    const fetchProductDetails = async () => {
      const missingDetails = items.filter(item => !productDetails[item.productId]);
      if (missingDetails.length === 0) return;
      
      const details: any = {};
      for (const item of missingDetails) {
        try {
          const product = await apiCall(`/api/products/${item.productId}`);
          details[item.productId] = product;
        } catch (error) {
          console.error(`Failed to fetch product details for ${item.productId}:`, error);
        }
      }
      setProductDetails(prev => ({ ...prev, ...details }));
    };

    fetchProductDetails();
  }, [items]);
  
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const formatPrice = React.useCallback((price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  , []);

  const isEveryVariantSelected = React.useMemo(() => {
    return items.every(item => {
      const product = productDetails[item.productId];
      if (product && product.variants?.length > 0) {
        return item.options && Object.keys(item.options).length > 0;
      }
      return true;
    });
  }, [items, productDetails]);

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
              <View key={item.id} style={styles.itemCard}>
                <Pressable 
                  onPress={() => {
                    setSelectedProductIdForModal(item.productId);
                    setIsModalVisible(true);
                  }}
                >
                  <Image source={{ uri: `${API_BASE_URL}${item.image}` }} style={styles.itemImage} />
                </Pressable>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemBrand}>{item.brand}</Text>
                  <Text style={styles.itemTitle}>{item.title}</Text>
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
                {productDetails[item.productId] && productDetails[item.productId].variants?.length > 0 && (
                  <View style={styles.variantSelector}>
                    {productDetails[item.productId].options.map((option: any) => (
                      <View key={option.name} style={styles.optionContainer}>
                        <Text style={styles.optionTitle}>{option.name}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {option.values.map((value: string) => (
                            <Pressable
                              key={value}
                              style={[
                                styles.optionButton,
                                item.options && item.options[option.name] === value && styles.optionButtonSelected,
                              ]}
                              onPress={() => handleVariantChange(item, { ...item.options, [option.name]: value })}
                            >
                              <Text style={[
                                styles.optionText,
                                item.options && item.options[option.name] === value && styles.optionTextSelected,
                              ]}>
                                {value}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <Pressable 
              style={[styles.checkoutButton, !isEveryVariantSelected && styles.checkoutButtonDisabled]} 
              onPress={() => router.push('/checkout')}
              disabled={!isEveryVariantSelected}
            >
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
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 16 },
  itemInfo: { flex: 1 },
  itemBrand: { fontSize: 12, color: '#888', textTransform: 'uppercase' },
  itemTitle: { fontSize: 16, fontWeight: '600', marginVertical: 2 },
  itemPrice: { fontSize: 14, color: '#1a1a1a', marginTop: 8 },
  optionContainer: {
    marginTop: 8,
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  optionButtonSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  optionText: {
    color: '#000',
    fontSize: 12,
  },
  optionTextSelected: {
    color: '#fff',
  },
  variantSelector: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  itemControls: {
    position: 'absolute',
    right: 16,
    top: 16,
    alignItems: 'flex-end',
  },
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
  checkoutButtonDisabled: {
    backgroundColor: '#A9A9A9',
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
