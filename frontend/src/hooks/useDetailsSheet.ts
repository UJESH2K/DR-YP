import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated, PanResponder, Alert } from 'react-native';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants/dimensions';
import type { Item } from '../types';
import { apiCall } from '../lib/api';
import { useCartStore } from '../state/cart';

interface DetailsSheetOptions {
  onShow?: () => void;
  onHide?: () => void;
}

export function useDetailsSheet({ onShow, onHide }: DetailsSheetOptions) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [displayImages, setDisplayImages] = useState<string[]>([]);
  
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [recentlyAddedToCart, setRecentlyAddedToCart] = useState<Set<string>>(new Set());

  const detailsPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  
  const addToCart = useCartStore((s) => s.addToCart);
  const cartItems = useCartStore((s) => s.items);

  useEffect(() => {
    if (selectedProduct) {
      const selectedColor = selectedOptions['Color'];
      if (selectedColor) {
        const variantWithColor = selectedProduct.variants.find((v: any) => v.options.Color === selectedColor);
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

  const showDetails = useCallback((item: Item) => {
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

    onShow?.();
    Animated.spring(detailsPosition, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
  }, [detailsPosition, onShow]);

  const hideDetails = useCallback(() => {
    onHide?.();
    Animated.spring(detailsPosition, { toValue: SCREEN_HEIGHT, useNativeDriver: true, bounciness: 0 }).start(() => {
      setSelectedItem(null);
      setSelectedProduct(null);
      setSelectedOptions({});
      setSelectedVariant(null);
      setActiveImageIndex(0);
    });
  }, [detailsPosition, onHide]);

  const edgeSwipePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => evt.nativeEvent.pageX < 50 || evt.nativeEvent.pageX > SCREEN_WIDTH - 50,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) detailsPosition.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100) hideDetails();
        else Animated.spring(detailsPosition, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

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
        const isWishlisted = newSet.has(item.id);
        if (isWishlisted) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        Alert.alert('Success', `${item.title} ${isWishlisted ? 'removed from' : 'added to'} your wishlist!`);
        return newSet;
      });
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

    const availableStock = selectedVariant ? selectedVariant.stock : selectedProduct?.stock;
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
    return cartItems.some(cartItem => cartItem.productId === itemId) || recentlyAddedToCart.has(itemId);
  };

  return {
    selectedItem,
    selectedProduct,
    selectedVariant,
    selectedOptions,
    activeImageIndex,
    displayImages,
    wishlistItems,
    detailsPosition,
    edgeSwipePanResponder,
    showDetails,
    hideDetails,
    handlers: {
      handleOptionSelect,
      onImageScroll,
      handleAddToWishlist,
      handleAddToCart,
      isItemInCart,
    },
  };
}