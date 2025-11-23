import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiCall, sendInteraction } from '../lib/api';
import { useCartStore } from '../../src/state/cart';
import { useWishlistStore } from '../../src/state/wishlist';
import { useAuthStore } from '../../src/state/auth';
import type { Product } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.4;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.9:5000';

interface ProductDetailModalProps {
  productId: string | null;
  isVisible: boolean;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ productId, isVisible, onClose }) => {
  const addToCart = useCartStore((s) => s.addToCart);
  const cartItems = useCartStore((s) => s.items);
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlistStore();


  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [displayImages, setDisplayImages] = useState<string[]>([]);
  const [recentlyAddedToCart, setRecentlyAddedToCart] = useState<Set<string>>(new Set());

  const detailsPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const isProductInWishlist = isWishlisted(productId || '');


  useEffect(() => {
    if (isVisible && productId) {
      setLoading(true);
      fetchProductDetails(productId);
      Animated.spring(detailsPosition, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
    } else if (!isVisible) {
      Animated.spring(detailsPosition, { toValue: SCREEN_HEIGHT, useNativeDriver: true, bounciness: 0 }).start(() => {
        setProduct(null);
        setSelectedOptions({});
        setSelectedVariant(null);
        setActiveImageIndex(0);
        setDisplayImages([]);
      });
    }
  }, [isVisible, productId]);

  useEffect(() => {
    if (product?.options?.length > 0 && product.variants?.length > 0) {
      if (Object.keys(selectedOptions).length === product.options.length) {
        const variant = product.variants.find((v: any) =>
          Object.keys(selectedOptions).every(key => v.options && v.options[key] === selectedOptions[key])
        );
        setSelectedVariant(variant || null);
      } else {
        setSelectedVariant(null);
      }
    } else {
      setSelectedVariant(null);
    }
  }, [selectedOptions, product]);

  useEffect(() => {
    if (product) {
      const selectedColor = selectedOptions['Color'];
      if (selectedColor) {
        const variantWithColor = product.variants.find(v => v.options.Color === selectedColor);
        if (variantWithColor && variantWithColor.images && variantWithColor.images.length > 0) {
          setDisplayImages(variantWithColor.images);
          return;
        }
      }
      setDisplayImages(product.images || []);
    } else {
      setDisplayImages([]);
    }
  }, [selectedOptions, product]);


  const fetchProductDetails = async (id: string) => {
    try {
      const productData = await apiCall(`/api/products/${id}`);
      if (productData) {
        setProduct(productData);
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      Alert.alert('Error', 'Failed to load product details.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = useCallback((name: string, value: any) => {
    setSelectedOptions(prev => ({ ...prev, [name]: value }));
  }, []);

  const onImageScroll = useCallback((event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollX / SCREEN_WIDTH);
    setActiveImageIndex(newIndex);
  }, []);

  const formatPrice = useCallback((price: number) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    } catch (e) {
      return `$${(price || 0).toFixed(2)}`;
    }
  }, []);

  const handleAddToWishlist = async () => {
    if (!product) return;
    try {
      if (isProductInWishlist) {
        await removeFromWishlist(product._id);
        Alert.alert('Success', `${product.name} removed from your wishlist!`);
      } else {
        await addToWishlist(product);
        Alert.alert('Success', `${product.name} added to your wishlist!`);
      }
    } catch (error) {
      console.warn(error);
      Alert.alert('Error', 'Could not update wishlist.');
    }
  };

  const isItemInCart = useCallback((itemId: string) => {
    return cartItems.some(item => item.productId === itemId) || recentlyAddedToCart.has(itemId);
  }, [cartItems, recentlyAddedToCart]);


  const handleAddToCart = useCallback(() => {
    if (!product) return;

    const hasVariants = product.options && product.options.length > 0;
    if (hasVariants && !selectedVariant) {
      Alert.alert('Please select options', 'You must select all available options before adding to cart.');
      return;
    }

    const availableStock = selectedVariant
      ? selectedVariant.stock
      : product.stock;
    
    if (availableStock === 0) {
      Alert.alert('Out of Stock', 'This item is currently out of stock.');
      return;
    }

    try {
      addToCart({
        productId: product._id,
        title: product.name,
        brand: product.brand,
        image: product.images[0],
        price: selectedVariant?.price ?? product.basePrice,
        options: hasVariants ? selectedOptions : undefined,
        quantity: 1,
      });
      
      setRecentlyAddedToCart(prev => new Set(prev).add(product._id));
      
      setTimeout(() => {
        setRecentlyAddedToCart(prev => {
          const newSet = new Set(prev);
          newSet.delete(product._id);
          return newSet;
        });
      }, 3000);
      
      Alert.alert('Success', `${product.name} added to cart!`);
    } catch (error) {
      console.warn(error);
      Alert.alert('Error', 'Failed to add item to cart.');
    }
  }, [product, selectedVariant, selectedOptions, addToCart, recentlyAddedToCart]);

  const renderImageIndicators = () => {
    if (displayImages.length <= 1) return null;

    return (
      <View style={styles.imageIndicatorsContainer}>
        {displayImages.map((_: any, index: number) => (
          <View
            key={index}
            style={[
              styles.imageIndicator,
              index === activeImageIndex ? styles.imageIndicatorActive : styles.imageIndicatorInactive
            ]}
          />
        ))}
      </View>
    );
  };

  if (!isVisible) return null;

  if (loading || !product) {
    return (
      <Animated.View style={[styles.detailsView, { transform: [{ translateY: detailsPosition }] }]}>
        <ActivityIndicator size="large" style={styles.centered} />
      </Animated.View>
    );
  }

  const stockStatus = selectedVariant
    ? (selectedVariant.stock > 0 ? 'In Stock' : 'Out of Stock')
    : (product.stock > 0 ? 'In Stock' : 'Out of Stock');

  const hasVariants = product.options && product.options.length > 0;
  const bottomPadding = 24 + (insets.bottom || 0) + 80;

  return (
    <Animated.View
      style={[styles.detailsView, { transform: [{ translateY: detailsPosition }] }]}
      accessibilityViewIsModal
    >
      <Pressable onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close-circle" size={36} color="#333" />
      </Pressable>
      
      <ScrollView
        contentContainerStyle={[styles.detailsContent, { paddingBottom: bottomPadding }]}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        {/* Image area */}
        <View style={styles.imageWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onImageScroll}
            scrollEventThrottle={16}
            style={styles.detailsImageCarousel}
            nestedScrollEnabled={true}
            directionalLockEnabled={true}
          >
            {displayImages.map((img: string, index: number) => (
              <Image
                  key={img || index}
                  source={{ uri: `${API_BASE_URL}${img}` }}
                  style={styles.detailsImage}
                  resizeMode="cover"
                  accessible
                  accessibilityLabel={`Product image ${index + 1}`}
                />
            ))}
          </ScrollView>
          
          {displayImages.length > 1 && renderImageIndicators()}
        </View>

        <View style={styles.detailsInfoSection}>
          <Text style={styles.detailsBrand}>{product.brand}</Text>
          <Text style={styles.detailsTitle}>{product.name}</Text>

          {Array.isArray(product?.options) && product.options.map((option: any) => (
            <View key={option.name} style={styles.optionContainer}>
              <Text style={styles.optionTitle}>{option.name}</Text>
              <View style={styles.optionButtons}>
                {option.values.map((value: any) => (
                  <Pressable
                    key={String(value)}
                    style={[styles.optionButton, selectedOptions[option.name] === value && styles.optionButtonSelected]}
                    onPress={() => handleOptionSelect(option.name, value)}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${option.name} ${value}`}
                  >
                    <Text style={[styles.optionText, selectedOptions[option.name] === value && styles.optionTextSelected]}>
                      {value}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          <Text style={styles.detailsPrice}>{formatPrice(selectedVariant?.price ?? product.basePrice)}</Text>
          <Text style={stockStatus === 'In Stock' ? styles.stockIn : styles.stockOut}>{stockStatus}</Text>

          <Text style={styles.detailsDescription}>{product.description}</Text>


          <View style={{ height: 20 }} />

          <View style={[styles.detailsActions, { paddingBottom: insets.bottom || 12 }]}>
            <Pressable
              style={[styles.detailsButton, isProductInWishlist && styles.wishlistButtonActive]}
              onPress={handleAddToWishlist}
              accessibilityRole="button"
              accessibilityLabel={isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Ionicons 
                name={isProductInWishlist ? "heart" : "heart-outline"} 
                size={24} 
                color={isProductInWishlist ? "#000" : "#000"} 
              />
            </Pressable>

            <Pressable
              style={[
                styles.detailsButton, 
                { flex: 1 }, 
                isItemInCart(product._id) ? styles.addedToCartButton : styles.addToCartButton
              ]}
              onPress={handleAddToCart}
              disabled={isItemInCart(product._id) || (hasVariants && !selectedVariant) || stockStatus === 'Out of Stock'}
              accessibilityRole="button"
              accessibilityLabel={isItemInCart(product._id) ? "Added to cart" : "Add to cart"}
            >
              <Text style={isItemInCart(product._id) ? styles.addedToCartButtonText : styles.addToCartButtonText}>
                {isItemInCart(product._id) ? "Added to Cart" : "Add to Cart"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  detailsView: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '95%', backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 20, paddingTop: 20 },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 10,
  },
  detailsImageCarousel: { height: IMAGE_HEIGHT },
  imageWrapper: { width: '100%', height: IMAGE_HEIGHT, overflow: 'hidden' },
  detailsContent: { paddingBottom: 40 },
  detailsImage: { width: SCREEN_WIDTH, height: IMAGE_HEIGHT },
  detailsInfoSection: { padding: 20 },
  detailsBrand: { fontSize: 16, color: '#888', marginBottom: 5 },
  detailsTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  detailsPrice: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 15 },
  optionContainer: { marginBottom: 15 },
  optionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  optionButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', marginRight: 8, marginBottom: 8 },
  optionButtonSelected: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  optionText: { color: '#1a1a1a' },
  optionTextSelected: { color: '#fff' },
  stockIn: { fontSize: 16, color: '#10B981', fontWeight: '600', marginBottom: 15 },
  stockOut: { fontSize: 16, color: '#EF4444', fontWeight: '600', marginBottom: 15 },
  detailsDescription: { fontSize: 16, lineHeight: 24, color: '#666' },
  detailsActions: { flexDirection: 'row', marginTop: 20, gap: 10, paddingBottom: 40 },
  detailsButton: { padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  detailsButtonText: { fontSize: 16, fontWeight: 'bold' },
  wishlistButtonActive: { backgroundColor: '#f0f0f0' },
  addToCartButton: { backgroundColor: '#000' },
  addedToCartButton: { backgroundColor: '#10B981' },
  addToCartButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  addedToCartButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  imageIndicatorsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  imageIndicator: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  imageIndicatorActive: {
    width: 24,
    backgroundColor: '#000',
  },
  imageIndicatorInactive: {
    width: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default ProductDetailModal;
