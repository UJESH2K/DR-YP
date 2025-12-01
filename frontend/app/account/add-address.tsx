import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { apiCall } from '../../src/lib/api';
import { useToastStore } from '../../src/state/toast';
import { Ionicons } from '@expo/vector-icons';
import { useCustomRouter } from '../../src/hooks/useCustomRouter';

export default function AddAddressScreen() {
  const router = useCustomRouter();
  const [address, setAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  const handleAddAddress = async () => {
    if (!address.name || !address.street || !address.city || !address.state || !address.zipCode) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const profile = await apiCall('/api/users/profile');
      const existingAddresses = profile.addresses || [];

      const result = await apiCall('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          addresses: [...existingAddresses, address],
        }),
      });

      if (result) {
        showToast('Address added successfully!', 'success');
        router.back();
      } else {
        throw new Error('Failed to add address.');
      }
    } catch (error: any) {
      console.error('Add address error:', error);
      const errorMessage = error?.data?.message || 'An unexpected error occurred.';
      showToast(errorMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.title}>Add New Address</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={address.name}
          onChangeText={(text) => setAddress(p => ({ ...p, name: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Street Address"
          value={address.street}
          onChangeText={(text) => setAddress(p => ({ ...p, street: text }))}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            placeholder="City"
            value={address.city}
            onChangeText={(text) => setAddress(p => ({ ...p, city: text }))}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="State"
            value={address.state}
            onChangeText={(text) => setAddress(p => ({ ...p, state: text }))}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="ZIP Code"
          keyboardType="number-pad"
          value={address.zipCode}
          onChangeText={(text) => setAddress(p => ({ ...p, zipCode: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Country"
          value={address.country}
          onChangeText={(text) => setAddress(p => ({ ...p, country: text }))}
        />

        <Pressable style={styles.addButton} onPress={handleAddAddress} disabled={isProcessing}>
          {isProcessing ? <Text>Adding...</Text> : <Text style={styles.addButtonText}>Add Address</Text>}
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
  form: { padding: 16 },
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
  addButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
