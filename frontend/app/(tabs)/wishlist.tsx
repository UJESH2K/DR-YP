// app/(tabs)/wishlist.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppState } from '../../src/hooks/useAppState';
import { Item } from '../../src/types';

export default function WishlistScreen() {
  const navigation = useNavigation();
  const { wishlist, removeFromWishlist, addToCart, isInCart } = useAppState();

  const handleRemoveFromWishlist = (item: Item) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your wishlist?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => removeFromWishlist(item.id)
        }
      ]
    );
  };

  const handleAddToCart = (item: Item) => {
    addToCart(item);
    Alert.alert("Success", "Item added to cart!");
  };

  const renderWishlistItem = ({ item }: { item: Item }) => (
    <View style={styles.itemContainer}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.itemImage}
        resizeMode="cover"
      />
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemBrand}>{item.brand}</Text>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemPrice}>${item.price}</Text>
        
        <View style={styles.itemActions}>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addToCartText}>
              {isInCart(item.id) ? 'Added to Cart' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveFromWishlist(item)}
          >
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (wishlist.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptySubtitle}>
          Discover amazing products and add them to your wishlist
        </Text>
        <TouchableOpacity 
          style={styles.discoverButton}
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Text style={styles.discoverText}>Start Exploring</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Text style={styles.itemCount}>({wishlist.length} items)</Text>
      </View>

      <FlatList
        data={wishlist}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "JosefinSans_600SemiBold",
    textAlign: "center",
    color: "#111",
    letterSpacing: 0.5,
  },
  itemCount: {
    fontSize: 14,
    fontFamily: "JosefinSans_400Regular",
    textAlign: "center",
    color: "#666",
    marginTop: 4,
  },
  listContainer: {
    padding: 18,
    paddingBottom: 40,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  itemImage: {
    width: 95,
    height: 95,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemBrand: {
    fontSize: 12,
    fontFamily: "JosefinSans_500Medium",
    color: "#666",
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  itemTitle: {
    fontSize: 17,
    fontFamily: "JosefinSans_600SemiBold",
    color: "#111",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  itemPrice: {
    fontSize: 20,
    fontFamily: "CormorantGaramond_700Bold",
    color: "#000",
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: "#000",
    paddingVertical: 10,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  addToCartText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "JosefinSans_600SemiBold",
  },
  removeButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  removeText: {
    color: "#e63946",
    fontSize: 14,
    fontFamily: "JosefinSans_600SemiBold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: "JosefinSans_600SemiBold",
    color: "#111",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: "JosefinSans_400Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  discoverButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  discoverText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "JosefinSans_600SemiBold",
  }
});