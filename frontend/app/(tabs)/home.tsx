import React, { useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Pressable,
  Text,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useHomeScreenData } from "../../src/hooks/useHomeScreenData";
import { useSwipeAnimations } from "../../src/hooks/useSwipeAnimations";
import { useLikedItems } from "../../src/hooks/useLikedItems";

import { Header } from "../../src/components/home/Header";
import { Filters } from "../../src/components/home/Filters";
import { LoadingState } from "../../src/components/home/LoadingState";
import { EmptyState } from "../../src/components/home/EmptyState";
import { Card } from "../../src/components/home/Card";
import ProductDetailModal from "../../src/components/ProductDetailModal";
import { Item } from "../../src/types";

export default function HomeScreen() {
  const theme = useColorScheme();
  const light = theme !== "dark";
  const navigation = useNavigation();

  const {
    items,
    loading,
    filters,
    selectedFilters,
    setSelectedFilters,
    clearFilters,
  } = useHomeScreenData();

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  // Add liked items management
  const { addLikedItem, getLikedItems } = useLikedItems();

  // Enhanced function to handle likes
  const showDetailsWithAnimation = (item: Item) => {
    swipeAnimations.showDetailsAnimation();
    setSelectedProductId(item.id);
    setModalVisible(true);
  };

  const hideDetailsWithAnimation = () => {
    swipeAnimations.hideDetailsAnimation();
    setModalVisible(false);
    setSelectedProductId(null);
  };

  // Enhanced swipe handler to store liked items
  const handleSwipeRight = (item: Item) => {
    addLikedItem(item); // Store liked item
    console.log("Liked item:", item.id);
  };

  // Hook called only once — no duplication
  const swipeAnimations = useSwipeAnimations(
    items, 
    showDetailsWithAnimation,
    handleSwipeRight // Pass the like handler
  );

  // Header button handlers
  const handleSearchPress = () => {
    // Navigate to search screen or show search modal
    console.log("Search pressed");
    // navigation.navigate('Search'); // Uncomment if you have a search screen
  };

  const handleNotificationsPress = () => {
    // Navigate to notifications screen
    console.log("Notifications pressed");
    // navigation.navigate('Notifications'); // Uncomment if you have notifications screen
  };

  const handleLikedPress = () => {
    // Navigate to liked items screen
    console.log("Liked items pressed");
    const likedItems = getLikedItems();
    console.log("Liked items count:", likedItems.length);
    // navigation.navigate('Liked', { likedItems }); // Uncomment if you have liked screen
  };

  if (loading) return <LoadingState />;
  if (items.length === 0)
    return <EmptyState onClearFilters={clearFilters} />;

  const currentItem = items[swipeAnimations.currentIndex];
  const nextItem = items[(swipeAnimations.currentIndex + 1) % items.length];

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: light ? "#fff" : "#000" },
      ]}
    >
      <StatusBar
        barStyle={light ? "dark-content" : "light-content"}
        backgroundColor={light ? "#fff" : "#000"}
      />

      {/* Enhanced Header with button handlers */}
      <Header 
        onSearchPress={handleSearchPress}
        onNotificationsPress={handleNotificationsPress}
        onLikedPress={handleLikedPress}
      />

      {/* Section Title */}
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

      {/* Filters */}
      <View pointerEvents={isModalVisible ? "none" : "auto"}>
        <Filters
          filters={filters}
          selectedFilters={selectedFilters}
          onSelectionChange={setSelectedFilters}
        />
      </View>

      {/* Card Stack */}
      <View style={styles.cardStack}>
        {nextItem && (
          <Card
            item={nextItem}
            isNext
            style={{
              opacity: 0.8,
              transform: [
                { scale: swipeAnimations.nextCardAnimation },
                {
                  translateY: swipeAnimations.nextCardAnimation.interpolate({
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
            style={swipeAnimations.animatedCardStyles}
            likeOpacity={swipeAnimations.likeOpacity}
            nopeOpacity={swipeAnimations.nopeOpacity}
            panHandlers={swipeAnimations.panResponder.panHandlers}
          />
        )}
      </View>

      {/* Undo Button */}
      {swipeAnimations.canUndo && (
        <Pressable
          style={[
            styles.undoButton,
            { backgroundColor: light ? "#f7f7f7" : "#111" },
            swipeAnimations.lastSwipeDirection === "left"
              ? { left: 30 }
              : { right: 30 },
          ]}
          onPress={swipeAnimations.undoSwipe}
        >
          <Ionicons
            name={
              swipeAnimations.lastSwipeDirection === "left"
                ? "arrow-redo"
                : "arrow-undo"
            }
            size={34}
            color={light ? "#111" : "#eee"}
          />
        </Pressable>
      )}

      {/* Product Modal */}
      {selectedProductId && (
        <ProductDetailModal
          productId={selectedProductId}
          isVisible={isModalVisible}
          onClose={hideDetailsWithAnimation}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  cardStack: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },

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
