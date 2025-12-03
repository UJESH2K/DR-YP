import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCustomRouter } from '../../src/hooks/useCustomRouter';
import { apiCall } from '../../src/lib/api';
import SwipeableRow from '../../src/components/SwipeableRow';
import { useFocusEffect } from 'expo-router';

export default function PaymentScreen() {
  const router = useCustomRouter();
  const [paymentMethods, setPaymentMethods] = useState([]);

  // ... (useFocusEffect and other handlers remain the same)

  const handleAddPayment = () => {
    router.push('/account/add-payment-method');
  };
  
  // ... (rest of the component logic is the same)

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {paymentMethods.map(method => (
          <SwipeableRow key={method._id} onDelete={() => handleDeletePayment(method._id)}>
            <View style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentIcon}>{getCardIcon(method.brand)}</Text>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentBrand}>{method.brand} Card</Text>
                    <Text style={styles.cardNumber}>•••• {method.last4}</Text>
                  </View>
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              <View style={styles.paymentActions}>
                {!method.isDefault && (
                  <Pressable
                    onPress={() => handleSetDefaultPaymentMethod(method._id)}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionText}>Set as Default</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </SwipeableRow>
        ))}

        <Pressable onPress={handleAddPayment} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add New Payment Method</Text>
        </Pressable>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  addButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
    marginTop: 20,
    alignSelf: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Zaloga',
  },
  paymentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  paymentDetails: {},
  paymentBrand: {
    fontSize: 18,
    fontFamily: 'Zaloga',
    color: '#000000',
  },
  cardNumber: {
    fontSize: 16,
    fontFamily: 'Zaloga',
    color: '#666666',
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'Zaloga',
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  actionText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Zaloga',
  },
  bottomSpacing: {
    height: 100,
  },
});
