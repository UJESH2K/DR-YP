import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'men', name: 'MEN', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center', color: '#000000' },
    { id: 'women', name: 'WOMEN', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop&crop=center', color: '#8B5CF6' },
  ]

  const brands = []
  const trending = []
  const newArrivals = []
  const youMightLike = []
  const related = []

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CASA</Text>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for something..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <Pressable key={category.id} style={styles.categoryCard}>
              <Image source={{ uri: category.image }} style={styles.categoryImage} />
              <View style={[styles.categoryOverlay, { backgroundColor: category.color }]}>
                <Text style={styles.categoryText}>{category.name}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Brands Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BRANDS</Text>
          {brands.length === 0 ? (
            <Text style={styles.emptyText}>No Brands Found</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {brands.map((brand, index) => (
                <View key={index} style={styles.brandCard}>
                  <Text>{brand}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Trending Now Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRENDING NOW</Text>
          {trending.length === 0 ? (
            <Text style={styles.emptyText}>No data available</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {trending.map((item, index) => (
                <View key={index} style={styles.trendingCard}>
                  <Text>{item}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* New Arrivals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NEW ARRIVALS</Text>
          {newArrivals.length === 0 ? (
            <Text style={styles.emptyText}>No data available</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {newArrivals.map((item, index) => (
                <View key={index} style={styles.arrivalCard}>
                  <Text>{item}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* You Might Like Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOU MIGHT LIKE</Text>
          {youMightLike.length === 0 ? (
            <Text style={styles.emptyText}>No Clothes you might like Found</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {youMightLike.map((item, index) => (
                <View key={index} style={styles.likeCard}>
                  <Text>{item}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Related Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RELATED</Text>
          {related.length === 0 ? (
            <View style={styles.emptyContainer}>
              {/* Empty space for related items */}
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {related.map((item, index) => (
                <View key={index} style={styles.relatedCard}>
                  <Text>{item}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: '#000000',
    letterSpacing: 1,
  },
  notificationButton: {
    padding: 8,
  },
  notificationIcon: {
    fontSize: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  categoryCard: {
    flex: 1,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
    paddingVertical: 10,
  },
  emptyContainer: {
    height: 50,
  },
  brandCard: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    marginRight: 10,
  },
  trendingCard: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    marginRight: 10,
  },
  arrivalCard: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    marginRight: 10,
  },
  likeCard: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    marginRight: 10,
  },
  relatedCard: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    marginRight: 10,
  },
  bottomSpacing: {
    height: 100,
  },
})
