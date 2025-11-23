import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Alert,
  Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCustomRouter } from '../../src/hooks/useCustomRouter'

export default function HelpScreen() {
  const router = useCustomRouter()

  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const faqItems = [
    {
      id: 1,
      question: 'How do I track my order?',
      answer: 'You can track your order by going to "My Orders" in your account section. Click on any order to see detailed tracking information and delivery updates.',
    },
    {
      id: 2,
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all items. Items must be in original condition with tags attached. Free returns are available for orders over $50.',
    },
    {
      id: 3,
      question: 'How do I change my shipping address?',
      answer: 'You can update your shipping address in the "Addresses" section of your account. Make sure to update it before placing your order.',
    },
    {
      id: 4,
      question: 'Do you offer international shipping?',
      answer: 'Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location. Check our shipping page for more details.',
    },
    {
      id: 5,
      question: 'How do I use a discount code?',
      answer: 'Enter your discount code at checkout in the "Promo Code" field. The discount will be applied automatically to eligible items.',
    },
  ]

  const contactOptions = [
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: '💬',
      action: () => Alert.alert('Live Chat', 'Live chat feature coming soon!'),
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'support@dryp.com',
      icon: '📧',
      action: () => Linking.openURL('mailto:support@dryp.com'),
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: '+1 (555) 123-DRYP',
      icon: '📞',
      action: () => Linking.openURL('tel:+15551234379'),
    },
    {
      id: 'help-center',
      title: 'Help Center',
      description: 'Browse our knowledge base',
      icon: '📚',
      action: () => Alert.alert('Help Center', 'Opening help center...'),
    },
  ]

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          We're here to help! Find answers to common questions or get in touch with our support team.
        </Text>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option) => (
              <Pressable
                key={option.id}
                style={styles.contactCard}
                onPress={option.action}
              >
                <Text style={styles.contactIcon}>{option.icon}</Text>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactDescription}>{option.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {faqItems.map((item) => (
            <View key={item.id} style={styles.faqItem}>
              <Pressable
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(item.id)}
              >
                <Text style={styles.faqQuestionText}>{item.question}</Text>
                <Text style={styles.faqArrow}>
                  {expandedFAQ === item.id ? '−' : '+'}
                </Text>
              </Pressable>
              
              {expandedFAQ === item.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => Alert.alert('Report Issue', 'Report an issue with your order')}
          >
            <Text style={styles.actionIcon}>🚨</Text>
            <Text style={styles.actionText}>Report an Issue</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => Alert.alert('Size Guide', 'Opening size guide...')}
          >
            <Text style={styles.actionIcon}>📏</Text>
            <Text style={styles.actionText}>Size Guide</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => Alert.alert('Shipping Info', 'Opening shipping information...')}
          >
            <Text style={styles.actionIcon}>🚚</Text>
            <Text style={styles.actionText}>Shipping Information</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
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
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
    marginTop: 20,
    marginBottom: 30,
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
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  contactIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  faqArrow: {
    fontSize: 20,
    color: '#666666',
    fontWeight: '300',
  },
  faqAnswer: {
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  actionArrow: {
    fontSize: 20,
    color: '#cccccc',
    fontWeight: '300',
  },
  bottomSpacing: {
    height: 100,
  },
})
