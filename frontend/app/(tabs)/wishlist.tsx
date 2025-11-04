import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useWishlistStore } from '../../src/state/wishlist'
import { useCartStore } from '../../src/state/cart'

export default function WishlistScreen() {
  const wishlistItems = useWishlistStore((s) => s.items)
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist)
  const addToCart = useCartStore((s) => s.addToCart)

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      brand: item.brand,
      quantity: 1,
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 10,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#eaeaea',
        }}
      >
        {/* Logo */}
        <Text
          style={{
            fontSize: 33,
            fontWeight: '00',
            color: '#000',
            letterSpacing: 1.5,
          }}
        >
          DRYP
        </Text>

        {/* Liked Items Text */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#000',
            letterSpacing: 0.5,
          }}
        >
          Liked Items
        </Text>

        {/* Cart Icon */}
        <Pressable>
          <Text style={{ fontSize: 31, color: '#000' }}>🛒</Text>
        </Pressable>
      </View>

      {wishlistItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No liked items yet</Text>
          <Text style={styles.emptySubtitle}>
            Items you like will appear here
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.itemsGrid}>
            {wishlistItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemBrand}>{item.brand}</Text>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                  
                  <View style={styles.itemActions}>
                    <Pressable
                      style={styles.addToCartButton}
                      onPress={() => handleAddToCart(item)}
                    >
                      <Text style={styles.addToCartText}>Add to Cart</Text>
                    </Pressable>
                    <Pressable
                      style={styles.removeButton}
                      onPress={() => removeFromWishlist(item.id)}
                    >
                      <Text style={styles.removeText}>♡</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  itemsGrid: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  itemInfo: {
    padding: 15,
  },
  itemBrand: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 22,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 15,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 10,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: 16,
    color: '#666666',
  },
  bottomSpacing: {
    height: 100,
  },
})
