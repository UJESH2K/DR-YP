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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { debounce } from 'lodash';
import { apiCall } from '../../src/lib/api';
import { rankItems } from '../../src/lib/recommender';
import type { Item } from '../../src/types';
import { mapProductsToItems } from '../../src/utils/productMapping';

const priceRanges = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: 'Over $200', min: 200, max: Infinity },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [trending, setTrending] = useState<Item[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Item[]>([]);
  
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [products, fetchedBrands, fetchedCategories] = await Promise.all([
        apiCall('/api/products?limit=20'),
        apiCall('/api/products/brands'),
        apiCall('/api/products/categories'),
      ]);

      if (Array.isArray(products)) {
        const items = mapProductsToItems(products);
        setTrending(items.slice(0, 10));
        setRecommendations(rankItems(items).slice(0, 10));
      }
      if (Array.isArray(fetchedBrands)) setBrands(fetchedBrands);
      if (Array.isArray(fetchedCategories)) setCategories(fetchedCategories);

    } catch (error) { console.error("Failed to fetch initial data:", error); }
    finally { setLoading(false); }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setResults([]);
    let endpoint = '/api/products?';
    const params = new URLSearchParams();

    if (searchQuery.length > 2) params.append('search', searchQuery);
    if (selectedBrand) params.append('brand', selectedBrand);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedPriceRange) {
        if (selectedPriceRange.min) params.append('minPrice', selectedPriceRange.min);
        if (selectedPriceRange.max !== Infinity) params.append('maxPrice', selectedPriceRange.max);
    }

    endpoint += params.toString();

    try {
      const products = await apiCall(endpoint);
      setResults(Array.isArray(products) ? mapProductsToItems(products) : []);
    } catch (error) { console.error("Failed to fetch data:", error); } 
    finally { setLoading(false); }
  }, [searchQuery, selectedBrand, selectedCategory, selectedPriceRange]);

  const debouncedSearch = useCallback(debounce(fetchData, 500), [fetchData]);

  useEffect(() => {
    if (searchQuery.length > 2 || searchQuery.length === 0) {
      debouncedSearch();
    }
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [selectedBrand, fetchData]);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, fetchData]);

  useEffect(() => {
    fetchData();
  }, [selectedPriceRange, fetchData]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSelectedBrand(null);
    setSelectedCategory(null);
    setSelectedPriceRange(null);
  };
  
  const applyFilters = () => {
    fetchData();
    setFilterModalVisible(false);
  };
  
  // UI Rendering
  const renderProductCard = ({ item, large = false }: { item: Item, large?: boolean }) => (
    <Pressable style={large ? styles.largeProductCard : styles.productCard} onPress={() => router.push(`/product/${item.id}`)}>
      <Image source={{ uri: item.image }} style={large ? styles.largeProductImage : styles.productImage} />
      <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.productBrand} numberOfLines={1}>{item.brand}</Text>
      <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
    </Pressable>
  );
  
  const renderFilterModal = () => (
    <Modal visible={isFilterModalVisible} onRequestClose={() => setFilterModalVisible(false)} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.sectionTitle}>Filters</Text>
                <Text style={styles.subSectionTitle}>Price Range</Text>
                {priceRanges.map(range => (
                    <Pressable key={range.label} style={[styles.filterButton, selectedPriceRange?.label === range.label && styles.filterButtonSelected]} onPress={() => setSelectedPriceRange(r => r?.label === range.label ? null : range)}>
                        <Text style={[styles.filterButtonText, selectedPriceRange?.label === range.label && styles.filterButtonTextSelected]}>{range.label}</Text>
                    </Pressable>
                ))}
                <Text style={styles.subSectionTitle}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 120 }}>
                  {categories.map((category) => (
                    <Pressable key={category} style={[styles.filterButton, selectedCategory === category && styles.filterButtonSelected]} onPress={() => setSelectedCategory(c => c === category ? null : category)}>
                        <Text style={[styles.filterButtonText, selectedCategory === category && styles.filterButtonTextSelected]}>{category}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Pressable style={styles.applyButton} onPress={applyFilters}>
                    <Text style={styles.applyButtonText}>Apply</Text>
                </Pressable>
            </View>
        </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {renderFilterModal()}
      <View style={styles.header}>
        <TextInput style={styles.searchInput} placeholder="Search products..." value={searchQuery} onChangeText={handleSearchChange} />
        <Pressable onPress={() => setFilterModalVisible(true)}>
            <Ionicons name="filter-outline" size={28} color="#000" style={{marginRight: 10}} />
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/cart')}>
          <Ionicons name="cart-outline" size={31} color="#000" />
        </Pressable>
      </View>

      <FlatList
        data={[
          { type: 'brands', data: brands },
          { type: 'search-results', data: results, title: 'Search Results' },
          { type: 'trending', data: trending, title: 'Trending Now' },
          { type: 'recommendations', data: recommendations, title: 'You Might Also Like' },
        ]}
        keyExtractor={(item) => item.type}
        renderItem={({ item }) => {
          if (item.type === 'brands') {
            return (
              <View style={{paddingHorizontal: 20}}>
                <Text style={styles.sectionTitle}>Shop by Brand</Text>
                <FlatList
                  horizontal
                  data={brands}
                  renderItem={({item: brand}) => (
                    <Pressable key={brand} style={[styles.brandButton, selectedBrand === brand && styles.brandButtonSelected]} onPress={() => { setSelectedBrand(b => b === brand ? null : brand); setSearchQuery(''); }}>
                      <Text style={[styles.brandButtonText, selectedBrand === brand && styles.brandButtonTextSelected]}>{brand}</Text>
                    </Pressable>
                  )}
                  keyExtractor={(brand) => brand}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.brandScrollView}
                />
              </View>
            )
          }

          if (loading && (item.type === 'search-results')) {
            return <ActivityIndicator size="large" style={{marginTop: 50}} />;
          }

          if (item.type === 'search-results' && (results.length > 0 || searchQuery.length > 2)) {
            return (
              <>
                <Text style={styles.sectionTitle}>{item.title}</Text>
                <FlatList
                    data={results}
                    renderItem={({item}) => renderProductCard({item, large: false})}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
                    ListEmptyComponent={<Text style={styles.emptyText}>No products found for your search.</Text>}
                />
              </>
            )
          }

          if ((item.type === 'trending' || item.type === 'recommendations') && (results.length === 0 && searchQuery.length < 3)) {
             return (
                <View style={item.type === 'recommendations' ? {marginTop: 20} : {}}>
                    <Text style={styles.sectionTitle}>{item.title}</Text>
                    <FlatList
                        horizontal
                        data={item.data as Item[]}
                        renderItem={({item: product}) => renderProductCard({item: product, large: true})}
                        keyExtractor={(product) => `${item.type}-${product.id}`}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    />
                </View>
             )
          }
          
          return null;
        }}
        ListFooterComponent={<View style={{height: 40}} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eaeaea' },
  searchInput: { flex: 1, height: 40, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, fontSize: 16, marginRight: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginVertical: 15, paddingHorizontal: 20 },
  brandScrollView: { marginBottom: 10 },
  brandButton: { backgroundColor: '#f0f0f0', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 10, height: 40 },
  brandButtonSelected: { backgroundColor: '#000' },
  brandButtonText: { color: '#000', fontWeight: '600' },
  brandButtonTextSelected: { color: '#fff' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666' },
  productCard: { width: '48%', marginBottom: 20 },
  productImage: { width: '100%', aspectRatio: 0.8, borderRadius: 10, backgroundColor: '#f5f5f5' },
  largeProductCard: { width: 180, marginRight: 15 },
  largeProductImage: { width: '100%', height: 220, borderRadius: 10, backgroundColor: '#f5f5f5' },
  productTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginTop: 10 },
  productBrand: { fontSize: 12, color: '#888', marginVertical: 2 },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a', marginTop: 4 },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '60%' },
  subSectionTitle: { fontSize: 18, fontWeight: '600', color: '#000', marginVertical: 10 },
  filterButton: { backgroundColor: '#f0f0f0', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 10, height: 40 },
  filterButtonSelected: { backgroundColor: '#000' },
  filterButtonText: { color: '#000', fontWeight: '600' },
  filterButtonTextSelected: { color: '#fff' },
  applyButton: { backgroundColor: '#000', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  applyButtonText: { color: '#fff', fontWeight: 'bold' },
});