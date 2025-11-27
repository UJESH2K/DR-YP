import React, { useState, useEffect, useRef, useCallback, memo } from "react";
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
  BackHandler,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FlatList } from "react-native-gesture-handler";
import { apiCall } from "../lib/api";
import { Product, ProductVariant } from "../types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.42;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.1.9:5000";

/* ----------------------------- MEMOIZED IMAGE ----------------------------- */
const MemoImage = memo(({ uri }: { uri: string }) => (
  <Image source={{ uri }} style={styles.detailsImage} />
));

interface Props {
  productId: string | null;
  isVisible: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, variant?: ProductVariant | null) => void;
  onAddToWishlist?: (product: Product, variant?: ProductVariant | null) => void;
}

const ProductDetailModal: React.FC<Props> = ({
  productId,
  isVisible,
  onClose,
  onAddToCart,
  onAddToWishlist,
}) => {
  const theme = useColorScheme();
  const light = theme !== "dark";
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [displayImages, setDisplayImages] = useState<string[]>([]);

  const detailsPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const imageFlatListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  /* BLOCK BACK BUTTON */
  useEffect(() => {
    if (!isVisible) return;

    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });

    return () => handler.remove();
  }, [isVisible]);

  /* RESET STATE WHEN CLOSING */
  useEffect(() => {
    if (!isVisible) {
      setProduct(null);
      setSelectedColor(null);
      setSelectedVariant(null);
      setActiveImageIndex(0);
      setDisplayImages([]);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [isVisible]);

  /* OPEN MODAL + LOAD PRODUCT */
  useEffect(() => {
    if (isVisible && productId) {
      loadProduct(productId);

      Animated.spring(detailsPosition, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    } else {
      Animated.spring(detailsPosition, {
        toValue: SCREEN_HEIGHT,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, productId]);

  const loadProduct = async (id: string) => {
    try {
      setLoading(true);
      const p = await apiCall(`/api/products/${id}`);
      setProduct(p);
      setDisplayImages(p.images || []);
      
      // Auto-select first color if available
      const colorOption = p.options?.find((o: any) => o.name === "Color");
      if (colorOption?.values?.length > 0) {
        setSelectedColor(colorOption.values[0]);
      }
    } catch {
      Alert.alert("Error", "Failed to load product.");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  /* VARIANT CHANGE - OPTIMIZED */
  useEffect(() => {
    if (!product) return;

    let variant: ProductVariant | null = null;
    let newDisplayImages: string[] = product.images || [];

    if (selectedColor) {
      variant = product.variants?.find(
        (v) => v.options.Color === selectedColor
      ) || null;
      
      if (variant?.images?.length) {
        newDisplayImages = variant.images;
      }
    }

    setSelectedVariant(variant);
    setDisplayImages(newDisplayImages);
    setActiveImageIndex(0);
    
    // Use setTimeout to ensure the scroll happens after state update
    setTimeout(() => {
      imageFlatListRef.current?.scrollToIndex({
        index: 0,
        animated: false,
      });
    }, 0);
  }, [selectedColor, product]);

  /* OPTIMIZED SCROLL HANDLER */
  const handleScrollImages = useCallback(
    (e: any) => {
      const contentOffsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
      
      if (newIndex !== activeImageIndex && newIndex >= 0 && newIndex < displayImages.length) {
        setActiveImageIndex(newIndex);
      }
    },
    [activeImageIndex, displayImages.length]
  );

  /* ADD TO CART HANDLER */
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    
    if (onAddToCart) {
      onAddToCart(product, selectedVariant);
    } else {
      Alert.alert("Success", "Added to cart!");
      // Here you would typically dispatch to your cart context or state management
      console.log("Add to cart:", product, selectedVariant);
    }
  }, [product, selectedVariant, onAddToCart]);

  /* LIKE BUTTON HANDLER */
  const handleLike = useCallback(() => {
    if (!product) return;
    
    if (onAddToWishlist) {
      onAddToWishlist(product, selectedVariant);
    } else {
      Alert.alert("Wishlist", "Added to wishlist ❤️");
      // Here you would typically dispatch to your wishlist context or state management
      console.log("Add to wishlist:", product, selectedVariant);
    }
  }, [product, selectedVariant, onAddToWishlist]);

  /* RENDER IMAGE ITEM - OPTIMIZED */
  const renderImageItem = useCallback(({ item }: { item: string }) => (
    <View style={styles.imageWrapper}>
      <MemoImage uri={`${API_BASE_URL}${item}`} />
    </View>
  ), []);

  /* RENDER DOT INDICATOR - OPTIMIZED */
  const renderDot = useCallback((_: any, index: number) => (
    <View
      key={index}
      style={[
        styles.dot,
        index === activeImageIndex && styles.dotActive,
      ]}
    />
  ), [activeImageIndex]);

  if (!isVisible) return null;

  if (loading || !product) {
    return (
      <Animated.View
        style={[styles.container, { transform: [{ translateY: detailsPosition }] }]}
      >
        <ActivityIndicator size="large" style={{ marginTop: 100 }} />
      </Animated.View>
    );
  }

  const colorOption = product.options?.find((o) => o.name === "Color");

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: detailsPosition }] },
        { backgroundColor: light ? "#fff" : "#000" },
      ]}
    >
      {/* CLOSE BUTTON */}
      <Pressable
        onPress={onClose}
        style={[
          styles.closeBtn,
          {
            top: insets.top + 10,
            backgroundColor: light ? "#e6e6e6" : "#1a1a1a",
          },
        ]}
        hitSlop={20}
      >
        <Ionicons name="close" size={20} color={light ? "#000" : "#fff"} />
      </Pressable>

      {/* IMAGES */}
      <View style={styles.imageSection}>
        <FlatList
          ref={imageFlatListRef}
          data={displayImages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScrollImages}
          scrollEventThrottle={16}
          renderItem={renderImageItem}
          keyExtractor={(_, i) => i.toString()}
          getItemLayout={(_, i) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * i,
            index: i,
          })}
          removeClippedSubviews={true}
          windowSize={3}
          maxToRenderPerBatch={2}
          initialNumToRender={2}
        />

        {/* DOTS */}
        {displayImages.length > 1 && (
          <View style={styles.dotsWrapper}>
            {displayImages.map(renderDot)}
          </View>
        )}
      </View>

      {/* DETAILS */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.detailsScrollView}
        removeClippedSubviews={false} // Changed to false for better performance
        nestedScrollEnabled={true}
      >
        <View style={styles.infoSection}>
          <Text style={[styles.brand, { color: light ? "#666" : "#ccc" }]}>
            {product.brand}
          </Text>

          <Text style={[styles.title, { color: light ? "#111" : "#f5f5f5" }]}>
            {product.name}
          </Text>

          {/* COLORS */}
          {colorOption && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={[styles.optionTitle, { color: light ? "#111" : "#eee" }]}
              >
                Available Colors
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.optionsContainer}
              >
                {colorOption.values.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.optionBtn,
                      selectedColor === color && styles.optionBtnActive,
                      { borderColor: light ? "#ddd" : "#444" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionBtnText,
                        selectedColor === color && styles.optionBtnTextActive,
                      ]}
                    >
                      {color}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* PRICE */}
          <Text style={[styles.price, { color: light ? "#000" : "#fff" }]}>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(selectedVariant?.price ?? product.basePrice)}
          </Text>

          {/* BUTTONS */}
          <View style={styles.buttonsRow}>
            <Pressable
              style={[styles.addToCartBtn, { opacity: product ? 1 : 0.6 }]}
              onPress={handleAddToCart}
              disabled={!product}
            >
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </Pressable>

            <Pressable
              style={[
                styles.likeBtn,
                { borderColor: light ? "#ddd" : "#444" },
              ]}
              onPress={handleLike}
              disabled={!product}
            >
              <Ionicons
                name="heart-outline"
                size={22}
                color={light ? "#000" : "#fff"}
              />
            </Pressable>
          </View>

          {/* DESCRIPTION */}
          <Text style={[styles.description, { color: light ? "#444" : "#ccc" }]}>
            {product.description}
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

export default memo(ProductDetailModal);

/* ------------------------------- STYLES ------------------------------- */
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "96%",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: "hidden",
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  imageSection: {
    height: IMAGE_HEIGHT,
    width: SCREEN_WIDTH,
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  detailsImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    resizeMode: "cover",
  },
  dotsWrapper: {
    position: "absolute",
    bottom: 12,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 4,
  },
  dotActive: {
    width: 16,
    backgroundColor: "#fff",
  },
  detailsScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  infoSection: {
    padding: 20,
  },
  brand: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "JosefinSans_400Regular",
  },
  title: {
    fontSize: 26,
    textAlign: "center",
    marginBottom: 14,
    fontFamily: "JosefinSans_600SemiBold",
  },
  price: {
    fontSize: 26,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "CormorantGaramond_700Bold",
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 20,
    fontFamily: "JosefinSans_400Regular",
  },
  optionTitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "JosefinSans_600SemiBold",
  },
  optionsContainer: {
    paddingHorizontal: 10,
  },
  optionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "#eee",
    marginRight: 10,
    borderWidth: 1,
  },
  optionBtnActive: {
    backgroundColor: "#000",
  },
  optionBtnText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "JosefinSans_500Medium",
  },
  optionBtnTextActive: {
    color: "#fff",
    fontFamily: "JosefinSans_600SemiBold",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 16,
  },
  addToCartBtn: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 26,
  },
  addToCartText: {
    fontSize: 15,
    fontFamily: "JosefinSans_600SemiBold",
    color: "#fff",
  },
  likeBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
});