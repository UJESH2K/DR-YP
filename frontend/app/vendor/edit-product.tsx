import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useCustomRouter } from '../../src/hooks/useCustomRouter';
import { apiCall } from '../../src/lib/api';
import * as ImagePicker from 'expo-image-picker';
import { MediaTypeOptions } from 'expo-image-picker';

// ---- FONTS ----
import {
  JosefinSans_400Regular,
  JosefinSans_500Medium,
  JosefinSans_600SemiBold,
  useFonts as useJosefin,
} from "@expo-google-fonts/josefin-sans";

// Helper function to upload an image
const uploadImage = async (uri) => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri,
      name: `upload_${Date.now()}.jpg`,
      type: 'image/jpeg',
    });

    const result = await apiCall('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (result && result.url) {
      return result.url;
    } else {
      Alert.alert('Upload Failed', result.message || 'Could not upload image.');
      return null;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    Alert.alert('Upload Error', 'An error occurred during image upload.');
    return null;
  }
};

export default function EditProductScreen() {
  const [fontsLoaded] = useJosefin({
    JosefinSans_400Regular,
    JosefinSans_500Medium,
    JosefinSans_600SemiBold,
  });

  const theme = useColorScheme();
  const light = theme !== "dark";

  const { id } = useLocalSearchParams();
  const router = useCustomRouter();
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

  const handleOptionChange = (index, value) => {
    const newOptions = [...product.options];
    newOptions[index].name = value;
    setProduct(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setProduct(prev => ({
      ...prev,
      options: [...prev.options, { name: '', values: [''] }]
    }));
  };

  const removeOption = (index) => {
    const newOptions = [...product.options];
    newOptions.splice(index, 1);
    setProduct(prev => ({ ...prev, options: newOptions }));
  };

  const handleOptionValueChange = (optionIndex, valueIndex, value) => {
    const newOptions = [...product.options];
    newOptions[optionIndex].values[valueIndex] = value;
    setProduct(prev => ({ ...prev, options: newOptions }));
  };

  const addOptionValue = (optionIndex) => {
    const newOptions = [...product.options];
    newOptions[optionIndex].values.push('');
    setProduct(prev => ({ ...prev, options: newOptions }));
  };

  const removeOptionValue = (optionIndex, valueIndex) => {
    const newOptions = [...product.options];
    newOptions[optionIndex].values.splice(valueIndex, 1);
    setProduct(prev => ({ ...prev, options: newOptions }));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...product.variants];
    newVariants[index][field] = value;
    setProduct(prev => ({ ...prev, variants: newVariants }));
  };

  const generateVariants = () => {
    if (!product.options || product.options.length === 0) {
      Alert.alert("No options", "Please add product options before generating variants.");
      return;
    }

    const options = product.options.filter(o => o.name.trim() && o.values.length > 0 && o.values.some(v => v.trim()));
    if (options.length === 0) {
      Alert.alert("No values", "Please ensure all options have a name and at least one value.");
      return;
    }

    const combinations = options.reduce((acc, option) => {
      if (acc.length === 0) {
        return option.values.map(value => ({ [option.name]: value }));
      }
      const newAcc = [];
      acc.forEach(combo => {
        option.values.forEach(value => {
          newAcc.push({ ...combo, [option.name]: value });
        });
      });
      return newAcc;
    }, []);

    const newVariants = combinations.map(combo => {
      // Preserve existing variant data if it matches the combination
      const existingVariant = product.variants.find(v => {
        const keys = Object.keys(combo);
        if (keys.length !== Object.keys(v.options).length) return false;
        return keys.every(key => v.options[key] === combo[key]);
      });

      return {
        options: combo,
        sku: existingVariant?.sku || '',
        stock: existingVariant?.stock || 0,
        price: existingVariant?.price,
        images: existingVariant?.images || [],
      };
    });

    setProduct(prev => ({ ...prev, variants: newVariants }));
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    const newVariants = [...product.variants];
    newVariants[variantIndex].images.splice(imageIndex, 1);
    setProduct(prev => ({ ...prev, variants: newVariants }));
  };

  const pickAndUploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return [];
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true, // Allow multiple images
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Upload all selected images
      const uploadPromises = result.assets.map(asset => uploadImage(asset.uri));
      const uploadedUrls = await Promise.all(uploadPromises);
      return uploadedUrls.filter(url => url !== null); // Filter out any failed uploads
    }
    return [];
  };

  const addMainImage = async () => {
    setIsLoading(true);
    const imageUrls = await pickAndUploadImage();
    if (imageUrls.length > 0) {
      setProduct(prev => ({ ...prev, images: [...prev.images, ...imageUrls] }));
    }
    setIsLoading(false);
  };

  const removeMainImage = (indexToRemove) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const addVariantImage = async (variantIndex) => {
    setIsLoading(true);
    const imageUrls = await pickAndUploadImage();
    if (imageUrls.length > 0) {
      const newVariants = [...product.variants];
      newVariants[variantIndex].images.push(...imageUrls);
      setProduct(prev => ({ ...prev, variants: newVariants }));
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    const { tags, basePrice, stock, options, variants, ...rest } = product;

    const productData = {
        ...rest,
        tags: tags.split(',').map(t => t.trim()),
        basePrice: Number(basePrice) || 0,
        stock: Number(stock) || 0,
        options: options.filter(option => option.name.trim() && option.values.some(v => v.trim())), // Filter out empty options
        variants: variants.map(variant => ({
          ...variant,
          stock: Number(variant.stock) || 0,
          price: variant.price !== undefined && variant.price !== '' ? Number(variant.price) : undefined,
          options: Object.fromEntries(Object.entries(variant.options).filter(([key, value]) => key.trim() && value.trim()))
        })).filter(variant => Object.keys(variant.options).length > 0 && variant.stock >= 0) // Filter out variants with empty options or negative stock
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

  if (!fontsLoaded) return null;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: light ? "#fff" : "#000" }]}>
        <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} size="large" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: light ? "#fff" : "#000" }]}>
        <Text style={[styles.errorText, { color: light ? "#111" : "#fff", fontFamily: "JosefinSans_400Regular" }]}>
          Could not load product data.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: light ? "#fff" : "#000" }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollWrap}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[
              styles.title,
              { color: light ? "#111" : "#fff", fontFamily: "JosefinSans_600SemiBold" },
            ]}
          >
            Edit Product
          </Text>
        <TextInput style={[styles.input, light ? styles.inputLight : styles.inputDark]} placeholder="Product Name" value={product.name} onChangeText={v => handleInputChange('name', v)} />
        <TextInput style={[styles.input, light ? styles.inputLight : styles.inputDark]} placeholder="Description" value={product.description} onChangeText={v => handleInputChange('description', v)} multiline />
        <TextInput style={[styles.input, light ? styles.inputLight : styles.inputDark]} placeholder="Brand" value={product.brand} onChangeText={v => handleInputChange('brand', v)} />
        <TextInput style={[styles.input, light ? styles.inputLight : styles.inputDark]} placeholder="Category" value={product.category} onChangeText={v => handleInputChange('category', v)} />
        <TextInput style={[styles.input, light ? styles.inputLight : styles.inputDark]} placeholder="Tags (comma-separated)" value={product.tags} onChangeText={v => handleInputChange('tags', v)} />
        <TextInput style={[styles.input, light ? styles.inputLight : styles.inputDark]} placeholder="Base Price" value={String(product.basePrice)} onChangeText={v => handleInputChange('basePrice', v)} keyboardType="numeric" />
        <TextInput style={[styles.input, light ? styles.inputLight : styles.inputDark]} placeholder="SKU" value={product.sku} onChangeText={v => handleInputChange('sku', v)} />
        <TextInput style={[styles.input, light ? styles.inputLight : styles.inputDark]} placeholder="Stock" value={String(product.stock)} onChangeText={v => handleInputChange('stock', v)} keyboardType="numeric" />
        
        <View style={styles.switchContainer}>
          <Text>Is Active</Text>
          <Switch
            value={product.isActive}
            onValueChange={v => handleInputChange('isActive', v)}
          />
        </View>

        <View style={styles.imageContainer}>
          <Text style={[styles.subTitle, { color: light ? "#111" : "#fff", fontFamily: "JosefinSans_600SemiBold" }]}>Product Images</Text>
          <View style={styles.imageList}>
            {product.images && product.images.map((url, index) => (
              <View key={index} style={{ position: 'relative' }}>
                <Image source={{ uri: url }} style={styles.image} />
                <Pressable
                  style={[styles.secondaryButton, { width: 30, height: 30, paddingVertical: 0, margin: 5 }]}
                  onPress={() => removeMainImage(index)}
                >
                  <Text style={[styles.secondaryButtonText, { fontSize: 12 }]}>X</Text>
                </Pressable>
              </View>
            ))}
          </View>
          <Pressable
            style={[styles.primaryButton, { width: 'auto', alignSelf: 'flex-start' }]}
            onPress={addMainImage}
          >
            <Text style={[styles.primaryButtonText, { fontFamily: "JosefinSans_600SemiBold" }]}>
              Add Images
            </Text>
          </Pressable>
        </View>
        
        {/* Options & Variants Section */}
        <View style={styles.optionsContainer}>
          <Text style={styles.subTitle}>Product Options</Text>
          {product.options && product.options.map((option, optionIndex) => (
            <View key={optionIndex} style={styles.optionCard}>
              <View style={styles.optionHeader}>
                <TextInput
                  style={styles.optionInput}
                  placeholder="Option Name (e.g., Color)"
                  value={option.name}
                  onChangeText={text => handleOptionChange(optionIndex, text)}
                />
                <Button title="Remove" onPress={() => removeOption(optionIndex)} color="red" />
              </View>
              {option.values.map((value, valueIndex) => (
                <View key={valueIndex} style={styles.valueInputContainer}>
                  <TextInput
                    style={styles.valueInput}
                    placeholder="Value (e.g., Red)"
                    value={value}
                    onChangeText={text => handleOptionValueChange(optionIndex, valueIndex, text)}
                  />
                  <Pressable
                    style={[styles.secondaryButton, { backgroundColor: 'gray', width: 30, height: 30, paddingVertical: 0 }]}
                    onPress={() => removeOptionValue(optionIndex, valueIndex)}
                  >
                    <Text style={[styles.secondaryButtonText, { fontSize: 12 }]}>-</Text>
                  </Pressable>
                </View>
              ))}
              <Pressable
                style={[styles.primaryButton, { width: 'auto', alignSelf: 'flex-start' }]}
                onPress={() => addOptionValue(optionIndex)}
              >
                <Text style={[styles.primaryButtonText, { fontFamily: "JosefinSans_600SemiBold" }]}>Add Value</Text>
              </Pressable>
            </View>
          ))}
          <Pressable
            style={[styles.primaryButton, { width: 'auto', alignSelf: 'flex-start' }]}
            onPress={addOption}
          >
            <Text style={[styles.primaryButtonText, { fontFamily: "JosefinSans_600SemiBold" }]}>Add Option</Text>
          </Pressable>

          <View style={{ marginTop: 20 }}>
            <Pressable
              style={[styles.primaryButton, { width: 'auto', alignSelf: 'flex-start' }]}
              onPress={generateVariants}
            >
              <Text style={[styles.primaryButtonText, { fontFamily: "JosefinSans_600SemiBold" }]}>Generate Variants</Text>
            </Pressable>
          </View>
        </View>

        {product.variants && product.variants.length > 0 && (
          <View style={styles.variantsContainer}>
            <Text style={styles.subTitle}>Variants</Text>
            {product.variants.map((variant, index) => (
              <View key={index} style={styles.variantCard}>
                <Text style={styles.variantDetails}>
                  {Object.entries(variant.options).map(([key, value]) => `${key}: ${value}`).join(' / ')}
                </Text>
                <TextInput
                  style={styles.variantInput}
                  placeholder="Variant SKU"
                  value={variant.sku}
                  onChangeText={text => handleVariantChange(index, 'sku', text)}
                />
                <TextInput
                  style={styles.variantInput}
                  placeholder="Stock"
                  value={String(variant.stock)}
                  keyboardType="numeric"
                  onChangeText={text => handleVariantChange(index, 'stock', Number(text) || 0)}
                />
                <TextInput
                  style={styles.variantInput}
                  placeholder="Price (optional)"
                  value={variant.price !== undefined ? String(variant.price) : ''}
                  keyboardType="numeric"
                  onChangeText={text => handleVariantChange(index, 'price', Number(text) || undefined)}
                />
                
                {/* Variant Images */}
                <View style={styles.imageList}>
                  {variant.images.map((imgUrl, imgIndex) => (
                    <View key={imgIndex} style={{ position: 'relative' }}>
                      <Image source={{ uri: imgUrl }} style={styles.image} />
                      <Pressable
                        style={[styles.secondaryButton, { width: 30, height: 30, paddingVertical: 0, margin: 5 }]}
                        onPress={() => removeVariantImage(index, imgIndex)}
                      >
                        <Text style={[styles.secondaryButtonText, { fontSize: 12 }]}>X</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
                <Pressable
                  style={[styles.primaryButton, { width: 'auto', alignSelf: 'flex-start' }]}
                  onPress={() => addVariantImage(index)}
                >
                  <Text style={[styles.primaryButtonText, { fontFamily: "JosefinSans_600SemiBold" }]}>Add Variant Image</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.primaryButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[
                  styles.primaryButtonText,
                  { fontFamily: "JosefinSans_600SemiBold" },
                ]}
              >
                Save Changes
              </Text>
            )}
          </Pressable>
          <Pressable
            style={[styles.secondaryButton]}
            onPress={() => router.back()}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                { fontFamily: "JosefinSans_500Medium" },
              ]}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollWrap: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexGrow: 1,
  },

  title: {
    fontSize: 26,
    marginTop: 2,
    marginBottom: 20,
  },

  input: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 12,
  },

  inputLight: {
    backgroundColor: "#f7f7f7",
    borderColor: "#ddd",
    color: "#111",
  },

  inputDark: {
    backgroundColor: "#111",
    borderColor: "#333",
    color: "#fff",
  },

  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },

  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },

  subTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },

  imageContainer: { marginBottom: 20 },
  imageList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  image: { width: 100, height: 100, borderRadius: 5, margin: 5, borderWidth: 1, borderColor: '#ccc' },

  optionsContainer: { marginVertical: 20 },
  optionCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  valueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  valueInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },

  variantsContainer: { marginVertical: 20 },
  variantCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  variantDetails: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  variantInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },

  errorText: { textAlign: 'center', marginTop: 20, color: 'red' },

  primaryButton: {
    backgroundColor: "#4A6BFF",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
  },

  secondaryButton: {
    backgroundColor: "#f7f7f7",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  secondaryButtonText: {
    color: "#111",
    fontSize: 16,
  },

  buttonContainer: { marginTop: 20, flexDirection: 'row', justifyContent: 'space-around' },
});
