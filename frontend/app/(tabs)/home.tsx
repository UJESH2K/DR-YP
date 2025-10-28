// ...imports unchanged
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  PanResponder,
  ScrollView, // <-- ADDED
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCartStore } from '../../src/state/cart'
import { useWishlistStore } from '../../src/state/wishlist'
import { useInteractionStore } from '../../src/state/interactions'
import { useAuthStore } from '../../src/state/auth'
import type { Item } from '../../src/data/items'
import { ITEMS } from '../../src/data/items'
import { getInitialItems, initRecommender, onItemViewed, rankItems, updateModel } from '../../src/lib/recommender'
import { sendInteraction, checkBackendHealth } from '../../src/lib/api'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

type LastAction = { action: 'like' | 'dislike' | 'cart'; item: Item; index: number } | null

export default function HomeScreen() {
  const addToCart = useCartStore((s) => s.addToCart)
  const addToWishlist = useWishlistStore((s) => s.addToWishlist)
  const pushInteraction = useInteractionStore((s) => s.pushInteraction)
  const { loadUser } = useAuthStore()

  const [items, setItems] = useState<Item[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastAction, setLastAction] = useState<LastAction>(null)

  // Card animation
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current
  const opacity = useRef(new Animated.Value(1)).current
  const scale = useRef(new Animated.Value(1)).current

  // Bottom sheet animation (for swipe-up details)
  const SHEET_HEIGHT = Math.min(360, SCREEN_HEIGHT * 0.55)
  const sheetTranslateY = useRef(new Animated.Value(SHEET_HEIGHT)).current
  // sheetOpen is a state so React re-renders when sheet opens/closes (fixes pointerEvents & interactivity)
  const [sheetOpen, setSheetOpen] = useState(false)
  const sheetOpenRef = useRef(sheetOpen)

  const loadingRef = useRef(loading)
  const itemsRef = useRef(items)
  const loadingTimeoutRef = useRef<any>(null)
  useEffect(() => { loadingRef.current = loading }, [loading])
  useEffect(() => { itemsRef.current = items }, [items])

  // keep the ref in sync with state so PanResponder closures can read latest value
  useEffect(() => { sheetOpenRef.current = sheetOpen }, [sheetOpen])

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  })
  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })
  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  })

  useEffect(() => {
    loadUser()
    initRecommender()
    loadRecommendations()
    // Test backend connection
    checkBackendHealth().then(result => {
      if (result) {
        console.log('✅ Backend connected successfully')
      } else {
        console.warn('⚠️ Backend connection failed - app will work offline')
      }
    })

    loadingTimeoutRef.current = setTimeout(() => {
      if (loadingRef.current && (itemsRef.current?.length || 0) === 0) {
        setLoading(false)
        Alert.alert('Loading Issue', 'Having trouble loading items. Would you like to retry?', [
          { text: 'Retry', onPress: () => setTimeout(loadRecommendations, 100) },
          { text: 'Continue Anyway' },
        ])
      }
    }, Platform.OS === 'android' ? 6000 : 8000)

    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
  }, [])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      const timeoutPromise = new Promise<Item[]>((resolve) => setTimeout(() => resolve(ITEMS), 3500))
      const loadPromise = getInitialItems().catch(() => ITEMS)
      const initialItems = await Promise.race([loadPromise, timeoutPromise])
      setItems(initialItems && initialItems.length ? initialItems : ITEMS)
    } catch {
      setItems(ITEMS)
    } finally {
      setLoading(false)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
  }

  // Bottom sheet controls — update both ref and state so UI becomes interactive immediately
  const openSheet = () => {
    sheetOpenRef.current = true
    setSheetOpen(true)
    Animated.timing(sheetTranslateY, { toValue: 0, duration: 220, useNativeDriver: true }).start()
  }
  const closeSheet = (immediate = false) => {
    // animate then update state/ref when done
    const finish = () => {
      sheetOpenRef.current = false
      setSheetOpen(false)
    }

    if (immediate) {
      sheetTranslateY.setValue(SHEET_HEIGHT)
      finish()
      return
    }

    Animated.timing(sheetTranslateY, { toValue: SHEET_HEIGHT, duration: 200, useNativeDriver: true }).start(() => finish())
  }

  // Swipe thresholds — adjusted so a SMALL upward swipe opens the details reliably
  const H_VELOCITY = 0.22
  const H_DISTANCE = 50
  const V_VELOCITY_UP = -0.05 // previously -0.15 — easier to trigger
  const V_DISTANCE_UP = -8    // previously -20 — smaller upward movement opens sheet
  const V_VELOCITY_DOWN = 0.35
  const V_DISTANCE_DOWN = 90

  // PanResponder for card + open details on small swipe up
  const panResponder = PanResponder.create({
    // <-- changed: don't start or capture move gestures when sheet is open
    onStartShouldSetPanResponder: () => !sheetOpenRef.current,
    onMoveShouldSetPanResponder: (_evt, { dx, dy }) => {
      if (sheetOpenRef.current) return false
      return Math.abs(dx) > 2 || Math.abs(dy) > 2
    },
    onPanResponderGrant: () => {
      if (isAnimating) return
      position.stopAnimation()
      scale.stopAnimation()
    },
    onPanResponderMove: (_evt, { dx, dy }) => {
      if (isAnimating || currentIndex >= items.length) return
      // If sheet is open we don't want the card to move — use the synced ref
      if (sheetOpenRef.current) return
      requestAnimationFrame(() => {
        position.setValue({ x: dx, y: dy })
        const displacement = Math.max(Math.abs(dx) / SCREEN_WIDTH, Math.abs(dy) / SCREEN_HEIGHT)
        const scaleValue = 1 + displacement * 0.03
        scale.setValue(Math.min(scaleValue, 1.08))
      })
    },
    onPanResponderRelease: (_evt, { dx, vx, dy, vy }) => {
      if (isAnimating || currentIndex >= items.length) return

      // If sheet already open, snap card back
      if (sheetOpenRef.current) {
        Animated.parallel([
          Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true, tension: 150, friction: 10 }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 150, friction: 10 }),
        ]).start()
        return
      }

      // Open details on tiny upward gesture first (takes priority over left/right)
      const smallSwipeUp = dy < V_DISTANCE_UP || vy < V_VELOCITY_UP
      if (smallSwipeUp) {
        Animated.parallel([
          Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true, tension: 150, friction: 10 }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 150, friction: 10 }),
        ]).start(() => openSheet())
        return
      }

      // Otherwise handle dismiss swipes
      const isSwipeDown = dy > V_DISTANCE_DOWN || vy > V_VELOCITY_DOWN
      const isSwipeRight = dx > H_DISTANCE || vx > H_VELOCITY
      const isSwipeLeft = dx < -H_DISTANCE || vx < -H_VELOCITY

      if (isSwipeDown || isSwipeRight || isSwipeLeft) {
        const decision: 'like' | 'dislike' | 'cart' =
          isSwipeDown ? 'cart' : isSwipeRight ? 'like' : 'dislike'
        onDecision(decision)
        return
      }

      Animated.parallel([
        Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true, tension: 150, friction: 10 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 150, friction: 10 }),
      ]).start()
    },
  })

  const onDecision = async (decision: 'like' | 'dislike' | 'cart') => {
    if (isAnimating || currentIndex >= items.length) return
    try {
      setIsAnimating(true)
      const currentItem = items[currentIndex]
      if (!currentItem) return

      try { pushInteraction({ itemId: currentItem.id, action: decision, at: Date.now(), tags: currentItem.tags, priceTier: currentItem.priceTier }) } catch {}
      try {
        if (decision === 'like') addToWishlist(currentItem)
        else if (decision === 'cart')
          addToCart({ id: currentItem.id, title: currentItem.title, price: currentItem.price, image: currentItem.image, brand: currentItem.brand, quantity: 1 })
      } catch {}
      // Send interaction to backend API
      try { sendInteraction(decision, currentItem.id) } catch {}
      try {
        updateModel(decision, currentItem)
        const rest = items.slice(currentIndex + 1)
        const reranked = rankItems(rest)
        setItems([...items.slice(0, currentIndex + 1), ...reranked])
      } catch {}

      const direction = decision === 'like' ? 1 : decision === 'dislike' ? -1 : 0
      const exitY = decision === 'cart' ? -SCREEN_HEIGHT : 0
      const exitX = decision === 'cart' ? 0 : direction * SCREEN_WIDTH * 1.15

      await new Promise<void>((resolve) => {
        Animated.parallel([
          Animated.timing(position, { toValue: { x: exitX, y: exitY }, duration: 260, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.05, duration: 200, useNativeDriver: true }),
        ]).start(() => resolve())
      })
    } finally {
      position.setValue({ x: 0, y: 0 })
      opacity.setValue(1)
      scale.setValue(1)
      setCurrentIndex((p) => p + 1)
      setIsAnimating(false)
      // ensure sheet closes when a decision comes from inside the sheet
      if (sheetOpenRef.current) closeSheet()
    }
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  const currentItem = items[currentIndex]
  const nextItem = items[currentIndex + 1]

  useEffect(() => {
    try { if (currentItem) onItemViewed(currentItem) } catch {}
    if (sheetOpenRef.current) closeSheet()
  }, [currentItem?.id])

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.header}><Text style={styles.headerTitle}>DRYP</Text></View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Finding great styles for you…</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (currentIndex >= items.length) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.header}><Text style={styles.headerTitle}>DRYP</Text></View>
        <View style={styles.endContainer}>
          <Text style={styles.endTitle}>✨ All caught up!</Text>
          <Text style={styles.endSubtitle}>Check back soon for more personalized recommendations</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>DRYP</Text>

        {/* Improved search: limited width and tappable */}
        <Pressable style={styles.searchContainer} onPress={() => Alert.alert('Search', 'Open search UI here')}> 
          <Text style={styles.searchIcon}>🔍</Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.searchPlaceholder}>Search</Text>
        </Pressable>

        <Pressable style={styles.notificationButton} onPress={() => Alert.alert('Notifications') }>
          <Text style={styles.notificationIcon}>🔔</Text>
        </Pressable>
      </View>

      <View style={styles.filtersContainer}>
        <Pressable style={styles.filterButton}><Text style={styles.filterIcon}>☰</Text></Pressable>
        <Pressable style={styles.categoryButton}><Text style={styles.categoryText}>Brand</Text><Text style={styles.categoryArrow}>▼</Text></Pressable>
        <Pressable style={styles.categoryButton}><Text style={styles.categoryText}>Product</Text><Text style={styles.categoryArrow}>▼</Text></Pressable>
        <Pressable style={styles.categoryButton}><Text style={styles.categoryText}>Col</Text><Text style={styles.categoryArrow}>▼</Text></Pressable>
      </View>

      <View style={styles.cardStack}>
        {nextItem && (
          <View style={[styles.card, styles.nextCard]} pointerEvents="none">
            <Image source={{ uri: nextItem.image }} style={styles.cardImage} />
            <View style={styles.cardOverlay}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{nextItem.title}</Text>
                <Text style={styles.cardSubtitle}>{nextItem.subtitle}</Text>
                <Text style={styles.cardPrice}>{formatPrice(nextItem.price)}</Text>
              </View>
            </View>
          </View>
        )}

        <Animated.View
          style={[
            styles.cardContainer,
            { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }, { scale }], opacity },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={[styles.card, styles.currentCard]}>
            <Image source={{ uri: currentItem.image }} style={styles.cardImage} />

            <Animated.View pointerEvents="none" style={[styles.choiceOverlay, styles.likeOverlay, { opacity: likeOpacity }]}> 
              <Text style={styles.likeText}>LOVE</Text>
            </Animated.View>

            <Animated.View pointerEvents="none" style={[styles.choiceOverlay, styles.dislikeOverlay, { opacity: nopeOpacity }]}> 
              <Text style={styles.dislikeText}>PASS</Text>
            </Animated.View>

            <View style={styles.cardOverlay}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardBrand}>{currentItem.brand}</Text>
                <Text style={styles.cardTitle}>{currentItem.title}</Text>
                <Text style={styles.cardSubtitle}>{currentItem.subtitle}</Text>
                <Text style={styles.cardPrice}>{formatPrice(currentItem.price)}</Text>
                <View style={styles.tagsContainer}>
                  {currentItem.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Sheet: details on tiny swipe up — simplified (no internal scrolling) */}
      <Animated.View
        pointerEvents={sheetOpen ? 'auto' : 'none'}
        style={[styles.sheetContainer, { height: SHEET_HEIGHT, transform: [{ translateY: sheetTranslateY }] }]}
      >
        <View style={styles.sheetHandleRow}>
          <View style={styles.sheetHandle} />
          <Pressable onPress={() => closeSheet()} hitSlop={12}><Text style={styles.sheetClose}>✕</Text></Pressable>
        </View>

        {/* <-- CHANGED: wrap sheet content in ScrollView with nestedScrollEnabled so Android scrolling and taps work */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.descriptionTitle}>Product Details</Text>
          <Text style={styles.descriptionText}>{currentItem.description}</Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailsColumn}>
              <Text style={styles.detailsLabel}>Available Sizes</Text>
              <View style={styles.sizesRow}>
                {currentItem.sizes.slice(0, 6).map((size, idx) => (
                  <Pressable key={idx} style={styles.sizeChip} onPress={() => Alert.alert('Size', `Selected ${size}`)}>
                    <Text style={styles.sizeText}>{size}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.detailsColumn}>
              <Text style={styles.detailsLabel}>Colors</Text>
              <View style={styles.colorsRow}>
                {currentItem.colors.slice(0, 6).map((c, idx) => (
                  <Pressable key={idx} style={styles.colorChip} onPress={() => Alert.alert('Color', `Selected ${c}`)}>
                    <Text style={styles.colorText}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {/* Call onDecision directly — onDecision will close the sheet after finishing */}
            <Pressable style={styles.addToCartBtn} onPress={() => onDecision('cart')}>
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </Pressable>
            <Pressable style={styles.likeBtn} onPress={() => onDecision('like')}>
              <Text style={styles.likeBtnText}>♡ Like</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#ffffff', justifyContent: 'space-between' },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#000000', letterSpacing: 0.5 },

  // Search: limited width so it doesn't expand too much
  searchContainer: { flex: 0.5, minWidth: 100, maxWidth: 160, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f7f7f7', borderRadius: 18, paddingHorizontal: 10, paddingVertical: 8, marginHorizontal: 10, borderWidth: 1, borderColor: '#e9e9e9' },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchPlaceholder: { fontSize: 14, color: '#9a9a9a', flexShrink: 1 },

  notificationButton: { padding: 6 },
  notificationIcon: { fontSize: 18 },

  filtersContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#ffffff', gap: 10 },
  filterButton: { backgroundColor: '#ffffff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, borderWidth: 1, borderColor: '#e0e0e0' },
  filterIcon: { fontSize: 14, color: '#333333' },
  categoryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, gap: 5, borderWidth: 1, borderColor: '#e0e0e0' },
  categoryText: { fontSize: 13, fontWeight: '500', color: '#333333' },
  categoryArrow: { fontSize: 10, color: '#666666' },

  cardStack: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  cardContainer: { width: SCREEN_WIDTH - 40, height: SCREEN_HEIGHT * 0.65, position: 'absolute', zIndex: 2, elevation: 5 },
  card: { width: SCREEN_WIDTH - 40, height: SCREEN_HEIGHT * 0.65, backgroundColor: '#ffffff', borderRadius: 20, position: 'absolute', shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
  nextCard: { opacity: 0.8, zIndex: 1, transform: [{ scale: 0.95 }] },
  currentCard: { zIndex: 2, elevation: 5 },
  cardImage: { width: '100%', height: '70%', borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: '#f5f5f5' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, padding: 20, justifyContent: 'center' },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardBrand: { fontSize: 12, fontWeight: '600', color: '#888888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#000000', lineHeight: 26, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#666666', fontWeight: '400', marginBottom: 8, lineHeight: 18 },
  cardPrice: { fontSize: 18, fontWeight: '800', color: '#000000', marginBottom: 12 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 11, fontWeight: '500', color: '#666666' },

  choiceOverlay: { position: 'absolute', top: 50, padding: 20, borderRadius: 12, zIndex: 10 },
  likeOverlay: { right: 20, backgroundColor: 'rgba(76, 175, 80, 0.9)', transform: [{ rotate: '15deg' }] },
  dislikeOverlay: { left: 20, backgroundColor: 'rgba(244, 67, 54, 0.9)', transform: [{ rotate: '-15deg' }] },
  likeText: { color: '#ffffff', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  dislikeText: { color: '#ffffff', fontSize: 20, fontWeight: '900', letterSpacing: 2 },

  // Bottom sheet
  sheetContainer: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#ffffff', borderTopLeftRadius: 16, borderTopRightRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 10 },
  sheetHandleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, paddingHorizontal: 16 },
  sheetHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: '#ddd', marginBottom: 6 },
  sheetClose: { fontSize: 18, color: '#666', padding: 8 },
  sheetContent: { padding: 16, paddingBottom: 24 },

  descriptionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 8 },
  descriptionText: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 16 },

  detailsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  detailsColumn: { flex: 1 },
  detailsLabel: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8 },
  sizesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sizeChip: { backgroundColor: '#f5f5f5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  sizeText: { fontSize: 13, fontWeight: '600', color: '#000' },
  colorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorChip: { backgroundColor: '#f5f5f5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  colorText: { fontSize: 13, fontWeight: '600', color: '#000' },

  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  addToCartBtn: { flex: 1, backgroundColor: '#000000', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  addToCartText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  likeBtn: { flex: 1, backgroundColor: '#FF8A80', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  likeBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  endContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  endTitle: { fontSize: 20, fontWeight: '700' },
  endSubtitle: { fontSize: 14, color: '#666', marginTop: 6 },
})
