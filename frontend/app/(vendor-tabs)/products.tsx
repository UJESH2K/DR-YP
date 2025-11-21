import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  Button,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../src/state/auth';
import { apiCall } from '../../src/lib/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.9:5000';

// --- Add Product Form Component ---
const AddProductForm = ({ visible, onClose, onProductAdded }) => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    tags: '',
    basePrice: '',
    sku: '',
    stock: '0',
  });

  const [images, setImages] = useState([]);
  const [options, setOptions] = useState([{ name: '', values: '' }]);
  const [variants, setVariants] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const { token } = useAuthStore(); // Get token from auth store

  useEffect(() => {
    generateVariants();
  }, [options]);

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setIsUploading(true);
      for (const asset of result.assets) {
        const formData = new FormData();
        const uriParts = asset.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('image', {
          uri: asset.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });

        try {
          const res = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData,
            headers: { 
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`, // Add Authorization header
            },
          });
          const data = await res.json();
          if (data.url) {
            setImages(prev => [...prev, data.url]);
          } else {
            Alert.alert('Upload Failed', data.message || 'Could not upload image.');
          }
        } catch (error) {
          Alert.alert('Upload Error', 'An error occurred while uploading.');
        }
      }
      setIsUploading(false);
    }
  };
  
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, { name: '', values: '' }]);

  const generateVariants = () => {
    if (options.length === 0 || options[0].values.trim() === '') {
      setVariants([]);
      return;
    }
    const allOptions = options.map(opt => opt.values.split(',').map(v => v.trim()).filter(Boolean));
    const getCombinations = (arrays) => {
      if (!arrays || arrays.length === 0) return [];
      let result = [[]];
      for (const arr of arrays) {
        if (arr.length === 0) continue;
        const newResult = [];
        for (const res of result) {
          for (const val of arr) {
            newResult.push([...res, val]);
          }
        }
        result = newResult;
      }
      return result;
    };
    const combinations = getCombinations(allOptions);
    const variantKeys = options.map(opt => opt.name).filter(Boolean);
    const newVariants = combinations.map(combo => {
      const optionsMap = {};
      variantKeys.forEach((key, i) => { optionsMap[key] = combo[i]; });
      return { options: optionsMap, sku: '', stock: '0', price: '' };
    });
    setVariants(newVariants);
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleSubmit = async () => {
    const productData = {
      ...product,
      basePrice: parseFloat(product.basePrice),
      tags: product.tags.split(',').map(t => t.trim()),
      stock: parseInt(product.stock, 10),
      images,
      options: options.filter(o => o.name && o.values).map(o => ({...o, values: o.values.split(',').map(v => v.trim())})),
      variants: variants.map(v => ({
        ...v,
        stock: parseInt(v.stock, 10),
        price: v.price ? parseFloat(v.price) : undefined,
      })),
    };
    
    if (productData.options.length === 0) productData.variants = [];

    const result = await apiCall('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });

    if (result && !result.message) {
      onProductAdded(result);
      onClose();
    } else {
      Alert.alert('Error', result.message || 'Failed to create product.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={formStyles.container}>
        <ScrollView>
          <Text style={formStyles.title}>Add New Product</Text>
          <TextInput style={formStyles.input} placeholder="Product Name" onChangeText={v => setProduct({...product, name: v})} />
          <TextInput style={formStyles.input} placeholder="Description" onChangeText={v => setProduct({...product, description: v})} multiline />
          <TextInput style={formStyles.input} placeholder="Brand" onChangeText={v => setProduct({...product, brand: v})} />
          <TextInput style={formStyles.input} placeholder="Category" onChangeText={v => setProduct({...product, category: v})} />
          <TextInput style={formStyles.input} placeholder="Tags (comma-separated)" onChangeText={v => setProduct({...product, tags: v})} />
          <TextInput style={formStyles.input} placeholder="Base Price" onChangeText={v => setProduct({...product, basePrice: v})} keyboardType="numeric" />

          {/* Image Upload */}
          <Text style={formStyles.subtitle}>Images</Text>
          <View style={formStyles.imagePreviewContainer}>
            {images.map((uri, index) => <Image key={index} source={{ uri: `${API_BASE_URL}${uri}` }} style={formStyles.imagePreview} />)}
          </View>
          {isUploading ? <ActivityIndicator /> : <Button title="Select Images" onPress={handleImagePick} />}

          {/* Variants Section */}
          <Text style={formStyles.subtitle}>Product Options</Text>
          {options.map((option, index) => (
            <View key={index} style={formStyles.optionContainer}>
              <TextInput style={formStyles.optionInput} placeholder="Option Name (e.g., Size)" value={option.name} onChangeText={v => handleOptionChange(index, 'name', v)} />
              <TextInput style={formStyles.optionInput} placeholder="Values (e.g., S,M,L)" value={option.values} onChangeText={v => handleOptionChange(index, 'values', v)} />
            </View>
          ))}
          <Button title="Add Option" onPress={addOption} />

          {variants.length > 0 ? (
            <>
              <Text style={formStyles.subtitle}>Variants</Text>
              {variants.map((variant, index) => (
                <View key={index} style={formStyles.variantContainer}>
                  <Text>{Object.values(variant.options).join(' / ')}</Text>
                  <TextInput style={formStyles.variantInput} placeholder="SKU" onChangeText={v => handleVariantChange(index, 'sku', v)} />
                  <TextInput style={formStyles.variantInput} placeholder="Stock" onChangeText={v => handleVariantChange(index, 'stock', v)} keyboardType="numeric" />
                  <TextInput style={formStyles.variantInput} placeholder="Price (optional)" onChangeText={v => handleVariantChange(index, 'price', v)} keyboardType="numeric" />
                </View>
              ))}
            </>
          ) : (
            <>
              <TextInput style={formStyles.input} placeholder="SKU (for simple product)" onChangeText={v => setProduct({...product, sku: v})} />
              <TextInput style={formStyles.input} placeholder="Stock (for simple product)" onChangeText={v => setProduct({...product, stock: v})} keyboardType="numeric" />
            </>
          )}

          <View style={formStyles.buttonContainer}>
            <Button title="Save Product" onPress={handleSubmit} />
            <Button title="Cancel" onPress={onClose} color="red" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// --- Main Screen ---
export default function ManageProductsScreen() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const fetchProducts = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'vendor') return;
    setIsLoading(true);
    setError(null);
    try {
      let url = `/api/products?vendor=${user._id}`;
      if (searchQuery) {
        url += `&search=${searchQuery}`;
      }
      const data = await apiCall(url);
      if (Array.isArray(data)) setProducts(data);
      else throw new Error(data?.message || 'Failed to fetch products');
    } catch (err) { setError(err.message); } 
    finally { setIsLoading(false); }
  }, [isAuthenticated, user, searchQuery]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleProductAdded = (newProduct) => setProducts(prev => [newProduct, ...prev]);

  const handleDelete = (productId) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: async () => {
            const result = await apiCall(`/api/products/${productId}`, { method: 'DELETE' });
            if (result.message === 'Product removed') {
              setProducts(prev => prev.filter(p => p._id !== productId));
            } else {
              Alert.alert('Error', result.message || 'Failed to delete product.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.productItem}>
      <Image source={{ uri: `${API_BASE_URL}${item.images[0]}` }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDetails}>Price: ${item.basePrice.toFixed(2)}</Text>
        <Text style={styles.productDetails}>Stock: {item.variants.length > 0 ? item.variants.reduce((acc, v) => acc + v.stock, 0) : item.stock}</Text>
      </View>
      <Pressable onPress={() => router.push(`/vendor/edit-product?id=${item._id}`)}>
        <Ionicons name="pencil-outline" size={24} color="#1a1a1a" />
      </Pressable>
      <Pressable onPress={() => handleDelete(item._id)} style={{ marginLeft: 16 }}>
        <Ionicons name="trash-outline" size={24} color="red" />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Products</Text>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={fetchProducts}
        />
      </View>
      <AddProductForm visible={isFormVisible} onClose={() => setIsFormVisible(false)} onProductAdded={handleProductAdded} />
      {isLoading ? <ActivityIndicator style={styles.centered} size="large" />
        : error ? <View style={styles.centered}><Text>{error}</Text><Pressable onPress={fetchProducts}><Text style={styles.retryText}>Retry</Text></Pressable></View>
        : <FlatList data={products} renderItem={renderItem} keyExtractor={item => item._id} contentContainerStyle={styles.listContent} ListEmptyComponent={<Text style={styles.emptyText}>No products yet.</Text>} onRefresh={fetchProducts} refreshing={isLoading} />}
      <Pressable style={styles.fab} onPress={() => setIsFormVisible(true)}>
        <Ionicons name="add" size={32} color="white" />
      </Pressable>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 24, fontWeight: 'bold' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#0275d8',
    borderRadius: 28,
    elevation: 8,
  },
  listContent: { padding: 16 },
  productItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, borderRadius: 8, marginBottom: 12 },
  productImage: { width: 60, height: 60, borderRadius: 8, marginRight: 16 },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600' },
  productDetails: { fontSize: 14, color: '#666666', marginTop: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  retryText: { color: 'blue', marginTop: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666666' },
});

const formStyles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 },
  optionContainer: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  optionInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 },
  variantContainer: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 5, marginBottom: 10 },
  variantInput: { borderWidth: 1, borderColor: '#eee', padding: 8, borderRadius: 5, marginTop: 5 },
  buttonContainer: { marginTop: 30, marginBottom: 50, flexDirection: 'row', justifyContent: 'space-around' },
  imagePreviewContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  imagePreview: { width: 80, height: 80, borderRadius: 5, margin: 5 },
});