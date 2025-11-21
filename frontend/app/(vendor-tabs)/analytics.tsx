import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/state/auth';
import { apiCall } from '../../src/lib/api';
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

// A dedicated component for key metric cards
const KpiCard = ({ icon, label, value, color }) => (
  <View style={styles.kpiCard}>
    <Ionicons name={icon} size={28} color={color} />
    <Text style={styles.kpiValue}>{value}</Text>
    <Text style={styles.kpiLabel}>{label}</Text>
  </View>
);

export default function AnalyticsScreen() {
  const { user } = useAuthStore();
  const [productAnalytics, setProductAnalytics] = useState(null);
  const [summaryAnalytics, setSummaryAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (user?.role !== 'vendor') return;
    setIsLoading(true);
    setError(null);
    try {
      // Fetch both product and summary analytics in parallel
      const [productsData, summaryData] = await Promise.all([
        apiCall('/api/analytics/products'),
        apiCall('/api/analytics/summary')
      ]);

      if (productsData && !productsData.message) {
        setProductAnalytics(productsData);
      } else {
        throw new Error(productsData.message || 'Failed to fetch product analytics');
      }

      if (summaryData && !summaryData.message) {
        setSummaryAnalytics(summaryData);
      } else {
        throw new Error(summaryData.message || 'Failed to fetch summary analytics');
      }
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics();
    }, [fetchAnalytics])
  );

  if (isLoading) {
    return <SafeAreaView style={styles.centered}><ActivityIndicator size="large" /></SafeAreaView>;
  }

  if (error) {
    return <SafeAreaView style={styles.centered}><Text style={styles.errorText}>Error: {error}</Text></SafeAreaView>;
  }
  
  const mostLikedChartData = {
    labels: productAnalytics?.mostLiked?.slice(0, 5).map(item => item.name.substring(0, 8) + '..') || [],
    datasets: [{
      data: productAnalytics?.mostLiked?.slice(0, 5).map(item => item.likeCount) || [],
    }],
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(26, 26, 26, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(26, 26, 26, ${opacity})`,
    style: { borderRadius: 16 },
    propsForBars: {
      strokeWidth: "2",
      stroke: "#10B981"
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* KPI Cards Section */}
        {summaryAnalytics && (
          <View style={styles.kpiContainer}>
            <KpiCard icon="cube-outline" label="Total Products" value={summaryAnalytics.totalProducts} color="#007bff" />
            <KpiCard icon="heart-outline" label="Total Likes" value={summaryAnalytics.totalLikes} color="#dc3545" />
            <KpiCard icon="bookmark-outline" label="Total Wishlisted" value={summaryAnalytics.totalWishlisted} color="#ffc107" />
          </View>
        )}
        
        {/* Most Liked Products Chart */}
        {productAnalytics?.mostLiked?.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Top 5 Most Liked Products</Text>
            <BarChart
              data={mostLikedChartData}
              width={screenWidth - 48}
              height={250}
              chartConfig={chartConfig}
              verticalLabelRotation={25}
              fromZero={true}
              style={styles.chart}
            />
          </View>
        ) : <Text style={styles.emptyText}>No liked products yet.</Text>}

        {/* Most Wishlisted Products List */}
        {productAnalytics?.mostWishlisted?.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Top 5 Most Wishlisted Products</Text>
            {productAnalytics.mostWishlisted.slice(0, 5).map((item, index) => (
              <View key={item._id} style={styles.listItem}>
                <Text style={styles.listItemNumber}>{index + 1}.</Text>
                <Text style={styles.listItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.listItemValue}>{item.wishlistCount} adds</Text>
              </View>
            ))}
          </View>
        ) : <Text style={styles.emptyText}>No wishlisted products yet.</Text>}
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 24, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  errorText: { color: 'red', fontSize: 16 },
  scrollContent: { padding: 16 },
  
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: (screenWidth / 3) - 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiValue: { fontSize: 24, fontWeight: 'bold', marginVertical: 4 },
  kpiLabel: { fontSize: 12, color: '#6c757d' },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#343a40' },
  chart: { alignSelf: 'center', marginTop: 10 },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  listItemNumber: {
    width: 30,
    fontSize: 16,
    color: '#6c757d',
  },
  listItemName: {
    flex: 1,
    fontSize: 16,
    color: '#343a40',
  },
  listItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#6c757d',
  }
});
