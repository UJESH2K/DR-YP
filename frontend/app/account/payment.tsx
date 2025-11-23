import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCustomRouter } from '../../src/hooks/useCustomRouter'

export default function PaymentScreen() {
  const router = useCustomRouter()

  const [paymentMethods] = useState([
    {
      id: 1,
      type: 'Credit Card',
      brand: 'Visa',
      last4: '4242',
      expiry: '12/26',
      isDefault: true,
    },
    {
      id: 2,
      type: 'Credit Card',
      brand: 'Mastercard',
      last4: '8888',
      expiry: '08/25',
      isDefault: false,
    },
    {
      id: 3,
      type: 'Digital Wallet',
      brand: 'PayPal',
      email: 'john.doe@email.com',
      isDefault: false,
    },
  ])

  const getCardIcon = (brand: string) => {
    switch (brand) {
      case 'Visa': return '💳'
      case 'Mastercard': return '💳'
      case 'PayPal': return '💰'
      default: return '💳'
    }
  }

  const handleEditPayment = (id: number) => {
    Alert.alert('Edit Payment', `Edit payment method ${id}`)
  }

  const handleDeletePayment = (id: number) => {
    Alert.alert('Delete Payment Method', `Delete payment method ${id}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive' },
    ])
  }

  const handleAddPayment = () => {
    Alert.alert('Add Payment Method', 'Add new payment method functionality')
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <Pressable onPress={handleAddPayment} style={styles.addButton}>
          <Text style={styles.addText}>+</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {paymentMethods.map((method) => (
          <View key={method.id} style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentIcon}>{getCardIcon(method.brand)}</Text>
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentBrand}>{method.brand}</Text>
                  <Text style={styles.paymentType}>{method.type}</Text>
                </View>
              </View>
              
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
            
            {method.last4 ? (
              <View style={styles.cardInfo}>
                <Text style={styles.cardNumber}>•••• •••• •••• {method.last4}</Text>
                <Text style={styles.cardExpiry}>Expires {method.expiry}</Text>
              </View>
            ) : (
              <Text style={styles.paymentEmail}>{method.email}</Text>
            )}
            
            <View style={styles.paymentActions}>
              <Pressable 
                onPress={() => handleEditPayment(method.id)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              <Pressable 
                onPress={() => handleDeletePayment(method.id)}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Text style={[styles.actionText, styles.deleteText]}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ))}
        
        <View style={styles.securityInfo}>
          <Text style={styles.securityTitle}>🔒 Security</Text>
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure. We never store your full card details.
          </Text>
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  backText: {
    fontSize: 24,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '300',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
    fontSize: 24,
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  paymentType: {
    fontSize: 14,
    color: '#666666',
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  cardInfo: {
    marginBottom: 12,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 14,
    color: '#666666',
  },
  paymentEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  deleteText: {
    color: '#f44336',
  },
  securityInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
})
