import React from 'react';
import { View, Text, Image, Animated, StyleSheet, useColorScheme } from 'react-native';
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

export function Card({
  item,
  style,
  likeOpacity,
  nopeOpacity,
  isNext = false,
  panHandlers,
}: CardProps) {
  if (!item) return null;

  const theme = useColorScheme();
  const light = theme !== "dark";

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: light ? "#fff" : "#111",
          shadowColor: light ? "#000" : "#fff",
        },
        style,
      ]}
      pointerEvents={isNext ? "none" : "auto"}
      {...panHandlers}
    >
      {/* Like / Nope Overlays */}
      {likeOpacity && (
        <Animated.View
          style={[styles.overlay, styles.likeOverlay, { opacity: likeOpacity }]}
        />
      )}
      {nopeOpacity && (
        <Animated.View
          style={[
            styles.overlay,
            styles.dislikeOverlay,
            { opacity: nopeOpacity },
          ]}
        />
      )}

      {/* Product Image */}
      <Image source={{ uri: item.image }} style={styles.cardImage} />

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text
          style={[
            styles.cardBrand,
            {
              color: light ? "#777" : "#ccc",
              fontFamily: "JosefinSans_400Regular",
            },
          ]}
        >
          {item.brand}
        </Text>

        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={[
            styles.cardTitle,
            {
              color: light ? "#111" : "#eee",
              fontFamily: "JosefinSans_600SemiBold",
              textAlign: "center",
            },
          ]}
        >
          {item.title}
        </Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {item.tags?.slice(0, 3).map((tag: string) => (
            <View key={tag} style={[styles.tag, isNext && { opacity: 0.7 }]}>
              <Text
                style={[
                  styles.tagText,
                  {
                    fontFamily: "JosefinSans_400Regular",
                  },
                ]}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={[
            styles.cardPrice,
            isNext && { opacity: 0.7 },
            {
              color: light ? "#000" : "#fff",
              fontFamily: "CormorantGaramond_700Bold",
            },
          ]}
        >
          {formatPrice(item.price)}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 22,
    elevation: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    position: 'absolute',
    overflow: 'hidden',
  },

  cardImage: {
    width: '100%',
    height: '68%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },

  infoSection: {
    padding: 16,
    alignItems: "center",
  },

  cardBrand: {
    fontSize: 13,
    marginBottom: 2,
  },

  cardTitle: {
    fontSize: 16,
    marginBottom: 8,
    letterSpacing: 0.3,
  },

  cardPrice: {
    fontSize: 20,
    marginTop: 8,
    letterSpacing: 0.5,
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
    marginBottom: 6,
    justifyContent: "center",
  },

  tag: {
    backgroundColor: "#eee",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },

  tagText: {
    fontSize: 11,
    color: "#444",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    zIndex: 20,
  },

  likeOverlay: {
    backgroundColor: "rgba(0, 255, 0, 0.15)",
  },

  dislikeOverlay: {
    backgroundColor: "rgba(255, 0, 0, 0.15)",
  },
});
