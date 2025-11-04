import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Linking,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

export default function AboutScreen() {
  const router = useRouter()

  const socialLinks = [
    {
      name: 'Instagram',
      icon: '📷',
      url: 'https://instagram.com/dryp',
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: 'https://twitter.com/dryp',
    },
    {
      name: 'Facebook',
      icon: '📘',
      url: 'https://facebook.com/dryp',
    },
    {
      name: 'TikTok',
      icon: '🎵',
      url: 'https://tiktok.com/@dryp',
    },
  ]

  const legalLinks = [
    {
      title: 'Privacy Policy',
      action: () => Alert.alert('Privacy Policy', 'Opening privacy policy...'),
    },
    {
      title: 'Terms of Service',
      action: () => Alert.alert('Terms of Service', 'Opening terms of service...'),
    },
    {
      title: 'Cookie Policy',
      action: () => Alert.alert('Cookie Policy', 'Opening cookie policy...'),
    },
    {
      title: 'Accessibility',
      action: () => Alert.alert('Accessibility', 'Opening accessibility information...'),
    },
  ]

  const openSocialLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link')
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>DRYP</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appTagline}>Discover Your Style</Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About DRYP</Text>
          <Text style={styles.aboutText}>
            DRYP is your personal style companion, designed to help you discover and curate 
            fashion that matches your unique taste. Our AI-powered recommendations learn from 
            your preferences to bring you the perfect pieces from top brands worldwide.
          </Text>
          <Text style={styles.aboutText}>
            Founded in 2024, we believe fashion should be personal, accessible, and fun. 
            Whether you're looking for the latest trends or timeless classics, DRYP makes 
            it easy to find exactly what you're looking for.
          </Text>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <View style={styles.missionItem}>
            <Text style={styles.missionIcon}>🎯</Text>
            <View style={styles.missionContent}>
              <Text style={styles.missionTitle}>Personalized Discovery</Text>
              <Text style={styles.missionText}>
                Help you discover fashion that truly reflects your personal style
              </Text>
            </View>
          </View>
          
          <View style={styles.missionItem}>
            <Text style={styles.missionIcon}>🌍</Text>
            <View style={styles.missionContent}>
              <Text style={styles.missionTitle}>Sustainable Fashion</Text>
              <Text style={styles.missionText}>
                Promote conscious shopping and sustainable fashion choices
              </Text>
            </View>
          </View>
          
          <View style={styles.missionItem}>
            <Text style={styles.missionIcon}>✨</Text>
            <View style={styles.missionContent}>
              <Text style={styles.missionTitle}>Inclusive Style</Text>
              <Text style={styles.missionText}>
                Celebrate diversity and make fashion accessible to everyone
              </Text>
            </View>
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialGrid}>
            {socialLinks.map((social) => (
              <Pressable
                key={social.name}
                style={styles.socialButton}
                onPress={() => openSocialLink(social.url)}
              >
                <Text style={styles.socialIcon}>{social.icon}</Text>
                <Text style={styles.socialName}>{social.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          {legalLinks.map((link, index) => (
            <Pressable
              key={index}
              style={styles.legalButton}
              onPress={link.action}
            >
              <Text style={styles.legalText}>{link.title}</Text>
              <Text style={styles.legalArrow}>›</Text>
            </Pressable>
          ))}
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>📧 hello@dryp.com</Text>
            <Text style={styles.contactText}>🌐 www.dryp.com</Text>
            <Text style={styles.contactText}>📍 San Francisco, CA</Text>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyright}>
          <Text style={styles.copyrightText}>
            © 2024 DRYP. All rights reserved.
          </Text>
          <Text style={styles.copyrightText}>
            Made with ❤️ for fashion lovers everywhere
          </Text>
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  backText: {
    fontSize: 24,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  appName: {
    fontSize: 32,
    fontWeight: '100',
    color: '#000000',
    letterSpacing: -1,
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 18,
    color: '#666666',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 16,
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  missionIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  missionContent: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  missionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialButton: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  socialIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  socialName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  legalButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  legalText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  legalArrow: {
    fontSize: 20,
    color: '#cccccc',
    fontWeight: '300',
  },
  contactInfo: {
    gap: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#666666',
  },
  copyright: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  copyrightText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 100,
  },
})
