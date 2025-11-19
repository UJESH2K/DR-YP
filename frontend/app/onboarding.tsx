import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  FlatList, 
  StyleSheet, 
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/state/auth';
import { apiCall } from '../src/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Data copied from style.tsx for onboarding
const styleOptions = [
  { id: 'casual', name: 'Casual', icon: '👕' },
  { id: 'formal', name: 'Formal', icon: '👔' },
  { id: 'streetwear', name: 'Streetwear', icon: '🧢' },
  { id: 'vintage', name: 'Vintage', icon: '🕶️' },
  { id: 'minimalist', name: 'Minimalist', icon: '⚪' },
  { id: 'bohemian', name: 'Bohemian', icon: '🌸' },
];

const colorOptions = [
  { id: 'black', name: 'Black', color: '#000000' },
  { id: 'white', name: 'White', color: '#FFFFFF' },
  { id: 'blue', name: 'Blue', color: '#2196F3' },
  { id: 'red', name: 'Red', color: '#F44336' },
  { id: 'green', name: 'Green', color: '#4CAF50' },
  { id: 'pink', name: 'Pink', color: '#E91E63' },
  { id: 'gray', name: 'Gray', color: '#9E9E9E' },
  { id: 'brown', name: 'Brown', color: '#795548' },
];

const brandOptions = [
  { id: 'nike', name: 'Nike' },
  { id: 'adidas', name: 'Adidas' },
  { id: 'zara', name: 'Zara' },
  { id: 'hm', name: 'H&M' },
  { id: 'uniqlo', name: 'Uniqlo' },
  { id: 'gucci', name: 'Gucci' },
];

type OnboardingStep = 'categories' | 'colors' | 'brands';

export default function Onboarding() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  
  const [step, setStep] = useState<OnboardingStep>('categories');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(user?.preferences?.categories || []);
  const [selectedColors, setSelectedColors] = useState<string[]>(user?.preferences?.colors || []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(user?.preferences?.brands || []);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSelection = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const handleNext = () => {
    if (step === 'categories') {
      setStep('colors');
    } else if (step === 'colors') {
      setStep('brands');
    }
  };

  const handleBack = () => {
    if (step === 'brands') {
      setStep('colors');
    } else if (step === 'colors') {
      setStep('categories');
    }
  };

  const finishOnboarding = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const preferences = {
        categories: selectedCategories,
        colors: selectedColors,
        brands: selectedBrands,
      };

      const updatedUser = await apiCall('/api/users/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences),
      });

      if (updatedUser) {
        await updateUser(updatedUser);
        console.log('User preferences saved to backend and state updated.');
      } else {
        throw new Error('Failed to save preferences');
      }
      
      router.replace('/(tabs)/home');
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Could not save your preferences. Please try again.', [{ text: 'OK' }]);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'categories':
        return (
          <FlatList
            key="categories"
            data={styleOptions}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.optionCard, selectedCategories.includes(item.id) && styles.selectedCard]}
                onPress={() => toggleSelection(selectedCategories, setSelectedCategories, item.id)}
              >
                <Text style={styles.optionIcon}>{item.icon}</Text>
                <Text style={[styles.optionText, selectedCategories.includes(item.id) && styles.selectedText]}>
                  {item.name}
                </Text>
              </Pressable>
            )}
          />
        );
      case 'colors':
        return (
          <FlatList
            key="colors"
            data={colorOptions}
            keyExtractor={(item) => item.id}
            numColumns={4}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.colorOption, { backgroundColor: item.color }, selectedColors.includes(item.id) && styles.selectedColor]}
                onPress={() => toggleSelection(selectedColors, setSelectedColors, item.id)}
              >
                {selectedColors.includes(item.id) && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
            )}
          />
        );
      case 'brands':
        return (
          <FlatList
            key="brands"
            data={brandOptions}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.brandOption, selectedBrands.includes(item.id) && styles.selectedBrand]}
                onPress={() => toggleSelection(selectedBrands, setSelectedBrands, item.id)}
              >
                <Text style={[styles.brandText, selectedBrands.includes(item.id) && styles.selectedBrandText]}>
                  {item.name}
                </Text>
              </Pressable>
            )}
          />
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'categories': return 'Choose Your Styles';
      case 'colors': return 'Select Favorite Colors';
      case 'brands': return 'Pick Preferred Brands';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>Help us personalize your experience.</Text>
      </View>

      {renderContent()}

      <View style={styles.footer}>
        {step !== 'categories' && (
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.nextButton, isLoading && styles.disabledButton]}
          onPress={step === 'brands' ? finishOnboarding : handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.nextButtonText}>
              {step === 'brands' ? 'Finish' : 'Next'}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  grid: {
    paddingHorizontal: 16,
  },
  optionCard: {
    flex: 1,
    margin: 8,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#f8f9fa',
  },
  selectedCard: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  selectedText: {
    color: '#ffffff',
  },
  colorOption: {
    width: (SCREEN_WIDTH - 96) / 4,
    height: (SCREEN_WIDTH - 96) / 4,
    borderRadius: (SCREEN_WIDTH - 96) / 8,
    margin: 8,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColor: {
    borderColor: '#ffffff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  checkmark: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  brandOption: {
    flex: 1,
    margin: 8,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#f8f9fa',
  },
  selectedBrand: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  brandText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  selectedBrandText: {
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#f8f9fa',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  nextButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});