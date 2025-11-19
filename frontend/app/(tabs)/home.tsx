import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  PanResponder,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCartStore } from '../../src/state/cart';
import { useWishlistStore } from '../../src/state/wishlist';
import { useInteractionStore } from '../../src/state/interactions';
import { useAuthStore } from '../../src/state/auth';
import type { Item } from '../../src/data/items';
import { ITEMS } from '../../src/data/items';
import { getInitialItems, initRecommender, onItemViewed, rankItems, updateModel } from '../../src/lib/recommender';
import { sendInteraction } from '../../src/lib/api';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const addToCart = useCartStore((s) => s.addToCart);
  const addToWishlist = useWishlistStore((s) => s.addToWishlist);
  const pushInteraction = useInteractionStore((s) => s.pushInteraction);
  const { user, loadUser } = useAuthStore();

  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const position = useRef(new Animated.ValueXY()).current;
  const detailsPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [10, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, -10],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    loadUser();
    initRecommender();
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const initialItems = await getInitialItems().catch(() => ITEMS);
      setItems(initialItems && initialItems.length ? initialItems : ITEMS);
    } catch {
      setItems(ITEMS);
    } finally {
      setLoading(false);
    }
  };

  const showDetails = (item: Item) => {
    setSelectedItem(item);
    Animated.timing(detailsPosition, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideDetails = () => {
    Animated.timing(detailsPosition, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedItem(null);
    });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 120) {
        onDecision('like');
      } else if (gesture.dx < -120) {
        onDecision('dislike');
      } else if (gesture.dy < -120) {
        if(currentItem) showDetails(currentItem);
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const detailsPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 10, // Only respond to downward drags
    onPanResponderMove: (_, gesture) => {
      if (gesture.dy > 0) {
        detailsPosition.setValue(gesture.dy);
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 100) {
        hideDetails();
      } else {
        Animated.spring(detailsPosition, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const onDecision = async (decision: 'like' | 'dislike' | 'cart') => {
    if (isAnimating || currentIndex >= items.length) return;

    setIsAnimating(true);
    const currentItem = items[currentIndex];
    if (!currentItem) return;

    const exitDirection = decision === 'like' ? 1 : -1;
    const exitX = decision === 'cart' ? 0 : exitDirection * SCREEN_WIDTH * 1.5;
    const exitY = decision === 'cart' ? SCREEN_HEIGHT : 0;

    try {
      pushInteraction({ itemId: currentItem.id, action: decision, at: Date.now(), tags: currentItem.tags, priceTier: currentItem.priceTier });
      if (decision === 'like') addToWishlist(currentItem);
      else if (decision === 'cart') addToCart({ id: currentItem.id, title: currentItem.title, price: currentItem.price, image: currentItem.image, brand: currentItem.brand, quantity: 1 });
      
      sendInteraction(decision, currentItem.id, user?._id);
      
      updateModel(decision, currentItem);
      const rest = items.slice(currentIndex + 1);
      const reranked = rankItems(rest);
      setItems([...items.slice(0, currentIndex + 1), ...reranked]);

      await new Promise<void>((resolve) => {
        Animated.timing(position, {
          toValue: { x: exitX, y: exitY },
          duration: 300,
          useNativeDriver: true,
        }).start(() => resolve());
      });
    } finally {
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex((prev) => prev + 1);
      setIsAnimating(false);
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  const currentItem = items[currentIndex];
  const nextItem = items[currentIndex + 1];

  useEffect(() => {
    if (currentItem) onItemViewed(currentItem);
  }, [currentItem]);
  
  const renderDetailsView = () => {
    if (!selectedItem) return null;

    return (
      <Animated.View
        style={[styles.detailsView, { transform: [{ translateY: detailsPosition }] }]}
        {...detailsPanResponder.panHandlers}
      >
        <View style={styles.detailsHandleBar} />
        <ScrollView contentContainerStyle={styles.detailsContent}>
          <Image source={{ uri: selectedItem.image }} style={styles.detailsImage} />
          <View style={styles.detailsInfoSection}>
            <Text style={styles.detailsBrand}>{selectedItem.brand}</Text>
            <Text style={styles.detailsTitle}>{selectedItem.title}</Text>
            <Text style={styles.detailsPrice}>{formatPrice(selectedItem.price)}</Text>
            <View style={styles.detailsTagsContainer}>
              {selectedItem.tags.map((tag) => (
                <View key={tag} style={styles.detailsTag}>
                  <Text style={styles.detailsTagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.detailsDescription}>
              This is a great product that you will love. It has many features and is of high quality.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (currentIndex >= items.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.endContainer}>
          <Text style={styles.endTitle}>All caught up!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DRYP</Text>
        <Pressable onPress={() => router.push('/(tabs)/search')}>
          <Ionicons name="search-outline" size={28} color="#000" />
        </Pressable>
      </View>

      <View style={styles.cardStack}>
        {nextItem && (
          <View style={[styles.card, styles.nextCard]} pointerEvents="none">
            <Image source={{ uri: nextItem.image }} style={styles.cardImage} />
            <View style={styles.infoSection}>
              <Text style={styles.cardBrand}>{nextItem.brand}</Text>
              <Text style={styles.cardTitle}>DRYP</Text>
            </View>
          </View>
        )}

        {currentItem && <Animated.View
          style={[
            styles.card,
            { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] },
          ]}
          {...panResponder.panHandlers}
        >
          <Animated.View style={[styles.overlay, styles.likeOverlay, { opacity: likeOpacity }]} />
          <Animated.View style={[styles.overlay, styles.dislikeOverlay, { opacity: nopeOpacity }]} />
          
          <Image source={{ uri: currentItem.image }} style={styles.cardImage} />
          <View style={styles.infoSection}>
            <View>
              <Text style={styles.cardBrand}>{currentItem.brand}</Text>
              <Text style={styles.cardTitle}>{currentItem.title}</Text>
              <View style={styles.tagsContainer}>
                {currentItem.tags.slice(0, 3).map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.priceAndCart}>
              <Text style={styles.cardPrice}>{formatPrice(currentItem.price)}</Text>
              <Pressable style={styles.addToCartButton} onPress={() => onDecision('cart')}>
                <Text style={styles.addToCartButtonText}>Add to Cart</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Swipe left to pass, right to like, or up for details.</Text>
      </View>
      
      {renderDetailsView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    position: 'absolute',
  },
  nextCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  cardImage: {
    width: '100%',
    height: '65%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  infoSection: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardBrand: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  tagText: {
    fontSize: 12,
    color: '#333',
  },
  priceAndCart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  cardPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addToCartButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addToCartButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeOverlay: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
  },
  dislikeOverlay: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  // Styles for Details Modal
  detailsView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '95%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 20,
  },
  detailsHandleBar: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  detailsContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  detailsImage: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    marginBottom: 20,
  },
  detailsInfoSection: {
    flex: 1,
  },
  detailsBrand: {
    fontSize: 16,
    color: '#888',
    marginBottom: 5,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  detailsTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  detailsTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  detailsTagText: {
    fontSize: 14,
    color: '#333',
  },
  detailsDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
});