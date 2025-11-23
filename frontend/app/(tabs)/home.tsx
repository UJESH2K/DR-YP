import React from 'react';
import { View, StyleSheet, StatusBar, PanResponder, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useHomeScreenData } from '../../src/hooks/useHomeScreenData';
import { useSwipeAnimations } from '../../src/hooks/useSwipeAnimations';
import { useDetailsSheet } from '../../src/hooks/useDetailsSheet';

import { Header } from '../../src/components/home/Header';
import { Filters } from '../../src/components/home/Filters';
import { LoadingState } from '../../src/components/home/LoadingState';
import { EmptyState } from '../../src/components/home/EmptyState';
import { Card } from '../../src/components/home/Card';
import { DetailsView } from '../../src/components/home/DetailsView';

export default function HomeScreen() {
  const {
    items,
    loading,
    filters,
    selectedFilters,
    setSelectedFilters,
    clearFilters,
  } = useHomeScreenData();
  
  const {
    showDetails,
    hideDetails,
    ...detailsSheetProps
  } = useDetailsSheet({
    onShow: () => swipeAnimations.showDetailsAnimation(),
    onHide: () => swipeAnimations.hideDetailsAnimation(),
  });
  
  const swipeAnimations = useSwipeAnimations(items, showDetails);

  if (loading) {
    return <LoadingState />;
  }

  if (items.length === 0) {
    return <EmptyState onClearFilters={clearFilters} />;
  }

  const currentItem = items[swipeAnimations.currentIndex];
  const nextItem = items[(swipeAnimations.currentIndex + 1) % items.length];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header />
      <Filters 
        filters={filters}
        selectedFilters={selectedFilters}
        onSelectionChange={setSelectedFilters}
      />
      <View style={styles.cardStack}>
        {nextItem && (
          <Card 
            item={nextItem}
            style={{
              opacity: 0.8,
              transform: [
                { scale: swipeAnimations.nextCardAnimation },
                {
                  translateY: swipeAnimations.nextCardAnimation.interpolate({
                    inputRange: [0.9, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            }}
            isNext
          />
        )}
        {currentItem && (
          <Card 
            item={currentItem}
            style={swipeAnimations.animatedCardStyles}
            likeOpacity={swipeAnimations.likeOpacity}
            nopeOpacity={swipeAnimations.nopeOpacity}
            panHandlers={swipeAnimations.panResponder.panHandlers}
          />
        )}
      </View>
      
      {swipeAnimations.canUndo && (
        <Pressable 
          style={[
            styles.undoButton, 
            swipeAnimations.lastSwipeDirection === 'left' ? { left: 30 } : { right: 30 }
          ]} 
          onPress={swipeAnimations.undoSwipe}
        >
          <Ionicons 
            name={swipeAnimations.lastSwipeDirection === 'left' ? "arrow-redo" : "arrow-undo"} 
            size={40} 
            color="black" 
          />
        </Pressable>
      )}

      {detailsSheetProps.selectedItem && (
        <DetailsView {...detailsSheetProps} selectedOptions={detailsSheetProps.selectedOptions} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  cardStack: { flex: 1, alignItems: 'center', paddingTop: 20 },
  undoButton: {
    position: 'absolute',
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
