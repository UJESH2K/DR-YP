import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { apiCall } from '../src/lib/api';
import { useAuthStore } from '../src/state/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---- FONTS ----
import {
  JosefinSans_400Regular,
  JosefinSans_500Medium,
  JosefinSans_600SemiBold,
  useFonts as useJosefin,
} from "@expo-google-fonts/josefin-sans";

export default function VendorRegisterScreen() {
  const [fontsLoaded] = useJosefin({
    JosefinSans_400Regular,
    JosefinSans_500Medium,
    JosefinSans_600SemiBold,
  });

  const theme = useColorScheme();
  const light = theme !== "dark";

  const { user, token, ...authActions } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);

  // User details
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Vendor details
  const [vendorName, setVendorName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Address details
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const vendorData = {
        ownerName,
        email,
        password,
        vendorName,
        description,
        phone,
        website,
        address: { street, city, state, zipCode, country },
      };

      const response = await apiCall('/api/vendors/register', {
        method: 'POST',
        body: JSON.stringify(vendorData),
      });

      if (response && response.token) {
        const { token, user } = response;
        authActions.updateUser(user);

        await AsyncStorage.setItem('user_token', token);
        await AsyncStorage.setItem('user_data', JSON.stringify(user));

        Alert.alert('Success', 'Vendor account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/(vendor-tabs)/products') },
        ]);
      } else {
        throw new Error(response?.message || 'Failed to register vendor');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: light ? "#fff" : "#000" }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollWrap}
          showsVerticalScrollIndicator={false}
        >
          {/* ==================== BRAND HEADER ==================== */}
          <View style={styles.headerWrap}>
            <Text
              style={[
                styles.brand,
                { color: light ? "#111" : "#fff", fontFamily: "JosefinSans_600SemiBold" },
              ]}
            >
              DR-YP
            </Text>

            <Text
              style={[
                styles.title,
                { color: light ? "#111" : "#fff", fontFamily: "JosefinSans_600SemiBold" },
              ]}
            >
              Become a Vendor
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: light ? "#555" : "#aaa", fontFamily: "JosefinSans_400Regular" },
              ]}
            >
              Create your storefront on DR-YP
            </Text>
          </View>

          {/* ==================== FORM SECTIONS ==================== */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: light ? "#111" : "#fff", fontFamily: "JosefinSans_600SemiBold" }]}>
              Your Account
            </Text>

            <TextInput
              style={[styles.input, light ? styles.inputLight : styles.inputDark]}
              placeholder="Your Full Name"
              value={ownerName}
              onChangeText={setOwnerName}
              placeholderTextColor={light ? "#777" : "#aaa"}
            />

            <TextInput
              style={[styles.input, light ? styles.inputLight : styles.inputDark]}
              placeholder="Your Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={light ? "#777" : "#aaa"}
            />

            <TextInput
              style={[styles.input, light ? styles.inputLight : styles.inputDark]}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={light ? "#777" : "#aaa"}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: light ? "#111" : "#fff", fontFamily: "JosefinSans_600SemiBold" }]}>
              Your Business
            </Text>

            <TextInput
              style={[styles.input, light ? styles.inputLight : styles.inputDark]}
              placeholder="Business Name"
              value={vendorName}
              onChangeText={setVendorName}
              placeholderTextColor={light ? "#777" : "#aaa"}
            />

            <TextInput
              style={[styles.input, light ? styles.inputLight : styles.inputDark]}
              placeholder="Business Description"
              value={description}
              onChangeText={setDescription}
              multiline
              placeholderTextColor={light ? "#777" : "#aaa"}
            />

            <TextInput
              style={[styles.input, light ? styles.inputLight : styles.inputDark]}
              placeholder="Business Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={light ? "#777" : "#aaa"}
            />

            <TextInput
              style={[styles.input, light ? styles.inputLight : styles.inputDark]}
              placeholder="Website (optional)"
              value={website}
              onChangeText={setWebsite}
              autoCapitalize="none"
              placeholderTextColor={light ? "#777" : "#aaa"}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: light ? "#111" : "#fff", fontFamily: "JosefinSans_600SemiBold" }]}>
              Business Address
            </Text>

            <TextInput
              style={[styles.input, light ? styles.inputLight : styles.inputDark]}
              placeholder="Street Address"
              value={street}
              onChangeText={setStreet}
              placeholderTextColor={light ? "#777" : "#aaa"}
            />

            <TextInput
              style={[styles.input, light ? styles.inputLight : styles.inputDark]}
              placeholder="City"
              value={city}
              onChangeText={setCity}
              placeholderTextColor={light ? "#777" : "#aaa"}
            />

            <TextInput
              style={[styles.input, light ? styles.inputLight : styles.inputDark]}
              placeholder="State / Province"
              value={state}
              onChangeText={setState}
              placeholderTextColor={light ? "#777" : "#aaa"}
            />

            <TextInput
              style={[styles.input, light ? styles.inputLight : styles.inputDark]}
              placeholder="ZIP / Postal Code"
              value={zipCode}
              onChangeText={setZipCode}
              placeholderTextColor={light ? "#777" : "#aaa"}
            />

            <TextInput
              style={[styles.input, light ? styles.inputLight : styles.inputDark]}
              placeholder="Country"
              value={country}
              onChangeText={setCountry}
              placeholderTextColor={light ? "#777" : "#aaa"}
            />
          </View>

          {/* ==================== SUBMIT BUTTON ==================== */}
          <Pressable
            style={[styles.primaryButton]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[
                  styles.primaryButtonText,
                  { fontFamily: "JosefinSans_600SemiBold" },
                ]}
              >
                Create Vendor Account
              </Text>
            )}
          </Pressable>

          {/* ==================== BACK BUTTON ==================== */}
          <Pressable style={styles.footerBack} onPress={() => router.back()}>
            <Text
              style={[
                styles.footerBackText,
                { fontFamily: "JosefinSans_500Medium", color: light ? "#666" : "#aaa" },
              ]}
            >
              Back to Login
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ================================================== */

const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollWrap: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexGrow: 1,
  },

  /* HEADER */
  headerWrap: {
    marginTop: 10,
    marginBottom: 20,
  },

  brand: {
    fontSize: 42,
    letterSpacing: 3,
  },

  title: {
    fontSize: 26,
    marginTop: 2,
  },

  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  /* SECTIONS */
  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },

  input: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 12,
  },

  inputLight: {
    backgroundColor: "#f7f7f7",
    borderColor: "#ddd",
    color: "#111",
  },

  inputDark: {
    backgroundColor: "#111",
    borderColor: "#333",
    color: "#fff",
  },

  /* PRIMARY BUTTON */
  primaryButton: {
    backgroundColor: "#4A6BFF",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
  },

  /* FOOTER BACK */
  footerBack: {
    marginTop: 14,
    alignItems: "center",
  },

  footerBackText: {
    fontSize: 15,
  },
});
