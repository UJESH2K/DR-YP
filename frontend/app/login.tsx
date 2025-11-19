import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../src/state/auth';

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, register, isLoading } = useAuthStore();

  const handleAuthAction = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required.');
      return;
    }
    if (mode === 'register' && !name) {
      Alert.alert('Error', 'Name is required for registration.');
      return;
    }

    let user = null;
    if (mode === 'login') {
      user = await login(email, password);
    } else {
      user = await register(name, email, password);
    }

    if (user) {
      let redirectPath = '/(tabs)/home';
      if (mode === 'register') {
        redirectPath = '/onboarding';
      } else if (user.role === 'vendor') {
        redirectPath = '/(vendor-tabs)/products';
      }
      
      Alert.alert('Success', `Successfully ${mode === 'login' ? 'logged in' : 'registered'}!`, [
        { text: 'OK', onPress: () => router.replace(redirectPath) }
      ]);
    } else {
      // The auth store will show a more specific error
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)/home');
  };

  const toggleMode = () => {
    setMode(currentMode => currentMode === 'login' ? 'register' : 'login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</Text>
          <Text style={styles.subtitle}>
            {mode === 'login' ? 'Sign in to your account' : 'Get started with a new account'}
          </Text>
        </View>

        <View style={styles.form}>
          {mode === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable 
            style={styles.primaryButton} 
            onPress={handleAuthAction}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Pressable onPress={toggleMode} style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>
              {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.push('/vendor-register')} style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>
              Become a Vendor
            </Text>
          </Pressable>
          
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Continue as Guest</Text>
          </Pressable>
          
          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  form: {
    // flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 40,
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  toggleButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '500',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
  skipButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  terms: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
  },

});