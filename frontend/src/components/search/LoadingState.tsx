import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function SearchLoadingState() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>DRYP</Text>
      <ActivityIndicator size="large" color="#000" />
      <Text style={styles.loadingText}>Loading products...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 48,
    color: '#000',
    marginBottom: 20,
    fontFamily: 'Zaloga',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Zaloga',
  },
});
