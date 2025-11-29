import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  StatusBar,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Modal,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiCall } from '../../src/lib/api';
import { rankItems } from '../../src/lib/recommender';
import type { Item } from '../../src/types';
import { mapProductsToItems } from '../../src/utils/productMapping';
import ProductDetailModal from '../../src/components/ProductDetailModal';
import SearchLoadingState from '../../src/components/search/LoadingState';
import { useCacheStore } from '../../src/state/cache';
import { formatPrice } from '../../src/utils/formatting';

const CACHE_DURATION = 24 * 60 * 60 * 1000;

export default function SearchScreen() {
  const theme = useColorScheme();
  const light = theme !== "dark";

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [trending, setTrending] = useState<Item[]>([]);

  const {
    categories: cachedCategories,
    brands: cachedBrands,
    setCategories: setCachedCategories,
    setBrands: setCachedBrands,
  } = useCacheStore();

  const [brands, setBrands] = useState<string[]>(cachedBrands.data || []);
  const [categories, setCategories] = useState<string[]>(cachedCategories.data || []);
  const [colors, setColors] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Item[]>([]);
  const [recentSearches, setRecentSearches] = useState<{ query: string; image: string }[]>([]);

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedProductIdForModal, setSelectedProductIdForModal] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // ---------------- Fetch Initial ----------------
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const now = Date.now();

      const productsPromise = apiCall('/api/products?limit=20');

      const brandsPromise =
        cachedBrands.timestamp && now - cachedBrands.timestamp < CACHE_DURATION
          ? Promise.resolve(cachedBrands.data)
          : apiCall('/api/products/brands').then(data => {
              if (Array.isArray(data)) setCachedBrands(data);
              return data;
            });

      const categoriesPromise =
        cachedCategories.timestamp && now - cachedCategories.timestamp < CACHE_DURATION
          ? Promise.resolve(cachedCategories.data)
          : apiCall('/api/products/categories').then(data => {
              if (Array.isArray(data)) setCachedCategories(data);
              return data;
            });

      const colorsPromise = apiCall('/api/products/colors');

      const [products, fetchedBrands, fetchedCategories, fetchedColors] = await Promise.all([
        productsPromise,
        brandsPromise,
        categoriesPromise,
        colorsPromise,
      ]);

      if (Array.isArray(products)) {
        const items = mapProductsToItems(products);
        setTrending(items.slice(0, 10));
        setRecommendations(rankItems(items).slice(0, 10));
      }
      if (Array.isArray(fetchedBrands)) setBrands(fetchedBrands);
      if (Array.isArray(fetchedCategories)) setCategories(fetchedCategories);
      if (Array.isArray(fetchedColors)) setColors(fetchedColors);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  // ---------------- Main Search API ----------------
  const fetchData = useCallback(async () => {
    setIsSearching(true);
    setResults([]);

    let endpoint = '/api/products?';
    const params = new URLSearchParams();

    if (searchQuery) params.append('search', searchQuery);
    if (selectedBrand) params.append('brand', selectedBrand);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedColor) params.append('color', selectedColor);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);

    endpoint += params.toString();

    try {
      const products = await apiCall(endpoint);
      const items = Array.isArray(products) ? mapProductsToItems(products) : [];
      setResults(items);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, selectedBrand, selectedCategory, selectedColor, minPrice, maxPrice]);

  // ---------------- UI Helpers ----------------
  const renderProductCard = ({ item, large = false }: { item: Item; large?: boolean }) => (
    <Pressable
      style={large ? styles.largeProductCard : styles.productCard}
      onPress={() => {
        setSelectedProductIdForModal(item.id);
        setIsModalVisible(true);
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={large ? styles.largeProductImage : styles.productImage}
      />
      <Text style={styles.productTitle}>{item.title}</Text>
      <Text style={styles.productBrand}>{item.brand}</Text>
      <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
    </Pressable>
  );

  // ---------------- Render ----------------
  if (initialLoading) return <SearchLoadingState />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: light ? "#fff" : "#000" }]}>
      <StatusBar barStyle={light ? "dark-content" : "light-content"} />

      {/* Search Bar */}
      <View style={[styles.header, { backgroundColor: light ? "#fff" : "#000" }]}>
        <View style={[styles.searchBarContainer, { backgroundColor: light ? "#f4f4f4" : "#111" }]}>
          <TextInput
            style={[styles.searchInput, { color: light ? "#111" : "#eee" }]}
            placeholder="Search products..."
            placeholderTextColor={light ? "#888" : "#666"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={fetchData}
          />
          <Pressable onPress={fetchData}>
            <Ionicons name="search" size={22} color={light ? "#666" : "#aaa"} />
          </Pressable>
        </View>

        {/* Filter Icon */}
        <Pressable onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="options-outline" size={26} color={light ? "#000" : "#fff"} />
        </Pressable>
      </View>

      {/* MAIN PRODUCT LIST */}
      <FlatList
        data={results.length > 0 ? results : trending}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 20 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderProductCard({ item })}
        ListHeaderComponent={
          <Text style={[styles.sectionTitle, { color: light ? "#111" : "#eee" }]}>
            {results.length > 0 ? "Search Results" : "Trending Now"}
          </Text>
        }
        ListFooterComponent={<View style={{ height: 60 }} />}
      />

      {/* PRODUCT MODAL */}
      <ProductDetailModal
        productId={selectedProductIdForModal}
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// ----------------------------------
//             STYLES
// ----------------------------------
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
    paddingVertical: 10,
  },

  searchBarContainer: {
    flex: 1,
    height: 42,
    borderRadius: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "JosefinSans_500Medium",
  },

  sectionTitle: {
    fontSize: 22,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
    fontFamily: "JosefinSans_600SemiBold",
  },

  productCard: {
    width: "48%",
    marginBottom: 22,
  },

  productImage: {
    width: "100%",
    aspectRatio: 0.8,
    borderRadius: 10,
    backgroundColor: "#f4f4f4",
  },

  largeProductCard: {
    width: 180,
    marginRight: 14,
  },

  largeProductImage: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    backgroundColor: "#f4f4f4",
  },

  productTitle: {
    fontSize: 14,
    marginTop: 8,
    fontFamily: "JosefinSans_500Medium",
    color: "#111",
  },

  productBrand: {
    fontSize: 12,
    marginTop: 1,
    fontFamily: "JosefinSans_400Regular",
    color: "#777",
  },

  productPrice: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: "CormorantGaramond_700Bold",
    color: "#000",
  },
});
