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
import ProductDetailModal from '../../src/components/ProductDetailModal';


export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [trending, setTrending] = useState<Item[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Item[]>([]);
  
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  
  const [selectedProductIdForModal, setSelectedProductIdForModal] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);


  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [products, fetchedBrands, fetchedCategories, fetchedColors] = await Promise.all([
        apiCall('/api/products?limit=20'),
        apiCall('/api/products/brands'),
        apiCall('/api/products/categories'),
        apiCall('/api/products/colors'),
      ]);

      if (Array.isArray(products)) {
        const items = mapProductsToItems(products);
        setTrending(items.slice(0, 10));
        setRecommendations(rankItems(items).slice(0, 10));
      }
      if (Array.isArray(fetchedBrands)) setBrands(fetchedBrands);
      if (Array.isArray(fetchedCategories)) setCategories(fetchedCategories);
      if (Array.isArray(fetchedColors)) setColors(fetchedColors);

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
    if (selectedColor) params.append('color', selectedColor);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);

    endpoint += params.toString();

    try {
      const products = await apiCall(endpoint);
      setResults(Array.isArray(products) ? mapProductsToItems(products) : []);
    } catch (error) { console.error("Failed to fetch data:", error); } 
    finally { setLoading(false); }
  }, [searchQuery, selectedBrand, selectedCategory, selectedColor, minPrice, maxPrice]);

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
  }, [selectedColor, fetchData]);

  useEffect(() => {
    fetchData();
  }, [minPrice, maxPrice, fetchData]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSelectedBrand(null);
    setSelectedCategory(null);
    setSelectedColor(null);
    setMinPrice('');
    setMaxPrice('');
  };
  
  const applyFilters = () => {
    fetchData();
    setFilterModalVisible(false);
  };

  const clearFilters = () => {
    setSelectedBrand(null);
    setSelectedCategory(null);
    setSelectedColor(null);
    setMinPrice('');
    setMaxPrice('');
    fetchData();
    setFilterModalVisible(false);
  };
  
  // UI Rendering
  const renderProductCard = ({ item, large = false }: { item: Item, large?: boolean }) => (
    <Pressable style={large ? styles.largeProductCard : styles.productCard} onPress={() => {
      setSelectedProductIdForModal(item.id);
      setIsModalVisible(true);
    }}>
      <Image source={{ uri: item.image }} style={large ? styles.largeProductImage : styles.productImage} />
      <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.productBrand} numberOfLines={1}>{item.brand}</Text>
      <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
    </Pressable>
  );
  
  const renderFilterModal = () => (
    <Modal visible={isFilterModalVisible} onRequestClose={() => setFilterModalVisible(false)} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { height: '80%'}]}>
              <ScrollView>
                <Text style={styles.sectionTitle}>Filters</Text>

                <Text style={styles.subSectionTitle}>Price Range</Text>
                <View style={styles.priceRangeContainer}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Min Price"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                  />
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Max Price"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                  />
                </View>

                <Text style={styles.subSectionTitle}>Category</Text>
                <View style={styles.filterRow}>
                  {categories.map((category) => (
                    <Pressable key={category} style={[styles.filterButton, selectedCategory === category && styles.filterButtonSelected]} onPress={() => setSelectedCategory(c => c === category ? null : category)}>
                        <Text style={[styles.filterButtonText, selectedCategory === category && styles.filterButtonTextSelected]}>{category}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.subSectionTitle}>Brand</Text>
                <View style={styles.filterRow}>
                  {brands.map((brand) => (
                    <Pressable key={brand} style={[styles.filterButton, selectedBrand === brand && styles.filterButtonSelected]} onPress={() => setSelectedBrand(b => b === brand ? null : brand)}>
                        <Text style={[styles.filterButtonText, selectedBrand === brand && styles.filterButtonTextSelected]}>{brand}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.subSectionTitle}>Color</Text>
                <View style={styles.filterRow}>
                  {colors.map((color) => (
                    <Pressable key={color} style={[styles.filterButton, selectedColor === color && styles.filterButtonSelected]} onPress={() => setSelectedColor(c => c === color ? null : color)}>
                        <Text style={[styles.filterButtonText, selectedColor === color && styles.filterButtonTextSelected]}>{color}</Text>
                    </Pressable>
                  ))}
                </View>
                
                <View style={styles.modalButtons}>
                    <Pressable style={[styles.modalButton, styles.clearButton]} onPress={clearFilters}>
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </Pressable>
                    <Pressable style={[styles.modalButton, styles.applyButton]} onPress={applyFilters}>
                        <Text style={styles.applyButtonText}>Apply</Text>
                    </Pressable>
                </View>
              </ScrollView>
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
          { type: 'search-results', data: results, title: 'Search Results' },
          { type: 'trending', data: trending, title: 'Trending Now' },
          { type: 'recommendations', data: recommendations, title: 'You Might Also Like' },
        ]}
        keyExtractor={(item) => item.type}
        renderItem={({ item }) => {
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
      <ProductDetailModal
        productId={selectedProductIdForModal}
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
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
  priceRangeContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  priceInput: { flex: 1, height: 40, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, fontSize: 16, marginRight: 10 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalButton: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' },
  clearButton: { backgroundColor: '#f0f0f0', marginRight: 10 },
  clearButtonText: { color: '#000', fontWeight: 'bold' },
  applyButton: { backgroundColor: '#000' },
  applyButtonText: { color: '#fff', fontWeight: 'bold' },
});