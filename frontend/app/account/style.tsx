import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

export default function StyleScreen() {
  const router = useRouter()

  const [selectedStyles, setSelectedStyles] = useState(['casual', 'streetwear'])
  const [selectedColors, setSelectedColors] = useState(['black', 'white', 'blue'])
  const [selectedBrands, setSelectedBrands] = useState(['nike', 'adidas'])

  const styleOptions = [
    { id: 'casual', name: 'Casual', icon: '👕' },
    { id: 'formal', name: 'Formal', icon: '👔' },
    { id: 'streetwear', name: 'Streetwear', icon: '🧢' },
    { id: 'vintage', name: 'Vintage', icon: '🕶️' },
    { id: 'minimalist', name: 'Minimalist', icon: '⚪' },
    { id: 'bohemian', name: 'Bohemian', icon: '🌸' },
  ]

  const colorOptions = [
    { id: 'black', name: 'Black', color: '#000000' },
    { id: 'white', name: 'White', color: '#FFFFFF' },
    { id: 'blue', name: 'Blue', color: '#2196F3' },
    { id: 'red', name: 'Red', color: '#F44336' },
    { id: 'green', name: 'Green', color: '#4CAF50' },
    { id: 'pink', name: 'Pink', color: '#E91E63' },
    { id: 'gray', name: 'Gray', color: '#9E9E9E' },
    { id: 'brown', name: 'Brown', color: '#795548' },
  ]

  const brandOptions = [
    { id: 'nike', name: 'Nike' },
    { id: 'adidas', name: 'Adidas' },
    { id: 'zara', name: 'Zara' },
    { id: 'hm', name: 'H&M' },
    { id: 'uniqlo', name: 'Uniqlo' },
    { id: 'gucci', name: 'Gucci' },
  ]

  const toggleSelection = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item))
    } else {
      setArray([...array, item])
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Style Preference</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Help us personalize your shopping experience by selecting your style preferences.
        </Text>

        {/* Style Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style Categories</Text>
          <View style={styles.optionsGrid}>
            {styleOptions.map((style) => (
              <Pressable
                key={style.id}
                style={[
                  styles.optionCard,
                  selectedStyles.includes(style.id) && styles.selectedCard
                ]}
                onPress={() => toggleSelection(selectedStyles, setSelectedStyles, style.id)}
              >
                <Text style={styles.optionIcon}>{style.icon}</Text>
                <Text style={[
                  styles.optionText,
                  selectedStyles.includes(style.id) && styles.selectedText
                ]}>
                  {style.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Favorite Colors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Colors</Text>
          <View style={styles.colorGrid}>
            {colorOptions.map((color) => (
              <Pressable
                key={color.id}
                style={[
                  styles.colorOption,
                  { backgroundColor: color.color },
                  selectedColors.includes(color.id) && styles.selectedColor
                ]}
                onPress={() => toggleSelection(selectedColors, setSelectedColors, color.id)}
              >
                {selectedColors.includes(color.id) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Preferred Brands */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Brands</Text>
          <View style={styles.brandGrid}>
            {brandOptions.map((brand) => (
              <Pressable
                key={brand.id}
                style={[
                  styles.brandOption,
                  selectedBrands.includes(brand.id) && styles.selectedBrand
                ]}
                onPress={() => toggleSelection(selectedBrands, setSelectedBrands, brand.id)}
              >
                <Text style={[
                  styles.brandText,
                  selectedBrands.includes(brand.id) && styles.selectedBrandText
                ]}>
                  {brand.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        </Pressable>
        
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  backText: {
    fontSize: 24,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
    marginTop: 20,
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  selectedText: {
    color: '#ffffff',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#000000',
  },
  checkmark: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  brandOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBrand: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  brandText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  selectedBrandText: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
})
