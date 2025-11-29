// app/(tabs)/cart.tsx
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

export default function CartScreen() {
  const navigation = useNavigation();
  const { cart, removeFromCart, clearCart } = useAppState();

  const handleRemoveFromCart = (item: Item) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeFromCart(item.id),
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert("Cart Empty", "Your cart is empty!");
      return;
    }

    Alert.alert(
      "Checkout",
      `Proceed with checkout for ${cart.length} items?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Checkout",
          onPress: () => {
            clearCart();
            Alert.alert("Success", "Order placed successfully!");
          },
        },
      ]
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const renderCartItem = ({ item }: { item: Item }) => {
    // Construct full image URL automatically
    const backendUrl = "http://localhost:5000"; // change to your live server
    const imageUrl = item.image.startsWith("http")
      ? item.image
      : `${backendUrl}${item.image}`;

    return (
      <View style={styles.itemContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.itemImage}
          resizeMode="cover"
          onError={() =>
            console.log("Failed to load image:", item.image)
          }
        />

        <View style={styles.itemDetails}>
          <Text style={styles.itemBrand}>{item.brand}</Text>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemPrice}>${item.price}</Text>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFromCart(item)}
          >
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Add some amazing products to your cart
        </Text>
        <TouchableOpacity
          style={styles.discoverButton}
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Text style={styles.discoverText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Text style={styles.itemCount}>({cart.length} items)</Text>
      </View>

      {/* Items */}
      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Checkout Section */}
      <View style={styles.checkoutContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>
            ${calculateTotal().toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// -------------------------------------------
// Styles
// -------------------------------------------
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
    fontFamily: 'JosefinSans_600SemiBold',
    textAlign: 'center',
    color: '#111',
  },
  itemCount: {
    fontSize: 14,
    fontFamily: 'JosefinSans_400Regular',
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
  },

  listContainer: {
    padding: 18,
    paddingBottom: 120,
  },

  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
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
    fontFamily: 'JosefinSans_500Medium',
    color: '#666',
  },
  itemTitle: {
    fontSize: 17,
    fontFamily: 'JosefinSans_600SemiBold',
    color: '#111',
    marginVertical: 4,
  },
  itemPrice: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond_700Bold',
    color: '#000',
    marginBottom: 12,
  },

  removeButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  removeText: {
    color: '#e63946',
    fontSize: 14,
    fontFamily: 'JosefinSans_600SemiBold',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'JosefinSans_600SemiBold',
    color: '#111',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: 'JosefinSans_400Regular',
    color: '#666',
    marginBottom: 30,
  },
  discoverButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  discoverText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'JosefinSans_600SemiBold',
  },

  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: 'JosefinSans_600SemiBold',
    color: '#111',
  },
  totalAmount: {
    fontSize: 22,
    fontFamily: 'CormorantGaramond_700Bold',
    color: '#000',
  },

  checkoutButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'JosefinSans_600SemiBold',
  },
});
