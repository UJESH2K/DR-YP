import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCustomRouter } from '../src/hooks/useCustomRouter';
import { useAuthStore } from '../src/state/auth';
import { useSettingsStore } from '../src/state/settings';
import { useCacheStore } from '../src/state/cache';
import { apiCall } from '../src/lib/api';
import SingleSelectDropdown from '../src/components/SingleSelectDropdown';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const countryCurrencyOptions = [
  { label: '🇮🇳 India (INR)', value: 'INR' },
  { label: '🇺🇸 United States (USD)', value: 'USD' },
  { label: '🇪🇺 Europe (EUR)', value: 'EUR' },
  { label: '🇬🇧 United Kingdom (GBP)', value: 'GBP' },
  { label: '🇯🇵 Japan (JPY)', value: 'JPY' },
  { label: '🇨🇦 Canada (CAD)', value: 'CAD' },
  { label: '🇦🇺 Australia (AUD)', value: 'AUD' },
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

type OnboardingStep = 'currency' | 'categories' | 'colors' | 'brands';

export default function Onboarding() {
  const router = useCustomRouter();
  const { user, updateUser } = useAuthStore();
  const { currency, setCurrency } = useSettingsStore();
  const { categories: cachedCategories, brands: cachedBrands, setCategories: setCachedCategories, setBrands: setCachedBrands } = useCacheStore();

  const [step, setStep] = useState<OnboardingStep>('currency');

  const [categories, setCategories] = useState<string[]>(cachedCategories.data || []);
  const [brands, setBrands] = useState<string[]>(cachedBrands.data || []);
  const [isFetching, setIsFetching] = useState(true);

  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(user?.preferences?.categories || []);
  const [selectedColors, setSelectedColors] = useState<string[]>(user?.preferences?.colors || []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(user?.preferences?.brands || []);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPreferenceData = async () => {
      if (!user) return; // Fix race condition

      setIsFetching(true);
      try {
        const now = Date.now();
        const categoriesPromise =
          cachedCategories.timestamp && now - cachedCategories.timestamp < CACHE_DURATION
            ? Promise.resolve(cachedCategories.data)
            : apiCall('/api/products/categories').then(data => {
                if (Array.isArray(data)) setCachedCategories(data);
                return data;
              });

        const brandsPromise =
          cachedBrands.timestamp && now - cachedBrands.timestamp < CACHE_DURATION
            ? Promise.resolve(cachedBrands.data)
            : apiCall('/api/products/brands').then(data => {
                if (Array.isArray(data)) setCachedBrands(data);
                return data;
              });

        const [categoriesData, brandsData] = await Promise.all([categoriesPromise, brandsPromise]);

        if (Array.isArray(categoriesData)) setCategories(categoriesData);
        if (Array.isArray(brandsData)) setBrands(brandsData);
      } catch (error) {
        Alert.alert('Error', 'Could not load preference options.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchPreferenceData();
  }, [user]); // Depend on user

  const toggleSelection = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    setArray(array.includes(item) ? array.filter(i => i !== item) : [...array, item]);
  };

  const handleNext = () => {
    if (step === 'currency') setStep('categories');
    else if (step === 'categories') setStep('colors');
    else if (step === 'colors') setStep('brands');
  };

  const handleBack = () => {
    if (step === 'brands') setStep('colors');
    else if (step === 'colors') setStep('categories');
    else if (step === 'categories') setStep('currency');
  };

  const finishOnboarding = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const preferences = {
        currency: selectedCurrency,
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
        setCurrency(selectedCurrency);
        router.replace('/(tabs)/home');
      } else {
        throw new Error('Failed to save preferences');
      }
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Could not save your preferences. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreferenceScreen = () => {
    if (isFetching && step !== 'currency') {
      return <ActivityIndicator size="large" style={styles.centered} />;
    }

    let content;
    switch (step) {
      case 'currency':
        content = (
          <View style={styles.currencyContainer}>
            <SingleSelectDropdown
              options={countryCurrencyOptions}
              selectedValue={selectedCurrency}
              onSelectionChange={setSelectedCurrency}
              placeholder="Select your currency"
            />
          </View>
        );
        break;
      case 'categories':
        content = (
          <FlatList
            key="categories-list"
            data={categories}
            keyExtractor={(item) => item}
            numColumns={2}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.optionCard, selectedCategories.includes(item) && styles.selectedCard]}
                onPress={() => toggleSelection(selectedCategories, setSelectedCategories, item)}
              >
                <Text style={[styles.optionText, selectedCategories.includes(item) && styles.selectedText]}>
                  {item}
                </Text>
              </Pressable>
            )}
          />
        );
        break;
      case 'colors':
        content = (
          <FlatList
            key="colors-list"
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
        break;
      case 'brands':
        content = (
          <FlatList
            key="brands-list"
            data={brands}
            keyExtractor={(item) => item}
            numColumns={2}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.brandOption, selectedBrands.includes(item) && styles.selectedBrand]}
                onPress={() => toggleSelection(selectedBrands, setSelectedBrands, item)}
              >
                <Text style={[styles.brandText, selectedBrands.includes(item) && styles.selectedBrandText]}>
                  {item}
                </Text>
              </Pressable>
            )}
          />
        );
        break;
      default:
        content = null;
    }

    return (
      <>
        <View style={styles.header}>
          <Text style={styles.title}>
            {step === 'currency' ? 'Select Your Currency' :
             step === 'categories' ? 'Choose Your Styles' :
             step === 'colors' ? 'Select Favorite Colors' :
             'Pick Preferred Brands'}
          </Text>
          <Text style={styles.subtitle}>Help us personalize your experience.</Text>
        </View>

        {content}

        <View style={styles.footer}>
          {step !== 'currency' && (
            <Pressable style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.nextButton, (isLoading || (isFetching && step !== 'currency')) && styles.disabledButton]}
            onPress={step === 'brands' ? finishOnboarding : handleNext}
            disabled={isLoading || (isFetching && step !== 'currency')}
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
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {renderPreferenceScreen()}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  currencyContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
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
    minHeight: 80,
  },
  selectedCard: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
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

