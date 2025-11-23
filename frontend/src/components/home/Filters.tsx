
import React from 'react';
import { View, StyleSheet } from 'react-native';
import MultiSelectDropdown from '../MultiSelectDropdown';

interface FiltersProps {
  filters: {
    brands: string[];
    categories: string[];
    colors: string[];
  };
  selectedFilters: {
    selectedBrands: string[];
    selectedCategories: string[];
    selectedColors: string[];
  };
  onSelectionChange: {
    setSelectedBrands: (brands: string[]) => void;
    setSelectedCategories: (categories: string[]) => void;
    setSelectedColors: (colors: string[]) => void;
  };
}

export function Filters({ filters, selectedFilters, onSelectionChange }: FiltersProps) {
  return (
    <View style={styles.filtersContainer}>
      <MultiSelectDropdown
        containerStyle={{ width: 110 }}
        options={filters.brands}
        selectedOptions={selectedFilters.selectedBrands}
        onSelectionChange={onSelectionChange.setSelectedBrands}
        placeholder="Brands"
      />
      <MultiSelectDropdown
        containerStyle={{ width: 110 }}
        options={filters.categories}
        selectedOptions={selectedFilters.selectedCategories}
        onSelectionChange={onSelectionChange.setSelectedCategories}
        placeholder="Categories"
      />
      <MultiSelectDropdown
        containerStyle={{ width: 110 }}
        options={filters.colors}
        selectedOptions={selectedFilters.selectedColors}
        onSelectionChange={onSelectionChange.setSelectedColors}
        placeholder="Colors"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'center',
    gap: 10,
  },
});
