import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { apiCall } from '../../src/lib/api';

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const productData = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      };

      const response = await apiCall('/api/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });

      if (response && response._id) {
        Alert.alert('Success', 'Product created successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        throw new Error(response?.message || 'Failed to create product');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Product</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g., Classic White T-Shirt" />

          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} placeholder="Describe the product" multiline />

          <Text style={styles.label}>Price</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="e.g., 24.99" keyboardType="decimal-pad" />

          <Text style={styles.label}>Stock Quantity</Text>
          <TextInput style={styles.input} value={stock} onChangeText={setStock} placeholder="e.g., 100" keyboardType="number-pad" />
        </View>

        <Pressable style={[styles.saveButton, isLoading && styles.disabledButton]} onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Product</Text>
          )}
        </Pressable>
        
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { padding: 24 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold' },
  form: { marginBottom: 24 },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: { backgroundColor: '#cccccc' },
  backButton: { marginTop: 16, alignItems: 'center' },
  backButtonText: { color: '#666666' },
});
