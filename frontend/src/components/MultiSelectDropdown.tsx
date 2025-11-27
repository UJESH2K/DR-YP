import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  useColorScheme,
  Modal,
  LayoutRectangle,
  ViewStyle,
} from "react-native";

interface Props {
  options: string[];
  selectedOptions: string[];
  onSelectionChange: (opts: string[]) => void;
  placeholder: string;
  containerStyle?: ViewStyle;
}

export default function MultiSelectDropdown({
  options,
  selectedOptions,
  onSelectionChange,
  placeholder,
  containerStyle,
}: Props) {
  const [open, setOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState<LayoutRectangle | null>(null);
  const buttonContainerRef = useRef<View>(null);
  const theme = useColorScheme();
  const light = theme !== "dark";

  const toggleSelect = (value: string) => {
    if (selectedOptions.includes(value)) {
      onSelectionChange(selectedOptions.filter((x) => x !== value));
    } else {
      onSelectionChange([...selectedOptions, value]);
    }
  };

  const openDropdown = () => {
    if (buttonContainerRef.current) {
      buttonContainerRef.current.measureInWindow((x, y, width, height) => {
        setButtonLayout({ x, y, width, height });
        setOpen(true);
      });
    } else {
      setOpen(true);
    }
  };

  const closeDropdown = () => {
    setOpen(false);
  };

  const buttonLabel =
    selectedOptions.length === 0
      ? placeholder
      : `${placeholder} (${selectedOptions.length})`;

  return (
    <>
      <View
        ref={buttonContainerRef}
        style={[styles.buttonContainer, containerStyle]}
        collapsable={false}
      >
        <Pressable
          onPress={openDropdown}
          style={styles.button}
          android_ripple={{ color: light ? "#ddd" : "#444" }}
        >
          <Text style={[styles.buttonText, { color: light ? "#111" : "#eee" }]}>
            {buttonLabel}
          </Text>
        </Pressable>
      </View>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: light ? "#fff" : "#000",
                    top: (buttonLayout?.y ?? 100) + (buttonLayout?.height ?? 0) + 4,
                    left: buttonLayout?.x ?? 20,
                    minWidth: buttonLayout?.width ?? 150,
                  },
                ]}
              >
                <FlatList
                  data={options}
                  keyExtractor={(item) => item}
                  style={{ maxHeight: 250 }}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.item}
                      onPress={() => toggleSelect(item)}
                      android_ripple={{ color: light ? "#eee" : "#222" }}
                    >
                      <Text
                        style={[
                          styles.itemText,
                          {
                            color: selectedOptions.includes(item)
                              ? (light ? "#000" : "#fff")
                              : (light ? "#444" : "#bbb"),
                            fontWeight: selectedOptions.includes(item) ? '600' : '400',
                          }
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignSelf: "center",
    marginHorizontal: 3, // Reduced spacing between buttons
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  backdrop: {
    flex: 1,
  },
  dropdown: {
    position: "absolute",
    borderRadius: 8,
    paddingVertical: 2,
    elevation: 20,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  item: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  itemText: {
    fontSize: 14,
  },
});