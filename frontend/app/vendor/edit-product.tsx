import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiCall } from '../../src/lib/api';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      const data = await apiCall(`/api/products/${id}`);
      if (data && !data.message) {
        // Convert tags array back to a comma-separated string for the input
        data.tags = data.tags.join(', ');
        setProduct(data);
      } else {
        Alert.alert('Error', 'Failed to fetch product details.');
      }
      setIsLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleInputChange = (field, value) => {
    setProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const { tags, ...rest } = product;
    const productData = {
        ...rest,
        tags: tags.split(',').map(t => t.trim()),
    };
    
    setIsLoading(true);
    const result = await apiCall(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    setIsLoading(false);

    if (result && !result.message) {
      Alert.alert('Success', 'Product updated successfully.');
      router.back();
    } else {
      Alert.alert('Error', result.message || 'Failed to update product.');
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} size="large" />;
  }

  if (!product) {
    return <Text style={styles.errorText}>Could not load product data.</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Edit Product</Text>
        <TextInput style={styles.input} placeholder="Product Name" value={product.name} onChangeText={v => handleInputChange('name', v)} />
        <TextInput style={styles.input} placeholder="Description" value={product.description} onChangeText={v => handleInputChange('description', v)} multiline />
        <TextInput style={styles.input} placeholder="Brand" value={product.brand} onChangeText={v => handleInputChange('brand', v)} />
        <TextInput style={styles.input} placeholder="Category" value={product.category} onChangeText={v => handleInputChange('category', v)} />
        <TextInput style={styles.input} placeholder="Tags (comma-separated)" value={product.tags} onChangeText={v => handleInputChange('tags', v)} />
        <TextInput style={styles.input} placeholder="Base Price" value={String(product.basePrice)} onChangeText={v => handleInputChange('basePrice', v)} keyboardType="numeric" />
        
        {/* Note: Variant editing is complex and will be added in a future iteration. */}
        {/* For now, we edit the simple product fields. */}
        
        <View style={styles.buttonContainer}>
          <Button title="Save Changes" onPress={handleSubmit} disabled={isLoading} />
          <Button title="Cancel" onPress={() => router.back()} color="red" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 },
  errorText: { textAlign: 'center', marginTop: 20, color: 'red' },
  buttonContainer: { marginTop: 20, flexDirection: 'row', justifyContent: 'space-around' },
});