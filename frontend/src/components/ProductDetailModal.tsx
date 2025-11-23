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
import { apiCall } from '../lib/api';
import { useCartStore } from '../../src/state/cart';
import { useWishlistStore } from '../../src/state/wishlist';
import { useAuthStore } from '../../src/state/auth';
import { Product, ProductOption, ProductVariant } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.4;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.9:5000';

const generateCartId = (productId: string, options?: { [key: string]: string }) => {
  if (!options || Object.keys(options).length === 0) {
    return productId;
  }
  const sortedOptions = Object.keys(options).sort().map(key => `${key}-${options[key]}`).join('_');
  return `${productId}_${sortedOptions}`;
};

interface ProductDetailModalProps {
  productId: string | null;
  isVisible: boolean;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ productId, isVisible, onClose }) => {
  const { items: cartItems, addToCart, removeFromCart } = useCartStore();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { items: wishlistItems, addToWishlist, removeFromWishlist: removeFromWishlistState, isWishlisted } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [displayImages, setDisplayImages] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [recentlyAddedToCart, setRecentlyAddedToCart] = useState<Set<string>>(new Set());
  const [isProductInWishlist, setIsProductInWishlist] = useState(false);

  const detailsPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  
  useEffect(() => {
    if (productId) {
      setIsProductInWishlist(isWishlisted(productId));
    }
  }, [productId, wishlistItems, isWishlisted]);

  useEffect(() => {
    if (isVisible && productId) {
      setLoading(true);
      fetchProductDetails(productId);
      setSelectedColor(null);
      setSelectedVariant(null);
      Animated.spring(detailsPosition, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
    } else if (!isVisible) {
      Animated.spring(detailsPosition, { toValue: SCREEN_HEIGHT, useNativeDriver: true, bounciness: 0 }).start(() => {
        setProduct(null);
        setActiveImageIndex(0);
        setDisplayImages([]);
        setSelectedColor(null);
        setSelectedVariant(null);
      });
    }
  }, [isVisible, productId]);

  useEffect(() => {
    if (product && product.variants) {
      if (selectedColor) {
        const variant = product.variants.find(v => v.options.Color === selectedColor);
        setSelectedVariant(variant || null);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [selectedColor, product]);

  useEffect(() => {
    if (product) {
      if (selectedColor) {
        const variantWithColor = product.variants?.find(v => v.options.Color === selectedColor);
        if (variantWithColor && variantWithColor.images && variantWithColor.images.length > 0) {
          setDisplayImages(variantWithColor.images);
        } else {
          setDisplayImages(product.images || []);
        }
      } else {
        setDisplayImages(product.images || []);
      }
    }
  }, [selectedColor, product]);

  const fetchProductDetails = async (id: string) => {
    try {
      const productData: Product = await apiCall(`/api/products/${id}`);
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

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const onImageScroll = useCallback((event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollX / SCREEN_WIDTH);
    setActiveImageIndex(newIndex);
  }, []);

  const formatPrice = useCallback((price: number | undefined | null) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return '$0.00';
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericPrice);
    } catch (e) {
      return `$${(numericPrice || 0).toFixed(2)}`;
    }
  }, []);

  const handleAddToWishlist = async () => {
    if (!product) return;
    try {
      if (isProductInWishlist) {
        await removeFromWishlistState(product._id);
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

  const handleCartAction = useCallback(() => {
    if (!product) return;

    const itemOptions = selectedColor ? { Color: selectedColor } : undefined;
    const cartId = generateCartId(product._id, itemOptions);
    const isInCart = cartItems.some(item => item.id === cartId);

    if (isInCart) {
      removeFromCart(cartId);
      Alert.alert('Success', `${product.name} removed from cart!`);
    } else {
      const itemPrice = selectedVariant?.price ?? product.basePrice;
      const itemImage = selectedVariant?.images?.[0] || product.images[0];
      
      addToCart({
        id: cartId,
        productId: product._id,
        title: product.name,
        brand: product.brand,
        image: itemImage,
        price: itemPrice,
        options: itemOptions,
        quantity: 1,
      });

      setRecentlyAddedToCart(prev => new Set(prev).add(cartId));
      
      setTimeout(() => {
        setRecentlyAddedToCart(prev => {
          const newSet = new Set(prev);
          newSet.delete(cartId);
          return newSet;
        });
      }, 2000);

      Alert.alert('Success', `${product.name} added to cart!`);
    }
  }, [product, selectedColor, selectedVariant, cartItems, addToCart, removeFromCart]);

  const renderImageIndicators = () => {
    if (displayImages.length <= 1) return null;
    return (
      <View style={styles.imageIndicatorsContainer}>
        {displayImages.map((_, index) => (
          <View key={index} style={[styles.imageIndicator, index === activeImageIndex ? styles.imageIndicatorActive : styles.imageIndicatorInactive]} />
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
  };

  const colorOption = product.options?.find((opt: ProductOption) => opt.name === 'Color');
  const currentOptions = selectedColor ? { Color: selectedColor } : undefined;
  const cartId = generateCartId(product._id, currentOptions);
  const isInCart = cartItems.some(item => item.id === cartId);
  const justAdded = recentlyAddedToCart.has(cartId);
  
  let buttonText = 'Add to Cart';
  if (justAdded) {
    buttonText = 'Added to Cart';
  } else if (isInCart) {
    buttonText = 'Remove from Cart';
  }

  const bottomPadding = 24 + (insets.bottom || 0) + 80;

  return (
    <Animated.View style={[styles.detailsView, { transform: [{ translateY: detailsPosition }] }]} accessibilityViewIsModal>
      <Pressable onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close-circle" size={36} color="#333" />
      </Pressable>
      
      <ScrollView contentContainerStyle={[styles.detailsContent, { paddingBottom: bottomPadding }]} scrollEventThrottle={16} style={{ flex: 1 }} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}>
        <View style={styles.imageWrapper}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={onImageScroll} scrollEventThrottle={16} style={styles.detailsImageCarousel} nestedScrollEnabled={true} directionalLockEnabled={true}>
            {displayImages.map((img: string, index: number) => (
              <Image key={img || index} source={{ uri: `${API_BASE_URL}${img}` }} style={styles.detailsImage} resizeMode="cover" accessible accessibilityLabel={`Product image ${index + 1}`} />
            ))}
          </ScrollView>
          {displayImages.length > 1 && renderImageIndicators()}
        </View>

        <View style={styles.detailsInfoSection}>
          <Text style={styles.detailsBrand}>{product.brand}</Text>
          <Text style={styles.detailsTitle}>{product.name}</Text>

          {/* Color Options */}
          {colorOption && colorOption.values.length > 0 && (
            <View style={styles.optionContainer}>
              <Text style={styles.optionTitle}>Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorOptionsContainer}>
                {colorOption.values.map((colorValue: string) => (
                  <Pressable
                    key={colorValue}
                    style={[
                      styles.colorTextOptionButton,
                      selectedColor === colorValue && styles.colorTextOptionButtonSelected,
                    ]}
                    onPress={() => handleColorSelect(colorValue)}
                  >
                    <Text style={[
                      styles.colorTextOptionText,
                      selectedColor === colorValue && styles.colorTextOptionTextSelected,
                    ]}>
                      {colorValue}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <Text style={styles.detailsPrice}>{formatPrice(selectedVariant?.price ?? product.basePrice)}</Text>
          <Text style={styles.detailsDescription}>{product.description}</Text>
          <View style={{ height: 20 }} />

          <View style={[styles.detailsActions, { paddingBottom: insets.bottom || 12 }]}>
            <Pressable style={[styles.detailsButton, isProductInWishlist && styles.wishlistButtonActive]} onPress={handleAddToWishlist} accessibilityRole="button" accessibilityLabel={isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"}>
              <Ionicons name={isProductInWishlist ? "heart" : "heart-outline"} size={24} color={isProductInWishlist ? "#000" : "#888"} />
            </Pressable>
            <Pressable
              style={[
                styles.detailsButton,
                { flex: 1 },
                justAdded ? styles.addedToCartButton : (isInCart ? styles.removeFromCartButton : styles.addToCartButton),
              ]}
              onPress={handleCartAction}
            >
              <Text style={styles.addToCartButtonText}>
                {buttonText}
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
  closeButton: { position: 'absolute', top: 10, right: 10, zIndex: 10, padding: 10 },
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
  detailsDescription: { fontSize: 16, lineHeight: 24, color: '#666' },
  detailsActions: { flexDirection: 'row', marginTop: 20, gap: 10, paddingBottom: 40 },
  detailsButton: { padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  wishlistButtonActive: { backgroundColor: '#f0f0f0' },
  addToCartButton: { backgroundColor: '#000' },
  addedToCartButton: { backgroundColor: '#10B981' },
  removeFromCartButton: { backgroundColor: '#EF4444' }, // Red for remove
  addToCartButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  imageIndicatorsContainer: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  imageIndicator: { height: 4, borderRadius: 2, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
  imageIndicatorActive: { width: 24, backgroundColor: '#000' },
  imageIndicatorInactive: { width: 12, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
  colorOptionsContainer: { flexDirection: 'row', flexWrap: 'nowrap', marginTop: 10, marginBottom: 10, height: 40 },
  colorTextOptionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorTextOptionButtonSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  colorTextOptionText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  colorTextOptionTextSelected: {
    color: '#fff',
  },
});

export default ProductDetailModal;
