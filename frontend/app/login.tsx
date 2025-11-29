

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  useColorScheme,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "../src/state/auth";

// ---- FONT IMPORTS ----
import {
  CormorantGaramond_700Bold,
  useFonts as useCormorant,
} from "@expo-google-fonts/cormorant-garamond";

import {
  JosefinSans_400Regular,
  JosefinSans_500Medium,
  JosefinSans_600SemiBold,
  useFonts as useJosefin,
} from "@expo-google-fonts/josefin-sans";

export default function LoginScreen() {
  const [fontLoadedCormorant] = useCormorant({
    CormorantGaramond_700Bold,
  });

  const [fontLoadedJosefin] = useJosefin({
    JosefinSans_400Regular,
    JosefinSans_500Medium,
    JosefinSans_600SemiBold,
  });

  const fontsLoaded = fontLoadedCormorant && fontLoadedJosefin;

  const theme = useColorScheme();
  const light = theme !== "dark";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, register, isLoading } = useAuthStore();

  // ---- MARQUEE ----
  const scrollAnim = useRef(new Animated.Value(0)).current;
 const marqueeText = [
  "AUTHENTIC STYLE",
  "MINIMAL AESTHETIC",
  "PREMIUM STREETWEAR",
  "MODERN ESSENTIALS",
  "HANDCRAFTED QUALITY",
  "ORIGINAL DESIGN",
  "URBAN CLASSICS",
  "EVERYDAY ELEGANCE",
  "TIMELESS FITS",
  "REDEFINED FASHION",
];


  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -700,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  if (!fontsLoaded) return null;

  const handleAuthAction = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required.");
      return;
    }
    if (mode === "register" && !name) {
      Alert.alert("Error", "Name is required for registration.");
      return;
    }

    if (mode === "login") await login(email, password);
    else await register(name, email, password);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: light ? "#fff" : "#000" }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollWrap}
          showsVerticalScrollIndicator={false}
        >
          {/* ---------- DRYP LOGO ---------- */}
          <View style={styles.logoWrapper}>
            <Text
              style={[
                styles.logo,
                {
                  color: light ? "#111" : "#fff",
                  fontFamily: "JosefinSans_600SemiBold",
                },
              ]}
            >
              DRYP
            </Text>
          </View>

          {/* ---------- MARQUEE ---------- */}
          <View style={styles.marqueeContainer}>
            <Animated.View
              style={{
                flexDirection: "row",
                transform: [{ translateX: scrollAnim }],
              }}
            >
              {[...marqueeText, ...marqueeText].map((item, i) => (
                <Text
                  key={i}
                  style={[
                    styles.marqueeItem,
                    {
                      color: light ? "#4A6BFF" : "#68a6ff",
                      fontFamily: "JosefinSans_500Medium",
                    },
                  ]}
                >
                  {item} •
                </Text>
              ))}
            </Animated.View>
          </View>

          {/* ---------- HEADERS ---------- */}
          <View style={styles.header}>
            <Text
              style={[
                styles.bigTitle,
                {
                  color: light ? "#111" : "#fff",
                  fontFamily: "JosefinSans_600SemiBold", // UPDATED
                },
              ]}
            >
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </Text>

            <Text
              style={[
                styles.subTitle,
                {
                  color: light ? "#555" : "#ccc",
                  fontFamily: "JosefinSans_400Regular",
                },
              ]}
            >
              {mode === "login" ? "Sign in to continue" : "Get started with your account"}
            </Text>
          </View>

          {/* ---------- FORM ---------- */}
          <View style={styles.form}>
            {mode === "register" && (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: light ? "#f7f7f7" : "#111",
                    color: light ? "#111" : "#fff",
                    borderColor: light ? "#ddd" : "#333",
                    fontFamily: "JosefinSans_400Regular",
                  },
                ]}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor={light ? "#777" : "#aaa"}
              />
            )}

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: light ? "#f7f7f7" : "#111",
                  color: light ? "#111" : "#fff",
                  borderColor: light ? "#ddd" : "#333",
                  fontFamily: "JosefinSans_400Regular",
                },
              ]}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={light ? "#777" : "#aaa"}
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: light ? "#f7f7f7" : "#111",
                  color: light ? "#111" : "#fff",
                  borderColor: light ? "#ddd" : "#333",
                  fontFamily: "JosefinSans_400Regular",
                },
              ]}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={light ? "#777" : "#aaa"}
            />

            <Pressable
              style={[styles.primaryButton, { backgroundColor: "#4A6BFF" }]}
              onPress={handleAuthAction}
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
                  {mode === "login" ? "Sign In" : "Create Account"}
                </Text>
              )}
            </Pressable>
          </View>

          {/* ---------- FOOTER (FIXED) ---------- */}
          <View style={styles.footer}>
            <Pressable onPress={() => setMode(mode === "login" ? "register" : "login")}>
              <Text
                style={[
                  styles.footerItem,
                  { color: "#4A6BFF", fontFamily: "JosefinSans_500Medium" },
                ]}
              >
                {mode === "login"
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.push("/vendor-register")}>
              <Text
                style={[
                  styles.footerItem,
                  { color: light ? "#666" : "#aaa", fontFamily: "JosefinSans_500Medium" },
                ]}
              >
                Become a Vendor
              </Text>
            </Pressable>

            <Pressable onPress={() => router.replace("/(tabs)/home")}>
              <Text
                style={[
                  styles.footerItem,
                  { color: light ? "#888" : "#777", fontFamily: "JosefinSans_500Medium" },
                ]}
              >
                Continue as Guest
              </Text>
            </Pressable>

            <Text
              style={[
                styles.termsText,
                { color: light ? "#999" : "#666", fontFamily: "JosefinSans_400Regular" },
              ]}
            >
              By continuing, you agree to our Terms & Privacy Policy
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },

  scrollWrap: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: "center",
    flexGrow: 1,
  },

  // LOGO
  logoWrapper: {
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    fontSize: 48,
    letterSpacing: 3,
  },

  // MARQUEE
  marqueeContainer: {
    overflow: "hidden",
    height: 26,
    width: "100%",
    marginBottom: 18,
  },
  marqueeItem: {
    fontSize: 14,
    marginRight: 24,
  },

  // HEADERS
  header: {
    alignItems: "center",
    marginBottom: 22,
  },
  bigTitle: {
    fontSize: 28,
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 14,
    marginTop: 4,
  },

  // FORM
  form: { marginTop: 10 },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 15,
  },
  primaryButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
  },

  // FOOTER — CLEAN, MODERN, SPACED
  footer: {
    marginTop: 20,
    alignItems: "center",
    gap: 10,
  },
  footerItem: {
    fontSize: 15,
    paddingVertical: 4,
  },
  termsText: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 10,
  },
});
