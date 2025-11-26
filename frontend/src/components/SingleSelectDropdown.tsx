import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Modal, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SingleSelectDropdownProps {
  options: { label: string; value: string }[];
  selectedValue: string;
  onSelectionChange: (selected: string) => void;
  placeholder: string;
  containerStyle?: ViewStyle;
}

export default function SingleSelectDropdown({
  options,
  selectedValue,
  onSelectionChange,
  placeholder,
  containerStyle,
}: SingleSelectDropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (value: string) => {
    onSelectionChange(value);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: { label: string; value: string } }) => (
    <Pressable style={styles.option} onPress={() => handleSelect(item.value)}>
      <Text style={selectedValue === item.value ? styles.selectedOptionText : styles.optionText}>
        {item.label}
      </Text>
    </Pressable>
  );

  const selectedLabel = options.find(opt => opt.value === selectedValue)?.label || placeholder;

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable style={styles.dropdown} onPress={() => setModalVisible(true)}>
        <Text style={styles.dropdownText}>
          {selectedLabel}
        </Text>
        <Ionicons name="chevron-down" size={16} color="white" />
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              renderItem={renderItem}
              keyExtractor={item => item.value}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 20,
    padding: 15,
    backgroundColor: '#000',
  },
  dropdownText: {
    color: '#fff',
    marginRight: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  option: {
    paddingVertical: 15,
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
