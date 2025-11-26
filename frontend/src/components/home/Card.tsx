import React from 'react';
import { View, Text, Image, Animated, StyleSheet } from 'react-native';
import type { Item } from '../../types';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/dimensions';
import { formatPrice } from '../../utils/formatting';

interface CardProps {
  item: Item;
  style?: any;
  likeOpacity?: Animated.AnimatedInterpolation<number>;
  nopeOpacity?: Animated.AnimatedInterpolation<number>;
  isNext?: boolean;
  panHandlers?: any;
}

export function Card({ item, style, likeOpacity, nopeOpacity, isNext = false, panHandlers }: CardProps) {
  if (!item) return null;

  return (
    <Animated.View 
      style={[styles.card, style]} 
      pointerEvents={isNext ? 'none' : 'auto'}
      {...panHandlers}
    >
      {likeOpacity && <Animated.View style={[styles.overlay, styles.likeOverlay, { opacity: likeOpacity }]} />}
      {nopeOpacity && <Animated.View style={[styles.overlay, styles.dislikeOverlay, { opacity: nopeOpacity }]} />}
      
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      
      <View style={styles.infoSection}>
        <Text style={styles.cardBrand}>{item.brand}</Text>
        <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
        <View style={styles.tagsContainer}>
          {item.tags?.slice(0, 3).map((tag: string) => (
            <View key={tag} style={[styles.tag, isNext && { opacity: 0.7 }]}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.cardPrice, isNext && { opacity: 0.7 }]}>{formatPrice(item.price)}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  cardImage: {
    width: '100%',
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  infoSection: {
    padding: 15,
    flexShrink: 1,
  },
  cardBrand: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 4,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: '#333',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    zIndex: 10,
  },
  likeOverlay: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
  },
  dislikeOverlay: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
});