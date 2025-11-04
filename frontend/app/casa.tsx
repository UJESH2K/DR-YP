import React, { useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  Easing,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native'
import { useFonts, StyleScript_400Regular } from '@expo-google-fonts/style-script'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle, Rect } from 'react-native-svg'
import { router } from 'expo-router'

import { ITEMS } from '../src/data/items'
import { useCartStore } from '../src/state/cart'
import { useWishlistStore } from '../src/state/wishlist'
import { useThemeStore } from '../src/state/theme'

// Gen Z Theme will be handled by theme store - removing static colors

// Simple scaling pressable for micro-interactions
function PressableScale({ children, onPress, style, accessibilityLabel }: any) {
  const scale = useRef(new Animated.Value(1)).current
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        onPressIn={() => Animated.timing(scale, { toValue: 0.97, duration: 90, easing: Easing.out(Easing.quad), useNativeDriver: true }).start()}
        onPressOut={() => Animated.timing(scale, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }).start()}
        onPress={onPress}
        style={{ borderRadius: 9999 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  )
}

function IconFilter({ size = 22, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M6 12h12M10 18h4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  )
}
function IconChevronDown({ size = 18, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}
function IconSearch({ size = 18, color = '#6B7280' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 19a8 8 0 100-16 8 8 0 000 16z" stroke={color} strokeWidth={1.8} />
      <Path d="M21 21l-3.5-3.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  )
}
function IconBell({ size = 20, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 8a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M10 20a2 2 0 004 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  )
}
function IconCart({ size = 22, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6h15l-1.5 8.5a2 2 0 01-2 1.7H9.2a2 2 0 01-2-1.6L5 3H2" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx="9" cy="20" r="1.6" fill={color} />
      <Circle cx="18" cy="20" r="1.6" fill={color} />
    </Svg>
  )
}
function IconHeart({ size = 22, color = '#000000', filled = false }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {filled ? (
        <Path d="M12 21s-8-5.5-8-11a4.5 4.5 0 018-3 4.5 4.5 0 018 3c0 5.5-8 11-8 11z" fill={color} />
      ) : (
        <Path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a4.5 4.5 0 018-3 4.5 4.5 0 018 3z" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      )}
    </Svg>
  )
}
function IconHome({ size = 22, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10l9-7 9 7v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M9 21v-6h6v6" stroke={color} strokeWidth={1.6} />
    </Svg>
  )
}
function IconUser({ size = 22, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={1.6} />
      <Path d="M4 21a8 8 0 0116 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  )
}
function IconBookmark({ size = 22, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 4h12a1 1 0 011 1v16l-7-3-7 3V5a1 1 0 011-1z" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  )
}
function IconShare({ size = 22, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" stroke={color} strokeWidth={1.6} />
      <Path d="M12 16V4" stroke={color} strokeWidth={1.6} />
      <Path d="M8 8l4-4 4 4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  )
}

function IconMoon({ size = 20, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function IconSun({ size = 20, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth={1.6} />
      <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  )
}

function Chip({ label, onPress, colors }: { label: string; onPress?: () => void; colors: any }) {
  return (
    <PressableScale accessibilityLabel={`${label} filter`} onPress={onPress}>
      <View style={[styles.chip, { 
        backgroundColor: colors.surfaceAlt, 
        borderColor: colors.border 
      }]}>
        <Text style={[styles.chipText, { color: colors.text }]}>{label}</Text>
        <IconChevronDown color={colors.text} />
      </View>
    </PressableScale>
  )
}

function BottomNav({ onCart, onWishlist, onProfile, colors }: any) {
  return (
    <View style={[styles.bottomNav, { 
      backgroundColor: colors.surface, 
      borderTopColor: colors.border 
    }]} accessibilityRole="tablist">
      <PressableScale accessibilityLabel="Home" onPress={() => router.push('/deck')}>
        <View style={styles.navItem}>
          <IconHome color={colors.text} />
          <Text style={[styles.navText, { color: colors.text }]}>Home</Text>
        </View>
      </PressableScale>
      <PressableScale accessibilityLabel="Search" onPress={() => router.push('/(tabs)/search')}>
        <View style={styles.navItem}>
          <IconSearch color={colors.text} />
          <Text style={[styles.navText, { color: colors.text }]}>Search</Text>
        </View>
      </PressableScale>
      <PressableScale accessibilityLabel="Cart" onPress={onCart}>
        <View style={styles.navItem}>
          <IconCart color={colors.text} />
          <Text style={[styles.navText, { color: colors.text }]}>Cart</Text>
        </View>
      </PressableScale>
      <PressableScale accessibilityLabel="Wishlist" onPress={onWishlist}>
        <View style={styles.navItem}>
          <IconHeart color={colors.text} />
          <Text style={[styles.navText, { color: colors.text }]}>Saved</Text>
        </View>
      </PressableScale>
      <PressableScale accessibilityLabel="Profile" onPress={onProfile}>
        <View style={styles.navItem}>
          <IconUser color={colors.text} />
          <Text style={[styles.navText, { color: colors.text }]}>You</Text>
        </View>
      </PressableScale>
    </View>
  )
}

function FiltersModal({ visible, onClose }: { visible: boolean; onClose: (applied?: boolean) => void }) {
  const [brands, setBrands] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const toggle = (state: string[], set: (v: string[]) => void, v: string) => {
    set(state.includes(v) ? state.filter((x) => x !== v) : [...state, v])
  }
  const clearAll = () => { setBrands([]); setTypes([]); setColors([]) }
  return (
    <Modal animationType="slide" visible={visible} onRequestClose={() => onClose(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.background }}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filter & Sort</Text>
          <Pressable onPress={() => onClose(false)} accessibilityLabel="Close filters"><Text style={styles.modalClose}>✕</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.sectionTitle}>Brand</Text>
          <View style={styles.chipsRowWrap}>
            {['DANHOP', 'DRYP', 'UrbanFit', 'Classic'].map((b) => (
              <Pressable key={b} onPress={() => toggle(brands, setBrands, b)} style={[styles.selectChip, brands.includes(b) && styles.selectChipActive]} accessibilityLabel={`Brand ${b}`}>
                <Text style={[styles.selectChipText, brands.includes(b) && styles.selectChipTextActive]}>{b}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Product</Text>
          <View style={styles.chipsRowWrap}>
            {['Pants', 'Tops', 'Shoes', 'Accessories'].map((t) => (
              <Pressable key={t} onPress={() => toggle(types, setTypes, t)} style={[styles.selectChip, types.includes(t) && styles.selectChipActive]} accessibilityLabel={`Product ${t}`}>
                <Text style={[styles.selectChipText, types.includes(t) && styles.selectChipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Color</Text>
          <View style={styles.chipsRowWrap}>
            {['Black', 'Blue', 'Grey', 'White'].map((c) => (
              <Pressable key={c} onPress={() => toggle(colors, setColors, c)} style={[styles.selectChip, styles.colorChip, colors.includes(c) && styles.selectChipActive]} accessibilityLabel={`Color ${c}`}>
                <Text style={[styles.selectChipText, colors.includes(c) && styles.selectChipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <PressableScale accessibilityLabel="Clear all" onPress={clearAll}>
            <View style={[styles.footerBtn, { backgroundColor: '#F8F9FA' }]}> 
              <Text style={[styles.footerBtnText, { color: '#000000' }]}>Clear</Text>
            </View>
          </PressableScale>
          <PressableScale accessibilityLabel="Apply filters" onPress={() => onClose(true)}>
            <View style={[styles.footerBtn, { backgroundColor: '#000000' }]}> 
              <Text style={[styles.footerBtnText, { color: '#fff' }]}>Apply</Text>
            </View>
          </PressableScale>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

function ProductQuickModal({ visible, onClose, onAddToCart }: { visible: boolean; onClose: () => void; onAddToCart: () => void }) {
  const [size, setSize] = useState<string>('M')
  const [color, setColor] = useState<string>('Blue')
  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Quick Select</Text>
          <Pressable onPress={onClose} accessibilityLabel="Close"><Text style={styles.modalClose}>✕</Text></Pressable>
        </View>
        <View style={{ padding: 20, gap: 16 }}>
          <Text style={styles.sectionTitle}>Size</Text>
          <View style={styles.chipsRowWrap}>
            {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
              <Pressable key={s} onPress={() => setSize(s)} style={[styles.selectChip, size === s && styles.selectChipActive]} accessibilityLabel={`Size ${s}`}>
                <Text style={[styles.selectChipText, size === s && styles.selectChipTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Color</Text>
          <View style={styles.chipsRowWrap}>
            {['Blue', 'Black', 'Grey'].map((c) => (
              <Pressable key={c} onPress={() => setColor(c)} style={[styles.selectChip, styles.colorChip, color === c && styles.selectChipActive]} accessibilityLabel={`Color ${c}`}>
                <Text style={[styles.selectChipText, color === c && styles.selectChipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.modalFooter}>
          <PressableScale accessibilityLabel="Add to cart" onPress={onAddToCart}>
            <View style={[styles.footerBtn, { backgroundColor: '#000000', flex: 1 }]}> 
              <Text style={[styles.footerBtnText, { color: '#fff' }]}>Add to cart</Text>
            </View>
          </PressableScale>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default function DrypMock() {
  const [fontsLoaded] = useFonts({
    StyleScript_400Regular,
  })

  const product = useMemo(() => ITEMS[0], [])
  const { addToCart } = useCartStore()
  const { addToWishlist } = useWishlistStore()
  const { theme, colors, toggleTheme } = useThemeStore()

  const [liked, setLiked] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showQuick, setShowQuick] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showProductDetails, setShowProductDetails] = useState(false)
  const slideAnim = useRef(new Animated.Value(0)).current

  const pulse = useRef(new Animated.Value(1)).current
  const doPulse = () => {
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.15, duration: 120, useNativeDriver: true }),
      Animated.spring(pulse, { toValue: 1, useNativeDriver: true }),
    ]).start()
  }

  const handleWishlist = () => {
    setLiked((p) => !p)
    doPulse()
    try { addToWishlist(product) } catch {}
  }

  const handleBuyNow = () => {
    // Simulate one-tap buy: add to cart and go to checkout
    try { addToCart({ id: product.id, title: product.title, price: product.price, image: product.image, brand: product.brand, quantity: 1 }) } catch {}
    router.push('/checkout')
  }

  const handleAddToCart = () => {
    try { 
      addToCart({ id: product.id, title: product.title, price: product.price, image: product.image, brand: product.brand, quantity: 1 })
      // Show success feedback
      doPulse()
    } catch {}
    setShowQuick(false)
  }

  const handleNotifications = () => {
    // Navigate to notifications screen or show notifications modal
    router.push('/notifications')
  }

  const handleShare = () => {
    // Share product functionality
    try {
      // In a real app, you would use Share API
      console.log('Sharing product:', product.title)
      doPulse()
    } catch {}
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to search results with query
      router.push(`/(tabs)/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const showProductDetailsModal = () => {
    setShowProductDetails(true)
    // Simple immediate animation without complex timing
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start()
  }

  const hideProductDetailsModal = () => {
    // Force immediate close to prevent sticking
    setShowProductDetails(false)
    slideAnim.setValue(0)
    // Reset animation value to ensure clean state
  }

  // Emergency close function if modal gets stuck
  const forceCloseModal = () => {
    setShowProductDetails(false)
    slideAnim.setValue(0)
  }

  if (!fontsLoaded) {
    return null // or a loading spinner
  }

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.background 
    }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />

      {/* Modern Dark Header - Sleek & Professional */}
      <View style={[styles.modernHeader, { 
        backgroundColor: colors.surface,
      }]}>
        {/* Top Row - Brand & Actions */}
        <View style={styles.headerTopRow}>
          <View style={styles.brandContainer}>
            <Text style={[styles.modernBrand, { 
              color: colors.text,
            }]}>DRYP</Text>
            <View style={[styles.brandAccent, {
              backgroundColor: '#FF6B6B'
            }]} />
          </View>
          
          <View style={styles.headerActions}>
            <PressableScale accessibilityLabel="Toggle theme" onPress={toggleTheme}>
              <View style={[styles.modernIconBtn, { 
                backgroundColor: colors.surfaceAlt,
              }]}>
                {theme === 'dark' ? 
                  <IconSun size={18} color={colors.text} /> : 
                  <IconMoon size={18} color={colors.text} />
                }
              </View>
            </PressableScale>
            <PressableScale accessibilityLabel="Notifications" onPress={handleNotifications}>
              <View style={[styles.modernIconBtn, { 
                backgroundColor: colors.surfaceAlt,
              }]}>
                <IconBell size={18} color={colors.text} />
              </View>
            </PressableScale>
          </View>
        </View>
        
        {/* Modern Search Bar */}
        <View style={[styles.modernSearchContainer, { 
          backgroundColor: colors.surfaceElevated,
        }]}>
          <IconSearch size={20} color={colors.textMuted} />
          <TextInput
            placeholder="Discover your style..."
            placeholderTextColor={colors.textMuted}
            style={[styles.modernSearchInput, { 
              color: colors.text 
            }]}
            accessibilityLabel="Search input"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <PressableScale onPress={() => setSearchQuery('')} accessibilityLabel="Clear search">
              <View style={styles.modernClearBtn}>
                <Text style={[styles.modernClearText, { 
                  color: colors.textMuted 
                }]}>✕</Text>
              </View>
            </PressableScale>
          )}
        </View>
      </View>

      {/* Gen Z Filters - Bold & Contrasted */}
      <View style={[styles.genzFilters, { 
        backgroundColor: colors.background 
      }]}>
        <PressableScale accessibilityLabel="Open filters" onPress={() => setShowFilters(true)}>
          <View style={[styles.genzFilterBtn, { 
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border
          }]}>
            <IconFilter color={colors.text} size={24} />
          </View>
        </PressableScale>
        <PressableScale onPress={() => setShowFilters(true)}>
          <View style={[styles.genzChip, {
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border
          }]}>
            <Text style={[styles.genzChipText, { 
              color: colors.text 
            }]}>Brand</Text>
          </View>
        </PressableScale>
        <PressableScale onPress={() => setShowFilters(true)}>
          <View style={[styles.genzChip, {
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border
          }]}>
            <Text style={[styles.genzChipText, { 
              color: colors.text 
            }]}>Product</Text>
          </View>
        </PressableScale>
        <PressableScale onPress={() => setShowFilters(true)}>
          <View style={[styles.genzChip, {
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border
          }]}>
            <Text style={[styles.genzChipText, { 
              color: colors.text 
            }]}>Color</Text>
          </View>
        </PressableScale>
      </View>

      {/* Gen Z Product Display - Fixed Animation */}
      <View style={styles.productContainer}>
        {/* Static Image Container - Tappable for details */}
        <PressableScale onPress={showProductDetailsModal}>
          <View style={[styles.genzImageContainer, {
            backgroundColor: theme === 'dark' ? '#111111' : '#F8F9FA'
          }]}>
            <Image 
              source={{ uri: product.image }} 
              style={styles.genzProductImage} 
              resizeMode="cover" 
              accessibilityLabel={product.title} 
            />
            
            {/* Floating Action Buttons */}
            <View style={styles.genzActions}>
              <PressableScale accessibilityLabel="Add to cart" onPress={() => setShowQuick(true)}>
                <View style={[styles.genzFab, {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border
                }]}>
                  <IconCart size={24} color={colors.text} />
                </View>
              </PressableScale>
              <PressableScale accessibilityLabel="Save to wishlist" onPress={handleWishlist}>
                <Animated.View style={[styles.genzFab, { 
                  transform: [{ scale: pulse }],
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border
                }]}> 
                  <IconHeart size={24} color={colors.text} filled={liked} />
                </Animated.View>
              </PressableScale>
              <PressableScale accessibilityLabel="Share" onPress={handleShare}>
                <View style={[styles.genzFab, {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border
                }]}>
                  <IconShare size={24} color={colors.text} />
                </View>
              </PressableScale>
            </View>

            {/* Product Info Overlay - CASA Style */}
            <View style={styles.genzProductInfo}>
              <View style={styles.genzProductDetails}>
                <View style={styles.genzBrandRow}>
                  <View style={[styles.genzBrandLogo, {
                    backgroundColor: colors.accent
                  }]}>
                    <Text style={[styles.genzBrandText, {
                      color: colors.background
                    }]}>D</Text>
                  </View>
                  <Text style={styles.genzBrandName}>DRYP</Text>
                </View>
                
                <Text style={styles.genzProductTitle}>{product.title}</Text>
                <Text style={styles.genzProductSubtitle}>Ultra-soft fleece, relaxed fit</Text>
                <Text style={styles.genzPrice}>₹{(product.price * 84).toFixed(0)}</Text>
                
                {/* Product Tags */}
                <View style={styles.genzTags}>
                  <View style={styles.genzTag}>
                    <Text style={styles.genzTagText}>casual</Text>
                  </View>
                  <View style={styles.genzTag}>
                    <Text style={styles.genzTagText}>hoodie</Text>
                  </View>
                  <View style={styles.genzTag}>
                    <Text style={styles.genzTagText}>comfortable</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Swipe Up Indicator - Temporarily Commented Out */}
            {/* <PressableScale onPress={showProductDetailsModal}>
              <View style={styles.swipeIndicator}>
                <Text style={[styles.swipeText, {
                  color: theme === 'dark' ? '#CCCCCC' : '#666666'
                }]}>Tap for details ↑</Text>
              </View>
            </PressableScale> */}
          </View>
        </PressableScale>
      </View>

      <BottomNav 
        onCart={() => router.push('/cart')} 
        onWishlist={() => router.push('/wishlist')} 
        onProfile={() => router.push('/profile')} 
        colors={colors}
      />

      <FiltersModal visible={showFilters} onClose={() => setShowFilters(false)} />
      <ProductQuickModal visible={showQuick} onClose={() => setShowQuick(false)} onAddToCart={handleAddToCart} />
      
      {/* React Native Modal - Guaranteed No Sticking */}
      <Modal
        visible={showProductDetails}
        transparent={true}
        animationType="none"
        onRequestClose={forceCloseModal}
      >
        <View style={styles.simpleModalOverlay}>
          <Pressable 
            onPress={hideProductDetailsModal} 
            style={styles.simpleBackdrop}
            accessibilityLabel="Close modal"
          />
          <Animated.View 
            style={[
              styles.simpleInstagramModal,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [500, 0],
                    }),
                  },
                ],
                opacity: slideAnim,
              },
            ]}
          >
            {/* Instagram-Style Header - Double tap to force close */}
            <Pressable onPress={forceCloseModal} style={styles.instagramHeader}>
              <View style={styles.instagramHandle} />
              <Text style={styles.instagramTitle}>Product Details</Text>
              <Pressable onPress={hideProductDetailsModal}>
                <Text style={styles.instagramClose}>✕</Text>
              </Pressable>
            </Pressable>

            {/* Instagram-Style Content */}
            <ScrollView style={styles.instagramContent} showsVerticalScrollIndicator={false}>
              <View style={styles.instagramProductContent}>
                {/* Product Title & Brand - Instagram Style */}
                <View style={styles.instagramProductHeader}>
                  <Text style={styles.instagramProductTitle}>{product.title}</Text>
                  <Text style={styles.instagramBrand}>DRYP Collection</Text>
                  <Text style={styles.instagramPrice}>₹{(product.price * 84).toFixed(0)}</Text>
                </View>

                {/* Product Description - Instagram Style */}
                <View style={styles.instagramDescSection}>
                  <Text style={styles.instagramSectionTitle}>Description</Text>
                  <Text style={styles.instagramDescText}>
                    Premium quality {product.title.toLowerCase()} crafted with attention to detail. 
                    Perfect for modern fashion enthusiasts who appreciate style and comfort. 
                    Made with sustainable materials and ethical manufacturing practices.
                  </Text>
                </View>

                {/* Size Options - Instagram Style */}
                <View style={styles.instagramOptionsSection}>
                  <Text style={styles.instagramSectionTitle}>Size</Text>
                  <View style={styles.instagramSizeOptions}>
                    {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                      <View key={size} style={styles.instagramSizeOption}>
                        <Text style={styles.instagramSizeText}>{size}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Instagram-Style Action Buttons */}
                <View style={styles.instagramActions}>
                  <Pressable onPress={handleAddToCart} style={styles.instagramAddToCart}>
                    <Text style={styles.instagramAddToCartText}>Add to Cart</Text>
                  </Pressable>
                  <Pressable onPress={handleWishlist} style={styles.instagramWishlist}>
                    <IconHeart size={20} color="#FFFFFF" filled={liked} />
                    <Text style={styles.instagramWishlistText}>Save</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  )
}

const RADIUS = 20

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },

  // Gen Z Header Styles
  genzHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 24,
    borderBottomWidth: 3,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  brand: { 
    fontSize: 32, 
    fontWeight: '100', 
    letterSpacing: -1,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica-Bold' : 'sans-serif',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    transform: [{ scaleY: 1.1 }],
  },

  // Modern Header Styles
  modernHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modernBrand: {
    fontSize: 32,
    fontWeight: '100',
    letterSpacing: 0,
    fontFamily: 'StyleScript_400Regular',
  },
  brandAccent: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modernIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  modernSearchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  modernClearBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernClearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Gen Z Search Bar - Bold & Modern
  genzSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 25,
    borderWidth: 3,
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  genzSearchInput: { 
    flex: 1, 
    fontSize: 18, 
    fontWeight: '700',
    paddingVertical: 0,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '100',
  },
  
  // Gen Z Icon Buttons
  genzIconBtn: { 
    padding: 14, 
    borderRadius: 20, 
    borderWidth: 3,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  
  iconBtn: { 
    padding: 12, 
    borderRadius: 16, 
    borderWidth: 2,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Gen Z Filters - Bold & Modern
  genzFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  genzFilterBtn: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 3,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  genzChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 3,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  genzChipText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  chipText: { 
    fontSize: 14, 
    fontWeight: '700' 
  },

  // Gen Z Product Display - Fixed Animation System
  productContainer: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    bottom: 90,
  },
  genzImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 0,
    overflow: 'hidden',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    borderWidth: 0,
  },
  genzProductImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  genzActions: {
    position: 'absolute',
    right: 20,
    top: 80,
    gap: 16,
  },
  genzFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  genzProductInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 120,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  genzProductDetails: {
    gap: 8,
  },
  genzBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  genzBrandName: {
    fontSize: 16,
    fontWeight: '100',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  genzBrandLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  genzBrandText: {
    fontSize: 14,
    fontWeight: '900',
  },
  genzProductTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 4,
  },
  genzProductSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#CCCCCC',
    marginBottom: 8,
  },
  genzPrice: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  genzTags: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  genzTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  genzTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  swipeIndicator: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeText: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  iconPill: {
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    borderRadius: RADIUS,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginTop: 8,
  },
  rotLeft: { position: 'absolute', left: -80, top: -80, width: 160, height: 160, backgroundColor: 'rgba(17,17,17,0.06)', borderRadius: 80 },
  rotRight: { position: 'absolute', right: -60, bottom: -60, width: 120, height: 120, backgroundColor: 'rgba(17,17,17,0.06)', borderRadius: 60 },

  cardHeader: { position: 'absolute', left: 12, top: 12, zIndex: 2 },
  circleBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },

  cardImage: { width: '100%', height: 560, backgroundColor: '#f2f2f2' },

  verticalActions: {
    position: 'absolute',
    right: 12,
    top: 120,
    zIndex: 2,
    gap: 12,
    alignItems: 'center',
  },
  fab: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.95)', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },

  cardOverlay: { position: 'absolute', left: 12, right: 12, bottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  brandBadge: { flexDirection: 'column', gap: 8 },
  brandLogo: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: '#000000', alignItems: 'center', justifyContent: 'center' },
  brandLogoText: { color: '#000000', fontSize: 16, fontWeight: '800' },
  productTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 6, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
  priceText: { color: '#fff', fontSize: 20, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },

  buyNow: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#ffffff', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  buyNowText: { color: '#000000', fontSize: 15, fontWeight: '700' },

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: { alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 4 },
  navText: { fontSize: 11, fontWeight: '600' },

  // Modal styles
  modalHeader: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#000000' },
  modalClose: { fontSize: 20, color: '#6B7280' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000000', marginTop: 8, marginBottom: 8 },
  chipsRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  selectChipActive: { borderColor: '#000000', backgroundColor: '#111111', },
  selectChipText: { color: '#000000', fontWeight: '600' },
  selectChipTextActive: { color: '#ffffff' },
  colorChip: {},
  modalFooter: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  footerBtn: { paddingVertical: 14, paddingHorizontal: 22, borderRadius: 12 },
  footerBtnText: { fontSize: 16, fontWeight: '700' },

  // Simple Instagram Modal - No Sticking Issues
  simpleModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'flex-end',
  },
  simpleBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  simpleInstagramModal: {
    height: '80%',
    backgroundColor: '#000000',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: -5 },
    elevation: 20,
  },
  instagramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  instagramHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#3C3C3C',
    borderRadius: 2,
    alignSelf: 'center',
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -20,
  },
  instagramTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  instagramClose: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  instagramContent: {
    flex: 1,
  },
  instagramProductContent: {
    padding: 20,
    gap: 20,
  },
  instagramProductHeader: {
    gap: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  instagramProductTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  instagramBrand: {
    fontSize: 14,
    fontWeight: '100',
    color: '#A8A8A8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  instagramPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  instagramDescSection: {
    gap: 12,
  },
  instagramSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  instagramDescText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#D4D4D4',
    fontWeight: '400',
  },
  instagramOptionsSection: {
    gap: 12,
  },
  instagramSizeOptions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  instagramSizeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262626',
    minWidth: 44,
    alignItems: 'center',
  },
  instagramSizeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instagramActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  instagramAddToCart: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  instagramAddToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  instagramWishlist: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#262626',
  },
  instagramWishlistText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})