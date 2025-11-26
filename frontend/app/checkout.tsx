import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCartStore } from '../src/state/cart';
import { useAuthStore } from '../src/state/auth';
import { useToastStore } from '../src/state/toast';
import { apiCall } from '../src/lib/api';
import { Ionicons } from '@expo/vector-icons';

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

type CheckoutFlow = 'marketplace' | 'affiliate' | 'aggregator';

export default function CheckoutScreen() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: user?.name || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple_pay'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutFlow, setCheckoutFlow] = useState<CheckoutFlow>('marketplace');

  const subtotal = getTotalPrice();
  const shipping = useMemo(() => subtotal > 75 ? 0 : 9.99, [subtotal]);
  const tax = useMemo(() => subtotal * 0.08, [subtotal]);
  const total = useMemo(() => subtotal + shipping + tax, [subtotal, shipping, tax]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  const validateForm = () => {
    const requiredFields: (keyof ShippingAddress)[] = ['name', 'street', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field]);
    if (missingFields.length > 0) {
      showToast(`Please fill in: ${missingFields.join(', ')}`, 'error');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      const orderPayload = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          // Assuming the backend can handle options or you have a way to select them
          options: item.options,
        })),
        shippingAddress,
      };

      const result = await apiCall('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });

      if (result) {
        showToast('Order placed successfully!', 'success');
        clearCart();
        router.replace('/account/orders');
      } else {
        // This path might not be hit if apiCall throws an error, but good for safety
        throw new Error('Failed to place order.');
      }
    } catch (error: any) {
      console.error('Order placement error:', error);
      const errorMessage = error?.data?.message || 'An unexpected error occurred. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCheckoutFlowSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Checkout Method</Text>
      
      <Pressable 
        style={[styles.flowOption, checkoutFlow === 'marketplace' && styles.flowOptionActive]}
        onPress={() => setCheckoutFlow('marketplace')}
      >
        <View style={styles.flowOptionContent}>
          <Text style={[styles.flowOptionTitle, checkoutFlow === 'marketplace' && styles.flowOptionTitleActive]}>
            🏪 Marketplace
          </Text>
          <Text style={styles.flowOptionDescription}>
            Direct purchase from Styl. Best prices, unified experience.
          </Text>
        </View>
        <View style={[styles.radioButton, checkoutFlow === 'marketplace' && styles.radioButtonActive]} />
      </Pressable>

      <Pressable 
        style={[styles.flowOption, checkoutFlow === 'affiliate' && styles.flowOptionActive]}
        onPress={() => setCheckoutFlow('affiliate')}
      >
        <View style={styles.flowOptionContent}>
          <Text style={[styles.flowOptionTitle, checkoutFlow === 'affiliate' && styles.flowOptionTitleActive]}>
            🔗 Brand Direct
          </Text>
          <Text style={styles.flowOptionDescription}>
            Redirect to brand websites. Support brands directly.
          </Text>
        </View>
        <View style={[styles.radioButton, checkoutFlow === 'affiliate' && styles.radioButtonActive]} />
      </Pressable>

      <Pressable 
        style={[styles.flowOption, checkoutFlow === 'aggregator' && styles.flowOptionActive]}
        onPress={() => setCheckoutFlow('aggregator')}
      >
        <View style={styles.flowOptionContent}>
          <Text style={[styles.flowOptionTitle, checkoutFlow === 'aggregator' && styles.flowOptionTitleActive]}>
            📦 Multi-Retailer
          </Text>
          <Text style={styles.flowOptionDescription}>
            Compare prices across retailers. Find best deals.
          </Text>
        </View>
        <View style={[styles.radioButton, checkoutFlow === 'aggregator' && styles.radioButtonActive]} />
      </Pressable>
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text style={styles.title}>Checkout</Text>
          <View style={{width: 24}}/>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Pressable style={styles.continueShoppingButton} onPress={() => router.push('/(tabs)/home')}>
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.title}>Checkout</Text>
        <View style={{width: 24}}/>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{paddingBottom: 100}} showsVerticalScrollIndicator={false}>
        {renderCheckoutFlowSelector()}
        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <TextInput style={styles.input} placeholder="Full Name" value={shippingAddress.name} onChangeText={(text) => setShippingAddress(p => ({ ...p, name: text }))} />
          <TextInput style={styles.input} placeholder="Street Address" value={shippingAddress.street} onChangeText={(text) => setShippingAddress(p => ({ ...p, street: text }))} />
          <View style={styles.row}>
            <TextInput style={[styles.input, {flex: 2}]} placeholder="City" value={shippingAddress.city} onChangeText={(text) => setShippingAddress(p => ({ ...p, city: text }))} />
            <TextInput style={[styles.input, {flex: 1}]} placeholder="State" value={shippingAddress.state} onChangeText={(text) => setShippingAddress(p => ({ ...p, state: text }))} />
          </View>
          <TextInput style={styles.input} placeholder="ZIP Code" value={shippingAddress.zipCode} onChangeText={(text) => setShippingAddress(p => ({ ...p, zipCode: text }))} keyboardType="number-pad" />
        </View>
        
        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            <Pressable style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]} onPress={() => setPaymentMethod('card')}>
              <Ionicons name="card-outline" size={24} color={paymentMethod === 'card' ? '#fff' : '#000'} />
              <Text style={[styles.paymentOptionText, paymentMethod === 'card' && {color: '#fff'}]}>Card</Text>
            </Pressable>
            <Pressable style={[styles.paymentOption, paymentMethod === 'paypal' && styles.paymentOptionActive]} onPress={() => setPaymentMethod('paypal')}>
              <Ionicons name="logo-paypal" size={24} color={paymentMethod === 'paypal' ? '#fff' : '#000'} />
              <Text style={[styles.paymentOptionText, paymentMethod === 'paypal' && {color: '#fff'}]}>PayPal</Text>
            </Pressable>
            <Pressable style={[styles.paymentOption, paymentMethod === 'apple_pay' && styles.paymentOptionActive]} onPress={() => setPaymentMethod('apple_pay')}>
              <Ionicons name="logo-apple" size={24} color={paymentMethod === 'apple_pay' ? '#fff' : '#000'} />
              <Text style={[styles.paymentOptionText, paymentMethod === 'apple_pay' && {color: '#fff'}]}>Apple Pay</Text>
            </Pressable>
          </View>
          <Text style={styles.paymentNote}>This is a demo. No payment will be processed.</Text>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated Tax</Text>
            <Text style={styles.summaryValue}>{formatPrice(tax)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.checkoutButton} onPress={handlePlaceOrder} disabled={isProcessing}>
          {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkoutButtonText}>Place Order</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {},
  title: { fontSize: 20, fontWeight: 'bold' },
  scrollView: { flex: 1 },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  row: { flexDirection: 'row', gap: 12 },
  paymentOptions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  paymentOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  paymentOptionActive: { backgroundColor: '#000' },
  paymentOptionText: { marginTop: 4, fontWeight: '600' },
  paymentNote: { fontSize: 12, color: '#6c757d', textAlign: 'center' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 16, color: '#495057' },
  summaryValue: { fontSize: 16, fontWeight: '500' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#e9ecef', marginTop: 8, paddingTop: 8 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold' },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  checkoutButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  continueShoppingButton: { backgroundColor: '#000', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  continueShoppingText: { color: '#fff', fontWeight: '600' },
  flowOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 12,
  },
  flowOptionActive: {
    borderColor: '#000',
    backgroundColor: '#f0f0f0',
  },
  flowOptionContent: {
    flex: 1,
  },
  flowOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  flowOptionTitleActive: {
    color: '#000',
  },
  flowOptionDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginLeft: 12,
  },
  radioButtonActive: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
});