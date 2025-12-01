import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  StatusBar,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCustomRouter } from '../../src/hooks/useCustomRouter';
import { useCartStore } from '../../src/state/cart';
import { useAuthStore } from '../../src/state/auth';
import { useToastStore } from '../../src/state/toast';
import { apiCall } from '../../src/lib/api';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SwipeableRow from '../../src/components/SwipeableRow';
import CartItem from '../../src/components/checkout/CartItem';

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutScreen() {
  const router = useCustomRouter();
  const params = useLocalSearchParams();
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
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (params.selectedAddress) {
      setShippingAddress(JSON.parse(params.selectedAddress as string));
    }
  }, [params.selectedAddress]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, payments] = await Promise.all([
          apiCall('/api/users/profile'),
          apiCall('/api/payments/methods'),
        ]);

        if (profile && profile.addresses && profile.addresses.length > 0) {
          setAddresses(profile.addresses);
          if (!params.selectedAddress) {
            setShippingAddress(profile.addresses[0]);
          }
        }

        if (payments) {
          setPaymentMethods(payments);
          if (payments.length > 0) {
            setSelectedPaymentMethod(payments.find(pm => pm.isDefault) || payments[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        showToast('Failed to load your data. Please try again.', 'error');
      }
    };

    fetchData();
  }, []);
  
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

  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    try {
      const updatedAddresses = [...addresses];
      const index = updatedAddresses.findIndex(a => a._id === shippingAddress._id);
      if (index > -1) {
        updatedAddresses[index] = shippingAddress;
      } else {
        updatedAddresses.push(shippingAddress);
      }

      const result = await apiCall('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          addresses: updatedAddresses,
        }),
      });

      if (result) {
        showToast('Address saved successfully!', 'success');
        setAddresses(updatedAddresses);
      } else {
        throw new Error('Failed to save address.');
      }
    } catch (error: any) {
      console.error('Save address error:', error);
      const errorMessage = error?.data?.message || 'An unexpected error occurred.';
      showToast(errorMessage, 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    if (!selectedPaymentMethod) {
      showToast('Please select a payment method.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const orderPayload = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          options: item.options,
        })),
        shippingAddress,
        paymentMethod: selectedPaymentMethod,
      };

      const result = await apiCall('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });

      if (result && result.length > 0) {
        showToast('Order placed successfully!', 'success');
        clearCart();
        router.push({ pathname: '/(checkout)/order-confirmation', params: { orderId: result[0].orderNumber } });
      } else {
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

  const handleDeletePaymentMethod = async (methodId: string) => {
    try {
      const result = await apiCall(`/api/payments/methods/${methodId}`, {
        method: 'DELETE',
      });

      if (result) {
        showToast('Payment method deleted successfully!', 'success');
        setPaymentMethods(prev => prev.filter(method => method._id !== methodId));
      } else {
        throw new Error('Failed to delete payment method.');
      }
    } catch (error: any) {
      console.error('Delete payment method error:', error);
      const errorMessage = error?.data?.message || 'An unexpected error occurred.';
      showToast(errorMessage, 'error');
    }
  };

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

  const renderHeader = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items in Cart</Text>
      </View>
    </>
  );

  const renderFooter = () => (
    <>
      <View style={styles.section}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Pressable onPress={() => router.push({ pathname: '/(checkout)/select-address', params: { addresses: JSON.stringify(addresses) } })}>
            <Text style={{color: '#007bff'}}>Select</Text>
          </Pressable>
          <Pressable onPress={handleSaveAddress}>
            <Text style={{color: '#007bff', marginLeft: 10}}>Save</Text>
          </Pressable>
        </View>
        <TextInput style={styles.input} placeholder="Full Name" value={shippingAddress.name} onChangeText={(text) => setShippingAddress(p => ({ ...p, name: text }))} />
        <TextInput style={styles.input} placeholder="Street Address" value={shippingAddress.street} onChangeText={(text) => setShippingAddress(p => ({ ...p, street: text }))} />
        <View style={styles.row}>
          <TextInput style={[styles.input, {flex: 2}]} placeholder="City" value={shippingAddress.city} onChangeText={(text) => setShippingAddress(p => ({ ...p, city: text }))} />
          <TextInput style={[styles.input, {flex: 1}]} placeholder="State" value={shippingAddress.state} onChangeText={(text) => setShippingAddress(p => ({ ...p, state: text }))} />
        </View>
        <TextInput style={styles.input} placeholder="ZIP Code" value={shippingAddress.zipCode} onChangeText={(text) => setShippingAddress(p => ({ ...p, zipCode: text }))} keyboardType="number-pad" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {paymentMethods.map(method => (
          <SwipeableRow key={method._id} onDelete={() => handleDeletePaymentMethod(method._id)}>
            <Pressable style={[styles.paymentOption, selectedPaymentMethod?._id === method._id && styles.paymentOptionActive]} onPress={() => setSelectedPaymentMethod(method)}>
              <Ionicons name="card-outline" size={24} color={selectedPaymentMethod?._id === method._id ? '#fff' : '#000'} />
              <Text style={[styles.paymentOptionText, selectedPaymentMethod?._id === method._id && {color: '#fff'}]}>{method.brand} ending in {method.last4}</Text>
            </Pressable>
          </SwipeableRow>
        ))}
        <Pressable style={styles.addCardButton} onPress={() => router.push('/add-payment-method')}>
          <Ionicons name="add-circle-outline" size={24} color="#007bff" />
          <Text style={styles.addCardButtonText}>Add New Card</Text>
        </Pressable>
      </View>

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
    </>
  );

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

      <FlatList
        data={items}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}
      />

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
  title: { fontSize: 20, fontFamily: 'JosefinSans_600SemiBold' },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, marginBottom: 16, fontFamily: 'JosefinSans_600SemiBold' },
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
  paymentOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
  },
  paymentOptionActive: { backgroundColor: '#000' },
  paymentOptionText: { marginTop: 4, marginLeft: 10, fontFamily: 'JosefinSans_500Medium' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 16, color: '#495057', fontFamily: 'JosefinSans_400Regular' },
  summaryValue: { fontSize: 16, fontFamily: 'JosefinSans_500Medium' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#e9ecef', marginTop: 8, paddingTop: 8 },
  totalLabel: { fontSize: 18, fontFamily: 'JosefinSans_600SemiBold' },
  totalValue: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold' },
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
  checkoutButtonText: { color: '#fff', fontSize: 16, fontFamily: 'JosefinSans_600SemiBold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 20, marginBottom: 12, fontFamily: 'JosefinSans_600SemiBold' },
  continueShoppingButton: { backgroundColor: '#000', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  continueShoppingText: { color: '#fff', fontFamily: 'JosefinSans_600SemiBold' },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    marginTop: 10,
  },
  addCardButtonText: {
    color: '#007bff',
    marginLeft: 10,
    fontFamily: 'JosefinSans_600SemiBold',
  },
});