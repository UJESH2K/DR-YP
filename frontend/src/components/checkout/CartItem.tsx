import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { CartItem as CartItemType } from '../../state/cart';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  return (
    <View style={styles.cartItemContainer}>
      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemBrand}>{item.brand}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cartItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: 'JosefinSans_600SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  itemBrand: {
    fontFamily: 'JosefinSans_400Regular',
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  itemQuantity: {
    fontFamily: 'JosefinSans_400Regular',
    fontSize: 14,
  },
});

export default CartItem;
