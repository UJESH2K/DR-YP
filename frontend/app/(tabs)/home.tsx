// app/(tabs)/home.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Pressable,
  Text,
  useColorScheme,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useHomeScreenData } from "../../src/hooks/useHomeScreenData";
import { useSwipeAnimations } from "../../src/hooks/useSwipeAnimations";
import { useAppState } from "../../src/hooks/useAppState";
import { Product, Item, isProduct } from "../../src/types";

import Header from "../../src/components/home/Header";
import { Filters } from "../../src/components/home/Filters";
import { LoadingState } from "../../src/components/home/LoadingState";
import { EmptyState } from "../../src/components/home/EmptyState";
import { Card } from "../../src/components/home/Card";
import ProductDetailModal from "../../src/components/ProductDetailModal";

export default function HomeScreen() {
  const theme = useColorScheme();
  const light = theme !== "dark";
  const navigation = useNavigation();
  
  // Use central state management
  const { addLikedItem, addToWishlist, addToCart } = useAppState();

  const {
    items,
    loading,
    filters,
    selectedFilters,
    setSelectedFilters,
    clearFilters,
  } = useHomeScreenData();

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // 👉 Swipe Right will like the product
  const handleSwipeRight = async (item: Item | Product) => {
    try {
      addLikedItem(item); // Update local state immediately
      addToWishlist(item); // Also add to wishlist
      
      console.log('Item liked and added to wishlist');
      
    } catch (error: any) {
      console.error("Failed to like item:", error);
      Alert.alert("Error", "Failed to like item. Please try again.");
    }
  };

  // 👉 Add to Cart handler for ProductDetailModal
  const handleAddToCart = (product: Product, variant?: any) => {
    try {
      addToCart(product);
      Alert.alert("Success", "Added to cart! 🛒");
      console.log('Added to cart from modal:', product);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      Alert.alert("Error", "Failed to add to cart. Please try again.");
    }
  };

  // 👉 Add to Wishlist handler for ProductDetailModal
  const handleAddToWishlist = (product: Product, variant?: any) => {
    try {
      addToWishlist(product);
      Alert.alert("Wishlist", "Added to wishlist!");
      console.log('Added to wishlist from modal:', product);
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      Alert.alert("Error", "Failed to add to wishlist. Please try again.");
    }
  };

  // 👉 Open modal animation
  const showDetailsWithAnimation = (item: Item | Product) => {
    swipe.showDetailsAnimation();
    // Use _id for Product, id for Item
    const itemId = isProduct(item) ? item._id : item.id;
    setSelectedProductId(itemId);
    setModalVisible(true);
  };

  // 👉 Close modal
  const hideDetailsWithAnimation = () => {
    swipe.hideDetailsAnimation();
    setModalVisible(false);
    setSelectedProductId(null);
  };

  // SINGLE swipe hook - ensure items are properly typed
  const swipe = useSwipeAnimations(items, showDetailsWithAnimation, handleSwipeRight);

  // HEADER BUTTONS
  const handleSearchPress = () => {
    navigation.navigate("search" as never);
  };

  const handleNotificationsPress = () => {
    navigation.navigate("notifications" as never);
  };

  const handleLikedPress = () => {
    navigation.navigate("wishlist" as never);
  };

  if (loading) return <LoadingState />;
  if (items.length === 0) return <EmptyState onClearFilters={clearFilters} />;

  const currentItem = items[swipe.currentIndex];
  const nextItem = items[(swipe.currentIndex + 1) % items.length];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: light ? "#fff" : "#000" }]}>
      <StatusBar
        barStyle={light ? "dark-content" : "light-content"}
        backgroundColor={light ? "#fff" : "#000"}
      />

      {/* HEADER */}
      <Header
        onSearchPress={handleSearchPress}
        onNotificationsPress={handleNotificationsPress}
        onLikedPress={handleLikedPress}
      />

      {/* TITLE */}
      <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
        <Text
          style={{
            fontSize: 22,
            color: light ? "#111" : "#eee",
            fontFamily: "JosefinSans_600SemiBold",
            letterSpacing: 0.5,
          }}
        >
          Explore Styles
        </Text>
      </View>

      {/* FILTERS */}
      <View pointerEvents={isModalVisible ? "none" : "auto"}>
        <Filters
          filters={filters}
          selectedFilters={selectedFilters}
          onSelectionChange={setSelectedFilters}
        />
      </View>

      {/* CARD STACK */}
      <View style={styles.cardStack}>
        {nextItem && (
          <Card
            item={nextItem}
            isNext
            style={{
              opacity: 0.8,
              transform: [
                { scale: swipe.nextCardAnimation },
                {
                  translateY: swipe.nextCardAnimation.interpolate({
                    inputRange: [0.9, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            }}
          />
        )}

        {currentItem && (
          <Card
            item={currentItem}
            style={swipe.animatedCardStyles}
            likeOpacity={swipe.likeOpacity}
            nopeOpacity={swipe.nopeOpacity}
            panHandlers={swipe.panResponder.panHandlers}
          />
        )}
      </View>

      {/* UNDO SWIPE */}
      {swipe.canUndo && (
        <Pressable
          style={[
            styles.undoButton,
            { backgroundColor: light ? "#f7f7f7" : "#111" },
            swipe.lastSwipeDirection === "left" ? { left: 30 } : { right: 30 },
          ]}
          onPress={swipe.undoSwipe}
        >
          <Ionicons
            name={swipe.lastSwipeDirection === "left" ? "arrow-redo" : "arrow-undo"}
            size={34}
            color={light ? "#111" : "#eee"}
          />
        </Pressable>
      )}

      {/* PRODUCT MODAL */}
      {selectedProductId && (
        <ProductDetailModal
          productId={selectedProductId}
          isVisible={isModalVisible}
          onClose={hideDetailsWithAnimation}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cardStack: { flex: 1, alignItems: "center", paddingTop: 20 },
  undoButton: {
    position: "absolute",
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});