import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useAuthStore } from '@/state/auth';
import { useSettingsStore } from '@/state/settings';
import { apiCall } from '@/lib/api';
import { useToastStore } from '@/state/toast';
import SingleSelectDropdown from '@/components/SingleSelectDropdown';

const countryCurrencyOptions = [
  { label: '🇮🇳 India (INR)', value: 'INR' },
  { label: '🇺🇸 United States (USD)', value: 'USD' },
  { label: '🇪🇺 Europe (EUR)', value: 'EUR' },
  { label: '🇬🇧 United Kingdom (GBP)', value: 'GBP' },
  { label: '🇯🇵 Japan (JPY)', value: 'JPY' },
  { label: '🇨🇦 Canada (CAD)', value: 'CAD' },
  { label: '🇦🇺 Australia (AUD)', value: 'AUD' },
];

const NotificationToggle = ({ 
  label, 
  description, 
  value, 
  onValueChange 
}: { 
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) => (
  <View style={styles.notificationToggle}>
    <View style={styles.notificationTextContainer}>
      <Text style={styles.notificationLabel}>{label}</Text>
      <Text style={styles.notificationDescription}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#767577', true: '#81b0ff' }}
      thumbColor={value ? '#007AFF' : '#f4f3f4'}
    />
  </View>
);

export default function SettingsScreen() {
  const router = useCustomRouter();
  const { user, updateUser, logout } = useAuthStore();
  const { currency, setCurrency } = useSettingsStore();
  const { showToast } = useToastStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(user?.preferences?.currency || currency);
  const [notificationSettings, setNotificationSettings] = useState(
    user?.preferences?.notificationSettings || {
      orderUpdates: true,
      promotions: false,
      newItemAlerts: false,
    }
  );

  // Delete account modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const preferencesToUpdate = {
        currency: selectedCurrency,
        notificationSettings,
      };

      const updatedUser = await apiCall('/api/users/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferencesToUpdate),
      });

      if (updatedUser && !updatedUser.message) {
        await updateUser(updatedUser);
        setCurrency(selectedCurrency);
        showToast('Your preferences have been updated.');
        router.back();
      } else {
        throw new Error(updatedUser.message || 'Failed to update preferences');
      }
    } catch (error) {
      console.error('Error saving changes:', error.message);
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      showToast('Please enter your password to confirm account deletion.', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      const result = await apiCall('/api/users/me', {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      });

      if (result && result.message === 'Account deleted successfully') {
        showToast('Account deleted successfully.');
        await logout();
        router.replace('/login');
      } else {
        throw new Error(result.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error.message);
      showToast(error.message, 'error');
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
      setPassword('');
    }
  };

  const DeleteAccountModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={deleteModalVisible}
      onRequestClose={() => setDeleteModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Delete Account</Text>
          <Text style={styles.modalMessage}>
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
          </Text>
          <Text style={styles.modalPasswordPrompt}>Enter your password to confirm:</Text>
          <TextInput
            style={styles.modalTextInput}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999999"
          />
          <View style={styles.modalButtonContainer}>
            <Pressable 
              style={[styles.modalCancelButton, { backgroundColor: '#F0F0F0' }]}
              onPress={() => {
                setDeleteModalVisible(false);
                setPassword('');
              }}
              disabled={isDeleting}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable 
              style={[styles.modalDeleteButton, isDeleting && { opacity: 0.6 }]}
              onPress={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.modalDeleteButtonText}>Delete</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <DeleteAccountModal />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Currency</Text>
            <Text style={styles.sectionDescription}>Choose the currency you want to shop in.</Text>
            <SingleSelectDropdown
              options={countryCurrencyOptions}
              selectedValue={selectedCurrency}
              onSelectionChange={setSelectedCurrency}
              placeholder="Select your currency"
            />
        </View>
        
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <Text style={styles.sectionDescription}>Manage what notifications you receive.</Text>
            <NotificationToggle 
              label="Order Updates"
              description="Receive updates on your order status and delivery."
              value={notificationSettings.orderUpdates}
              onValueChange={(value) => handleNotificationChange('orderUpdates', value)}
            />
            <NotificationToggle 
              label="Promotions"
              description="Get notified about sales, discounts, and special offers."
              value={notificationSettings.promotions}
              onValueChange={(value) => handleNotificationChange('promotions', value)}
            />
            <NotificationToggle 
              label="New Item Alerts"
              description="Be the first to know about new arrivals from your favorite brands."
              value={notificationSettings.newItemAlerts}
              onValueChange={(value) => handleNotificationChange('newItemAlerts', value)}
            />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <Pressable onPress={() => router.push('/account/change-password')} style={styles.menuItem}>
            <Text style={styles.menuItemText}>Change Password</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </Pressable>
          <Pressable onPress={() => setDeleteModalVisible(true)} style={styles.menuItem}>
            <Text style={[styles.menuItemText, styles.deleteAccountText]}>Delete Account</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.saveButtonContainer}>
        <Pressable 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSaveChanges}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
  },
  section: {
    marginTop: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 15,
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  notificationTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  notificationDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
  },
  menuItemArrow: {
    fontSize: 18,
    color: '#999999',
  },
  deleteAccountText: {
    color: '#FF3B30',
  },
  saveButtonContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#A0CFFF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalPasswordPrompt: {
    fontSize: 15,
    color: '#333333',
    marginBottom: 10,
  },
  modalTextInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  modalDeleteButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});