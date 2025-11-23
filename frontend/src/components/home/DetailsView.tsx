
import React from 'react';
import {
  View, Text, Image, Animated, StyleSheet, Pressable, ScrollView, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Item } from '../../types';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/dimensions';
import { formatPrice } from '../../utils/formatting';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.9:5000';
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.4;

interface DetailsViewProps {
  selectedItem: Item | null;
  selectedProduct: any | null;
  selectedVariant: any | null;
  displayImages: string[];
  activeImageIndex: number;
  wishlistItems: Set<string>;
  detailsPosition: Animated.Value;
  edgeSwipePanResponder: any;
  handlers: {
    handleOptionSelect: (name: string, value: any) => void;
    onImageScroll: (event: any) => void;
    handleAddToWishlist: (item: Item) => void;
    handleAddToCart: (item: Item) => void;
    isItemInCart: (itemId: string) => boolean;
  };
}

export function DetailsView({
  selectedItem,
  selectedProduct,
  selectedVariant,
  displayImages,
  activeImageIndex,
  wishlistItems,
  detailsPosition,
  edgeSwipePanResponder,
  handlers,
  selectedOptions,
}: DetailsViewProps & { selectedOptions: any }) {
  const insets = useSafeAreaInsets();
  
  if (!selectedItem || !selectedOptions) return null;

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
  
  const stockStatus = selectedVariant
      ? (selectedVariant.stock > 0 ? 'In Stock' : 'Out of Stock')
      : (selectedProduct?.stock > 0 ? 'In Stock' : 'Out of Stock');
      
  const isWishlisted = wishlistItems.has(selectedItem.id);
  const isInCart = handlers.isItemInCart(selectedItem.id);

  return (
    <Animated.View
      style={[styles.detailsView, { transform: [{ translateY: detailsPosition }] }]}
      accessibilityViewIsModal
    >
      <View style={styles.edgeSwipeAreaLeft} {...edgeSwipePanResponder.panHandlers} />
      <View style={styles.edgeSwipeAreaRight} {...edgeSwipePanResponder.panHandlers} />
      
      <View style={styles.detailsHandleBar} />

      {selectedProduct ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 + (insets.bottom || 0) + 80 }}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.imageWrapper}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handlers.onImageScroll}
              scrollEventThrottle={16}
              style={styles.detailsImageCarousel}
            >
              {displayImages.map((img: string, index: number) => (
                <Image
                  key={img || index}
                  source={{ uri: `${API_BASE_URL}${img}` }}
                  style={styles.detailsImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            {renderImageIndicators()}
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
                      onPress={() => handlers.handleOptionSelect(option.name, value)}
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
                onPress={() => handlers.handleAddToWishlist(selectedItem)}
              >
                <Ionicons 
                  name={isWishlisted ? "heart" : "heart-outline"} 
                  size={24} 
                  color={"#000"} 
                />
              </Pressable>

              <Pressable
                style={[
                  styles.detailsButton, 
                  { flex: 1 }, 
                  isInCart ? styles.addedToCartButton : styles.addToCartButton
                ]}
                onPress={() => handlers.handleAddToCart(selectedItem)}
                disabled={isInCart}
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
}

const styles = StyleSheet.create({
    detailsView: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '95%', backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 20, paddingTop: 20 },
    detailsHandleBar: { width: 40, height: 5, borderRadius: 2.5, backgroundColor: '#ccc', alignSelf: 'center', marginTop: 10, marginBottom: 10 },
    detailsImageCarousel: { height: IMAGE_HEIGHT },
    imageWrapper: { width: '100%', height: IMAGE_HEIGHT, overflow: 'hidden' },
    detailsImage: { width: SCREEN_WIDTH, height: IMAGE_HEIGHT },
    detailsInfoSection: { padding: 20 },
    detailsBrand: { fontSize: 16, color: '#888', marginBottom: 5 },
    detailsTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    detailsPrice: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 15 },
    optionContainer: { marginBottom: 15 },
    optionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
    optionButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    optionButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' },
    optionButtonSelected: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
    optionText: { color: '#1a1a1a' },
    optionTextSelected: { color: '#fff' },
    stockIn: { fontSize: 16, color: '#10B981', fontWeight: '600', marginBottom: 15 },
    stockOut: { fontSize: 16, color: '#EF4444', fontWeight: '600', marginBottom: 15 },
    detailsDescription: { fontSize: 16, lineHeight: 24, color: '#666' },
    detailsActions: { flexDirection: 'row', marginTop: 20, gap: 10 },
    detailsButton: { padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
    wishlistButtonActive: { backgroundColor: '#f0f0f0' },
    addToCartButton: { backgroundColor: '#000' },
    addedToCartButton: { backgroundColor: '#10B981' },
    addToCartButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    addedToCartButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    edgeSwipeAreaLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 50, zIndex: 100 },
    edgeSwipeAreaRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 50, zIndex: 100 },
    imageIndicatorsContainer: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
    imageIndicator: { height: 4, borderRadius: 2 },
    imageIndicatorActive: { width: 24, backgroundColor: '#000' },
    imageIndicatorInactive: { width: 12, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
});
