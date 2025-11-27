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
  Animated,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCustomRouter } from '../src/hooks/useCustomRouter';
import { useAuthStore } from '../src/state/auth';
import { useSettingsStore } from '../src/state/settings';
import { useCacheStore } from '../src/state/cache';
import { apiCall } from '../src/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CACHE_DURATION = 24 * 60 * 60 * 1000;

const countryCurrencyOptions = [
  { label: '🇮🇳 India (INR)', value: 'INR' },
  { label: '🇺🇸 United States (USD)', value: 'USD' },
  { label: '🇪🇺 Europe (EUR)', value: 'EUR' },
  { label: '🇬🇧 United Kingdom (GBP)', value: 'GBP' },
  { label: '🇯🇵 Japan (JPY)', value: 'JPY' },
  { label: '🇨🇦 Canada (CAD)', value: 'CAD' },
  { label: '🇦🇺 Australia (AUD)', value: 'AUD' },
  { label: '🇸🇬 Singapore (SGD)', value: 'SGD' },
  { label: '🇨🇭 Switzerland (CHF)', value: 'CHF' },
  { label: '🇨🇳 China (CNY)', value: 'CNY' },
  { label: '🇭🇰 Hong Kong (HKD)', value: 'HKD' },
  { label: '🇦🇪 UAE (AED)', value: 'AED' },
  { label: '🇸🇦 Saudi Arabia (SAR)', value: 'SAR' },
  { label: '🇰🇷 South Korea (KRW)', value: 'KRW' },
  { label: '🇧🇷 Brazil (BRL)', value: 'BRL' },
  { label: '🇲🇽 Mexico (MXN)', value: 'MXN' },
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

// Scrollable Country List Component
const CountryList = ({ options, selectedValue, onSelectionChange, isDark }) => {
  const countryListStyles = createCountryListStyles(isDark);

  return (
    <FlatList
      data={options}
      keyExtractor={(item) => item.value}
      style={countryListStyles.list}
      contentContainerStyle={countryListStyles.listContent}
      showsVerticalScrollIndicator={true}
      renderItem={({ item }) => (
        <Pressable
          style={[
            countryListStyles.countryItem,
            selectedValue === item.value && countryListStyles.countryItemSelected
          ]}
          onPress={() => onSelectionChange(item.value)}
        >
          <Text style={[
            countryListStyles.countryText,
            selectedValue === item.value && countryListStyles.countryTextSelected
          ]}>
            {item.label}
          </Text>
          {selectedValue === item.value && (
            <Text style={countryListStyles.checkmark}>✓</Text>
          )}
        </Pressable>
      )}
    />
  );
};

const createCountryListStyles = (isDark: boolean) => StyleSheet.create({
  list: {
    width: '100%',
    maxWidth: 300,
  },
  listContent: {
    paddingBottom: 20,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#f0f0f0',
  },
  countryItemSelected: {
    borderBottomColor: isDark ? '#fff' : '#1a1a1a',
  },
  countryText: {
    fontSize: 16,
    fontFamily: 'JosefinSans_400Regular',
    color: isDark ? '#fff' : '#1a1a1a',
  },
  countryTextSelected: {
    fontFamily: 'JosefinSans_500Medium',
    color: isDark ? '#fff' : '#1a1a1a',
  },
  checkmark: {
    fontSize: 16,
    color: isDark ? '#fff' : '#1a1a1a',
    fontWeight: 'bold',
  },
});

export default function Onboarding() {
  const router = useCustomRouter();
  const { user, updateUser } = useAuthStore();
  const { currency, setCurrency } = useSettingsStore();
  const { categories: cachedCategories, brands: cachedBrands, setCategories: setCachedCategories, setBrands: setCachedBrands } = useCacheStore();
  
  // Get system color scheme
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [step, setStep] = useState<OnboardingStep>('currency');
  const [categories, setCategories] = useState<string[]>(cachedCategories.data || []);
  const [brands, setBrands] = useState<string[]>(cachedBrands.data || []);
  const [isFetching, setIsFetching] = useState(true);

  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(user?.preferences?.categories || []);
  const [selectedColors, setSelectedColors] = useState<string[]>(user?.preferences?.colors || []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(user?.preferences?.brands || []);
  const [isLoading, setIsLoading] = useState(false);

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  useEffect(() => {
    const fetchPreferenceData = async () => {
      if (!user) return;

      setIsFetching(true);
      try {
        const now = Date.now();
        const categoriesPromise = cachedCategories.timestamp && now - cachedCategories.timestamp < CACHE_DURATION
          ? Promise.resolve(cachedCategories.data)
          : apiCall('/api/products/categories').then(data => {
              if (Array.isArray(data)) setCachedCategories(data);
              return data;
            });

        const brandsPromise = cachedBrands.timestamp && now - cachedBrands.timestamp < CACHE_DURATION
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
  }, [user]);

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
      Alert.alert('Error', 'Could not save your preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const StepIndicator = () => {
    const steps = ['currency', 'categories', 'colors', 'brands'];
    const currentIndex = steps.indexOf(step);
    const styles = createStepIndicatorStyles(isDark);

    return (
      <View style={styles.stepIndicator}>
        {steps.map((_, index) => (
          <View key={index} style={styles.stepLineContainer}>
            <View
              style={[
                styles.stepDot,
                index <= currentIndex ? styles.stepDotActive : styles.stepDotInactive,
              ]}
            />
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentIndex ? styles.stepLineActive : styles.stepLineInactive,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    if (isFetching && step !== 'currency') {
      return (
        <View style={[styles.centered, { backgroundColor: isDark ? '#000' : '#fff' }]}>
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#1a1a1a'} />
        </View>
      );
    }

    let content;
    switch (step) {
      case 'currency':
        content = (
          <Animated.View 
            style={[
              styles.currencyContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <CountryList
              options={countryCurrencyOptions}
              selectedValue={selectedCurrency}
              onSelectionChange={setSelectedCurrency}
              isDark={isDark}
            />
          </Animated.View>
        );
        break;
      case 'categories':
        content = (
          <Animated.View 
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <FlatList
              key="categories-2-columns"
              data={categories}
              keyExtractor={(item) => item}
              numColumns={2}
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.selectionCard,
                    selectedCategories.includes(item) && styles.selectionCardActive
                  ]}
                  onPress={() => toggleSelection(selectedCategories, setSelectedCategories, item)}
                >
                  <Text style={[
                    styles.selectionText,
                    selectedCategories.includes(item) && styles.selectionTextActive
                  ]}>
                    {item}
                  </Text>
                  {selectedCategories.includes(item) && (
                    <View style={styles.activeIndicator} />
                  )}
                </Pressable>
              )}
            />
          </Animated.View>
        );
        break;
      case 'colors':
        content = (
          <Animated.View 
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <FlatList
              key="colors-4-columns"
              data={colorOptions}
              keyExtractor={(item) => item.id}
              numColumns={4}
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.colorCircle, { backgroundColor: item.color }]}
                  onPress={() => toggleSelection(selectedColors, setSelectedColors, item.id)}
                >
                  {selectedColors.includes(item.id) && (
                    <View style={styles.colorSelection}>
                      <Text style={styles.checkIcon}>✓</Text>
                    </View>
                  )}
                </Pressable>
              )}
            />
          </Animated.View>
        );
        break;
      case 'brands':
        content = (
          <Animated.View 
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <FlatList
              key="brands-2-columns"
              data={brands}
              keyExtractor={(item) => item}
              numColumns={2}
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.selectionCard,
                    selectedBrands.includes(item) && styles.selectionCardActive
                  ]}
                  onPress={() => toggleSelection(selectedBrands, setSelectedBrands, item)}
                >
                  <Text style={[
                    styles.selectionText,
                    selectedBrands.includes(item) && styles.selectionTextActive
                  ]}>
                    {item}
                  </Text>
                  {selectedBrands.includes(item) && (
                    <View style={styles.activeIndicator} />
                  )}
                </Pressable>
              )}
            />
          </Animated.View>
        );
        break;
    }

    return content;
  };

  const stepTitles = {
    currency: 'Select Currency',
    categories: 'Preferred Categories',
    colors: 'Favorite Colors',
    brands: 'Preferred Brands',
  };

  const stepSubtitles = {
    currency: 'Choose your preferred currency for pricing',
    categories: 'Select the styles you love',
    colors: 'Pick your favorite color palette',
    brands: 'Choose brands that match your style',
  };

  const styles = createStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#000' : '#fff'} />
      
      <View style={styles.header}>
        <StepIndicator />
        <View style={styles.titleSection}>
          <Text style={styles.stepTitle}>{stepTitles[step]}</Text>
          <Text style={styles.stepSubtitle}>{stepSubtitles[step]}</Text>
        </View>
      </View>

      {/* Main content area */}
      <View style={styles.mainContent}>
        {renderContent()}
      </View>

      {/* Fixed footer at bottom */}
      <View style={styles.footer}>
        {step !== 'currency' && (
          <Pressable style={styles.secondaryButton} onPress={handleBack}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.primaryButton, (isLoading || (isFetching && step !== 'currency')) && styles.primaryButtonDisabled]}
          onPress={step === 'brands' ? finishOnboarding : handleNext}
          disabled={isLoading || (isFetching && step !== 'currency')}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {step === 'brands' ? 'Complete Setup' : 'Continue'}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStepIndicatorStyles = (isDark: boolean) => StyleSheet.create({
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepDotActive: {
    backgroundColor: isDark ? '#fff' : '#1a1a1a',
  },
  stepDotInactive: {
    backgroundColor: isDark ? '#333' : '#e5e5e5',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: isDark ? '#fff' : '#1a1a1a',
  },
  stepLineInactive: {
    backgroundColor: isDark ? '#333' : '#e5e5e5',
  },
});

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#000' : '#ffffff',
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: 'JosefinSans_500Medium',
    color: isDark ? '#fff' : '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: 'JosefinSans_400Regular',
    color: isDark ? '#ccc' : '#666',
    lineHeight: 22,
  },
  currencyContent: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    paddingBottom: 100,
  },
  selectionCard: {
    flex: 1,
    margin: 6,
    padding: 20,
    borderRadius: 12,
    backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
    borderWidth: 1,
    borderColor: isDark ? '#333' : '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  selectionCardActive: {
    backgroundColor: isDark ? '#fff' : '#1a1a1a',
    borderColor: isDark ? '#fff' : '#1a1a1a',
  },
  selectionText: {
    fontSize: 15,
    fontFamily: 'JosefinSans_400Regular',
    color: isDark ? '#fff' : '#1a1a1a',
    textAlign: 'center',
  },
  selectionTextActive: {
    color: isDark ? '#000' : '#ffffff',
    fontFamily: 'JosefinSans_500Medium',
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: isDark ? '#000' : '#ffffff',
  },
  colorCircle: {
    width: (SCREEN_WIDTH - 140) / 4,
    height: (SCREEN_WIDTH - 140) / 4,
    borderRadius: (SCREEN_WIDTH - 140) / 8,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#333' : '#f0f0f0',
  },
  colorSelection: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#333' : '#f0f0f0',
    backgroundColor: isDark ? '#000' : '#ffffff',
  },
  secondaryButton: {
    padding: 18,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'JosefinSans_500Medium',
    color: isDark ? '#ccc' : '#666',
  },
  primaryButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    backgroundColor: isDark ? '#fff' : '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'JosefinSans_500Medium',
    color: isDark ? '#000' : '#ffffff',
  },
  primaryButtonDisabled: {
    backgroundColor: isDark ? '#333' : '#cccccc',
  },
});