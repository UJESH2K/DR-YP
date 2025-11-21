import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  PanResponder,
  ScrollView,
  Alert,
  findNodeHandle,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCartStore } from '../../src/state/cart';
import { useInteractionStore } from '../../src/state/interactions';
import { useAuthStore } from '../../src/state/auth';
import type { Item } from '../../src/types';
import { initRecommender, rankItems, updateModel } from '../../src/lib/recommender';
import { apiCall, sendInteraction } from '../../src/lib/api';
import { mapProductsToItems } from '../../src/utils/productMapping';
import { Ionicons } from '@expo/vector-icons';
import MultiSelectDropdown from '../../src/components/MultiSelectDropdown';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.4;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.9:5000';

export default function HomeScreen() {
  const addToCart = useCartStore((s) => s.addToCart);
  const cartItems = useCartStore((s) => s.items);
  const pushInteraction = useInteractionStore((s) => s.pushInteraction);
  const { user, loadUser, updateUser } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [displayImages, setDisplayImages] = useState<string[]>([]);
  
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [recentlyAddedToCart, setRecentlyAddedToCart] = useState<Set<string>>(new Set());

  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);



  const position = useRef(new Animated.ValueXY()).current;
  const detailsPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const nextCardAnimation = useRef(new Animated.Value(0.9)).current;
  
  const imageScrollViewRef = useRef<ScrollView>(null);
  const expandedImageScrollViewRef = useRef<ScrollView>(null);
  const detailsScrollViewRef = useRef<ScrollView>(null);

  // For edge swipe detection
  const edgeSwipeStartX = useRef(0);

  useEffect(() => {
    loadUser();
    initRecommender();
    loadRecommendations();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [selectedBrands, selectedCategories, selectedColors]);

  useEffect(() => {
    if (selectedProduct) {
      const selectedColor = selectedOptions['Color'];
      if (selectedColor) {
        const variantWithColor = selectedProduct.variants.find(v => v.options.Color === selectedColor);
        if (variantWithColor && variantWithColor.images && variantWithColor.images.length > 0) {
          setDisplayImages(variantWithColor.images);
          return;
        }
      }
      setDisplayImages(selectedProduct.images || []);
    } else {
      setDisplayImages([]);
    }
  }, [selectedOptions, selectedProduct]);
  
  const rotate = position.x.interpolate({ inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], outputRange: ['-10deg', '0deg', '10deg'], extrapolate: 'clamp' });
  const likeOpacity = position.x.interpolate({ inputRange: [10, SCREEN_WIDTH / 4], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOpacity = position.x.interpolate({ inputRange: [-SCREEN_WIDTH / 4, -10], outputRange: [1, 0], extrapolate: 'clamp' });

  const fetchFilterOptions = async () => {
    try {
      const [brandsData, categoriesData, colorsData] = await Promise.all([
        apiCall('/api/products/brands'),
        apiCall('/api/products/categories'),
        apiCall('/api/products/colors'),
      ]);
      if (Array.isArray(brandsData)) setBrands(brandsData);
      if (Array.isArray(categoriesData)) setCategories(categoriesData);
      if (Array.isArray(colorsData)) setColors(colorsData);
    } catch (error) {
      console.warn('Failed to load filter options', error);
    }
  };

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBrands.length > 0) params.append('brand', selectedBrands.join(','));
      if (selectedCategories.length > 0) params.append('category', selectedCategories.join(','));
      if (selectedColors.length > 0) params.append('color', selectedColors.join(','));
      
      const products = await apiCall(`/api/products?${params.toString()}`);
      setItems(Array.isArray(products) ? mapProductsToItems(products) : []);
    } catch (error) {
      console.warn('Failed to load products', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const showDetails = (item: Item) => {
    if (!item) return;
    
    setSelectedItem(item);
    setSelectedProduct(null);
    setSelectedOptions({});
    setSelectedVariant(null);
    setActiveImageIndex(0);

    apiCall(`/api/products/${item.id}`)
      .then(productData => {
        if (productData) setSelectedProduct(productData);
      })
      .catch(err => {
        console.warn('Failed to fetch product details', err);
      });

    Animated.spring(position, { toValue: { x: 0, y: -60 }, useNativeDriver: true }).start();
    Animated.spring(detailsPosition, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
  };

  const hideDetails = () => {
    Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
    Animated.spring(detailsPosition, { toValue: SCREEN_HEIGHT, useNativeDriver: true, bounciness: 0 }).start(() => {
      setSelectedItem(null);
      setSelectedProduct(null);
      setSelectedOptions({});
      setSelectedVariant(null);
      setActiveImageIndex(0);
    });
  };

  useEffect(() => {
    if (selectedProduct?.variants?.length > 0) {
      const variant = selectedProduct.variants.find((v: any) =>
        Object.keys(selectedOptions).every(key => v.options && v.options[key] === selectedOptions[key])
      );
      setSelectedVariant(variant || null);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedOptions, selectedProduct]);

  const handleOptionSelect = (name: string, value: any) => setSelectedOptions(prev => ({ ...prev, [name]: value }));
  
  const onImageScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollX / SCREEN_WIDTH);
    setActiveImageIndex(newIndex);
  };

  const handleAddToWishlist = async (item: Item) => {
    if (!item) return;
    try {
      await apiCall(`/api/wishlist/${item.id}`, { method: 'POST' });
      
      setWishlistItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });
      
      Alert.alert('Success', `${item.title} ${wishlistItems.has(item.id) ? 'removed from' : 'added to'} your wishlist!`);
    } catch (error) {
      console.warn(error);
      Alert.alert('Error', 'Could not update wishlist.');
    }
  };

  const handleAddToCart = (item: Item) => {
    if (!item) return;

    const hasVariants = selectedProduct?.options && selectedProduct.options.length > 0;
    if (hasVariants && !selectedVariant) {
      Alert.alert('Please select options', 'You must select all available options before adding to cart.');
      return;
    }

    const availableStock = selectedVariant
      ? selectedVariant.stock
      : selectedProduct?.stock;
    
    if (availableStock === 0) {
      Alert.alert('Out of Stock', 'This item is currently out of stock.');
      return;
    }

    try {
      addToCart({
        productId: item.id,
        title: item.title,
        brand: item.brand,
        image: item.image,
        price: selectedVariant ? selectedVariant.price : item.price,
        options: hasVariants ? selectedOptions : undefined,
        quantity: 1,
      });
      
      setRecentlyAddedToCart(prev => new Set(prev).add(item.id));
      
      setTimeout(() => {
        setRecentlyAddedToCart(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.id);
          return newSet;
        });
      }, 3000);
      
      Alert.alert('Success', `${item.title} added to cart!`);
    } catch (error) {
      console.warn(error);
      Alert.alert('Error', 'Failed to add item to cart.');
    }
  };

  const isItemInCart = (itemId: string) => {
    return cartItems.some(item => item.productId === itemId) || recentlyAddedToCart.has(itemId);
  };



  // Card pan responder
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isAnimating && !selectedItem,
    onMoveShouldSetPanResponder: (_, gesture) => !selectedItem && (Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5),
    onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gesture) => {
      if (selectedItem) return;
      if (gesture.dx > 120) onDecision('like');
      else if (gesture.dx < -120) onDecision('dislike');
      else if (gesture.dy < -100) showDetails(items[currentIndex]);
      else Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
    },
  });

  // NEW APPROACH: Edge swipe for dismissal
  const edgeSwipePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      // Only capture gestures that start from the screen edges
      const startX = evt.nativeEvent.pageX;
      edgeSwipeStartX.current = startX;
      
      // Capture if starting from left edge (50px) or right edge
      return startX < 50 || startX > SCREEN_WIDTH - 50;
    },
    onMoveShouldSetPanResponder: (_, gesture) => {
      // Only consider vertical movements for edge swipes
      return Math.abs(gesture.dy) > Math.abs(gesture.dx);
    },
    onPanResponderMove: (_, gesture) => {
      // Only move the sheet if it's a downward gesture from edges
      if (gesture.dy > 0) {
        detailsPosition.setValue(gesture.dy);
      }
    },
    onPanResponderRelease: (_, gesture) => {
      // Dismiss if significant downward swipe from edges
      if (gesture.dy > 100) {
        hideDetails();
      } else {
        Animated.spring(detailsPosition, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  });

  const onDecision = (decision: 'like' | 'dislike') => {
    if (isAnimating) return;
    const currentItem = items && items.length > 0 ? items[currentIndex] : null;
    if (!currentItem) return;

    setIsAnimating(true);
    pushInteraction({ itemId: currentItem.id, action: decision, at: Date.now(), tags: currentItem.tags, priceTier: currentItem.priceTier });
    sendInteraction(decision, currentItem.id, user?._id);
    updateModel(decision, currentItem);

    Animated.timing(nextCardAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const exitX = decision === 'like' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, { toValue: { x: exitX, y: 0 }, duration: 300, useNativeDriver: true }).start(() => {
      position.setValue({ x: 0, y: 0 });
      nextCardAnimation.setValue(0.9);
      setCurrentIndex(prev => {
        if (!items || items.length === 0) return 0;
        return (prev + 1) % items.length;
      });
      setIsAnimating(false);
    });
  };

  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    } catch (e) {
      return `$${(price || 0).toFixed(2)}`;
    }
  };

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

  const currentItem = items && items.length > 0 ? items[currentIndex] : null;
  const nextItem = items && items.length > 1 ? items[(currentIndex + 1) % items.length] : null;

  const renderDetailsView = () => {
    if (!selectedItem) return null;

    const stockStatus = selectedVariant
      ? (selectedVariant.stock > 0 ? 'In Stock' : 'Out of Stock')
      : (selectedProduct?.stock > 0 ? 'In Stock' : 'Out of Stock');

    const bottomPadding = 24 + (insets.bottom || 0) + 80;
    const isWishlisted = wishlistItems.has(selectedItem.id);
    const isInCart = isItemInCart(selectedItem.id);
    const hasMultipleImages = displayImages.length > 1;
    
    return (
      <Animated.View
        style={[styles.detailsView, { transform: [{ translateY: detailsPosition }] }]}
        accessibilityViewIsModal
      >
        {/* Edge swipe areas - invisible but capture gestures */}
        <View style={styles.edgeSwipeAreaLeft} {...edgeSwipePanResponder.panHandlers} />
        <View style={styles.edgeSwipeAreaRight} {...edgeSwipePanResponder.panHandlers} />
        
        <View style={styles.detailsHandleBar} />

        {selectedProduct ? (
          <ScrollView
            ref={detailsScrollViewRef}
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
                ref={imageScrollViewRef}
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
              
              {hasMultipleImages && renderImageIndicators()}
            </View>

            <View style={styles.detailsInfoSection}>
              <Text style={styles.detailsBrand}>{selectedItem.brand}</Text>
              <Text style={styles.detailsTitle}>{selectedItem.title}</Text>

              {Array.isArray(selectedProduct?.options) && selectedProduct.options.map((option: any) => (
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

              <Text style={styles.detailsPrice}>{formatPrice(selectedVariant?.price || selectedItem.price)}</Text>
              <Text style={stockStatus === 'In Stock' ? styles.stockIn : styles.stockOut}>{stockStatus}</Text>

              <Text style={styles.detailsDescription}>{selectedItem.description}</Text>

              <View style={{ height: 20 }} />

              <View style={[styles.detailsActions, { paddingBottom: insets.bottom || 12 }]}>
                <Pressable
                  style={[styles.detailsButton, isWishlisted && styles.wishlistButtonActive]}
                  onPress={() => handleAddToWishlist(selectedItem)}
                  accessibilityRole="button"
                  accessibilityLabel={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Ionicons 
                    name={isWishlisted ? "heart" : "heart-outline"} 
                    size={24} 
                    color={isWishlisted ? "#000" : "#000"} 
                  />
                </Pressable>

                <Pressable
                  style={[
                    styles.detailsButton, 
                    { flex: 1 }, 
                    isInCart ? styles.addedToCartButton : styles.addToCartButton
                  ]}
                  onPress={() => handleAddToCart(selectedItem)}
                  disabled={isInCart}
                  accessibilityRole="button"
                  accessibilityLabel={isInCart ? "Added to cart" : "Add to cart"}
                >
                  <Text style={isInCart ? styles.addedToCartButtonText : styles.addToCartButtonText}>
                    {isInCart ? "Added to Cart" : "Add to Cart"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        ) : (
          <ActivityIndicator size="large" style={{ flex: 1 }} />
        )}
      </Animated.View>
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedColors([]);
  };

  if (loading) return <SafeAreaView style={styles.container}><ActivityIndicator style={styles.centered} size="large" /></SafeAreaView>;
  if (!items || items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.endContainer}>
          <Text style={styles.endTitle}>No products found.</Text>
          <Pressable style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={{ fontSize: 33, fontWeight: '100', color: '#000', letterSpacing: 1.5 }}>DRYP</Text>
        <View style={styles.headerIcons}>
          <Pressable onPress={() => router.push('/(tabs)/search')}><Ionicons name="search-outline" size={28} color="#000" /></Pressable>
          <Pressable onPress={() => router.push('/liked-items')}><Ionicons name="heart-outline" size={28} color="#000" /></Pressable>
          <Pressable onPress={() => router.push('/notifications')}><Ionicons name="notifications-outline" size={28} color="#000" /></Pressable>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <MultiSelectDropdown
          containerStyle={{ width: 110 }}
          options={brands}
          selectedOptions={selectedBrands}
          onSelectionChange={setSelectedBrands}
          placeholder="Brands"
        />
        <MultiSelectDropdown
          containerStyle={{ width: 110 }}
          options={categories}
          selectedOptions={selectedCategories}
          onSelectionChange={setSelectedCategories}
          placeholder="Categories"
        />
        <MultiSelectDropdown
          containerStyle={{ width: 110 }}
          options={colors}
          selectedOptions={selectedColors}
          onSelectionChange={setSelectedColors}
          placeholder="Colors"
        />
      </View>

      <View style={styles.cardStack}>
        {nextItem && (
          <Animated.View style={[styles.card, {
            opacity: 0.8,
            transform: [
              {
                scale: nextCardAnimation,
              },
              {
                translateY: nextCardAnimation.interpolate({
                  inputRange: [0.9, 1],
                  outputRange: [40, 0],
                }),
              },
            ],
          }]} pointerEvents="none">
            <Image source={{ uri: nextItem.image }} style={styles.cardImage} />
            <View style={styles.infoSection}>
              <Text style={styles.cardBrand}>{nextItem.brand}</Text>
              <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">{nextItem.title}</Text>
              <View style={[styles.tagsContainer, { opacity: 0.7 }]}>
                {nextItem.tags?.slice(0, 3).map((tag: string) => (
                  <View key={tag} style={[styles.tag, { opacity: 0.7 }]}><Text style={styles.tagText}>{tag}</Text></View>
                ))}
              </View>
              <Text style={[styles.cardPrice, { opacity: 0.7 }]}>{formatPrice(nextItem.price)}</Text>
            </View>
          </Animated.View>
        )}

        {currentItem && (
          <Animated.View
            style={[ styles.card, { transform: [...position.getTranslateTransform(), { rotate }] } ]}
            {...panResponder.panHandlers}
          >
            <Animated.View style={[styles.overlay, styles.likeOverlay, { opacity: likeOpacity }]} />
            <Animated.View style={[styles.overlay, styles.dislikeOverlay, { opacity: nopeOpacity }]} />
            <Image source={{ uri: currentItem.image }} style={styles.cardImage} />
            <View style={styles.infoSection}>
              <View>
                <Text style={styles.cardBrand}>{currentItem.brand}</Text>
                <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">{currentItem.title}</Text>
                <View style={styles.tagsContainer}>
                  {currentItem.tags?.slice(0, 3).map((tag: string) => (<View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>))}
                </View>
                <Text style={styles.cardPrice}>{formatPrice(currentItem.price)}</Text>
              </View>
            </View>
          </Animated.View>
        )}
      </View>
      
      {renderDetailsView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', zIndex: 10 },
  headerIcons: { flexDirection: 'row', gap: 16, },
  filtersContainer: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'center',
    gap: 10,
  },
  cardStack: { flex: 1, alignItems: 'center', paddingTop: 20 },
  card: { width: SCREEN_WIDTH * 0.9, height: SCREEN_HEIGHT * 0.7, borderRadius: 20, backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, position: 'absolute' },
  nextCard: { transform: [{ scale: 0.9 }, { translateY: 40 }], opacity: 0.8 },
  cardImage: { width: '100%', height: '70%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  infoSection: { padding: 15, flexShrink: 1 },
  cardBrand: { fontSize: 12, color: '#888', marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 }, // Reduced font size
  cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginTop: 4, marginBottom: 8 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4, marginBottom: 4 },
  tag: { backgroundColor: '#e0e0e0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 10, color: '#333' },
  endContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  endTitle: { fontSize: 20, fontWeight: '700' },
  clearButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
  },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 },
  likeOverlay: { backgroundColor: 'rgba(0, 255, 0, 0.2)' },
  dislikeOverlay: { backgroundColor: 'rgba(255, 0, 0, 0.2)' },

  // DETAILS sheet
  detailsView: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '95%', backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 20, paddingTop: 20 },
  detailsHandleBar: { width: 40, height: 5, borderRadius: 2.5, backgroundColor: '#ccc', alignSelf: 'center', marginTop: 10, marginBottom: 10 },
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
  
  // Edge swipe areas
  edgeSwipeAreaLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 50,
    zIndex: 100,
  },
  edgeSwipeAreaRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 50,
    zIndex: 100,
  },
  
  // New styles for button states
  wishlistButtonActive: { backgroundColor: '#f0f0f0' },
  addToCartButton: { backgroundColor: '#000' },
  addedToCartButton: { backgroundColor: '#10B981' },
  addToCartButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  addedToCartButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  
  // Image indicator styles
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

  // Expanded image modal styles
  expandedImageContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedCloseButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedImageScrollView: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  expandedImageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  imageCounter: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  expandedImageIndicatorsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  expandedImageIndicator: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  expandedImageIndicatorActive: {
    width: 24,
    backgroundColor: '#fff',
  },
  expandedImageIndicatorInactive: {
    width: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});