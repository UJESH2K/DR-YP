import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, ActivityIndicator, Alert, RefreshControl, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiCall } from '../../src/lib/api';
import { useCartStore } from '../../src/state/cart';
import { useWishlistStore } from '../../src/state/wishlist';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.9:5000';
const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const { addToCart } = useCartStore();
    const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlistStore();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const isProductInWishlist = isWishlisted(id as string);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const productData = await apiCall(`/api/products/${id}`);
                setProduct(productData);
            } catch (error) {
                console.error("Failed to fetch product:", error);
                Alert.alert("Error", "Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (product?.variants?.length > 0) {
            const variant = product.variants.find(v =>
                Object.keys(selectedOptions).every(key => v.options[key] === selectedOptions[key])
            );
            setSelectedVariant(variant);
        }
    }, [selectedOptions, product]);

    const handleOptionSelect = (name, value) => {
        setSelectedOptions(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAddToCart = () => {
        if (!product) return;
        const hasVariants = product.options && product.options.length > 0;
        if (hasVariants && !selectedVariant) {
            Alert.alert('Please select options', 'You must select all available options before adding to cart.');
            return;
        }
        try {
            addToCart({
                productId: product._id,
                title: product.name,
                brand: product.brand,
                image: product.images[0],
                price: selectedVariant ? selectedVariant.price : product.basePrice,
                options: hasVariants ? selectedOptions : undefined,
                quantity: 1,
            });
            Alert.alert('Success', `${product.name} added to cart!`);
        } catch (error) {
            Alert.alert('Error', 'Failed to add item to cart.');
        }
    };

    const handleWishlistToggle = () => {
        if (!product) return;
        if (isProductInWishlist) {
            removeFromWishlist(product._id);
        } else {
            addToWishlist(product);
        }
    };

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        router.back();
        // The timeout ensures the refresh indicator is visible for a moment
        setTimeout(() => setIsRefreshing(false), 500); 
    }, [router]);

    if (loading) {
        return <ActivityIndicator size="large" style={styles.centered} />;
    }

    if (!product) {
        return <View style={styles.centered}><Text>Product not found.</Text></View>;
    }

    const stockStatus = selectedVariant ? (selectedVariant.stock > 0 ? 'In Stock' : 'Out of Stock') : (product.stock > 0 ? 'In Stock' : 'Out of Stock');

    const renderProductContent = () => (
        <>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageCarousel}>
                {product.images.map((img, index) => (
                    <Image key={index} source={{ uri: `${API_BASE_URL}${img}` }} style={styles.productImage} />
                ))}
            </ScrollView>
            
            <View style={styles.detailsContainer}>
                <Text style={styles.brand}>{product.brand}</Text>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.price}>${(selectedVariant?.price || product.basePrice).toFixed(2)}</Text>
                <Text style={styles.description}>{product.description}</Text>

                {product.options.map(option => (
                    <View key={option.name} style={styles.optionContainer}>
                        <Text style={styles.optionTitle}>{option.name}</Text>
                        <View style={styles.optionButtons}>
                            {option.values.map(value => (
                                <Pressable key={value} style={[styles.optionButton, selectedOptions[option.name] === value && styles.optionButtonSelected]} onPress={() => handleOptionSelect(option.name, value)}>
                                    <Text style={[styles.optionText, selectedOptions[option.name] === value && styles.optionTextSelected]}>{value}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                ))}
                
                <Text style={stockStatus === 'In Stock' ? styles.stockIn : styles.stockOut}>{stockStatus}</Text>

                <View style={styles.actions}>
                    <Pressable style={styles.wishlistButton} onPress={handleWishlistToggle}>
                        <Ionicons 
                            name={isProductInWishlist ? "heart" : "heart-outline"} 
                            size={24} 
                            color={isProductInWishlist ? "#FF6B6B" : "#000"} 
                        />
                    </Pressable>
                    <Pressable style={styles.cartButton} onPress={handleAddToCart}>
                        <Text style={styles.cartButtonText}>Add to Cart</Text>
                    </Pressable>
                </View>
            </View>
        </>
    );

    return (
        <SafeAreaView style={styles.container}>
             <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </Pressable>
            </View>
            <FlatList
                data={[]}
                renderItem={null}
                keyExtractor={() => 'product-page'}
                ListHeaderComponent={renderProductContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor="#999"
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { 
        position: 'absolute', 
        top: 40, // Adjust for status bar
        left: 20,
        right: 20,
        zIndex: 1, 
        backgroundColor: 'transparent',
    },
    imageCarousel: { height: screenWidth }, // Make image a square
    productImage: { width: screenWidth, height: screenWidth, resizeMode: 'cover' },
    detailsContainer: { padding: 20 },
    brand: { fontSize: 16, color: '#888', marginBottom: 5 },
    name: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    price: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
    description: { fontSize: 14, lineHeight: 22, color: '#666' },
    optionContainer: { marginBottom: 15 },
    optionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
    optionButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    optionButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' },
    optionButtonSelected: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
    optionText: { color: '#1a1a1a' },
    optionTextSelected: { color: '#fff' },
    stockIn: { fontSize: 16, color: '#10B981', fontWeight: '600', marginBottom: 15 },
    stockOut: { fontSize: 16, color: '#EF4444', fontWeight: '600', marginBottom: 15 },
    actions: { flexDirection: 'row', marginTop: 20, gap: 10, paddingBottom: 40 }, // Added paddingBottom
    wishlistButton: { padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
    cartButton: { flex: 1, padding: 15, borderRadius: 15, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    cartButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
