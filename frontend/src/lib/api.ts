import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.9:5000';

// Log the API URL being used for debugging
console.log('🌐 API Base URL:', API_BASE_URL);

// Simple fetch wrapper with error handling and auth token injection
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`🚀 FRONTEND API CALL: ${options.method || 'GET'} ${fullUrl}`);
    if (options.body) {
      console.log(`📤 Sending data:`, JSON.parse(options.body as string));
    }

    const token = await AsyncStorage.getItem('user_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.warn(`❌ API call failed: ${endpoint}`, response.status, data);
      // Return the whole data object so the caller can get the message
      return data;
    }

    console.log(`✅ API success: ${endpoint}`, data);
    return data;
  } catch (error) {
    console.error(`❌ API error: ${endpoint}`, error);
    console.error(`❌ Full URL was: ${API_BASE_URL}${endpoint}`);
    // It's better to return null or throw, so the caller knows it failed catastrophically
    return null;
  }
}

// Send user interaction to backend (like, dislike, cart)
export async function sendInteraction(action: 'like' | 'dislike' | 'cart', itemId: string, userId?: string) {
  const payload = {
    userId: userId || 'anonymous_user', // fallback for now
    productId: itemId,
    action,
    timestamp: new Date().toISOString(),
  };

  if (action === 'like') {
    return apiCall(`/api/likes/${itemId}`, {
      method: 'POST',
    });
  }

  if (action === 'dislike') {
    return apiCall(`/api/likes/${itemId}`, {
      method: 'DELETE',
    });
  }

  if (action === 'cart') {
    // Send to orders endpoint for cart actions
    return apiCall('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        items: [{ productId: itemId, quantity: 1 }],
        status: 'cart',
      }),
    });
  }
}

// Fetch products from backend (optional - can be used to replace static data later)
export async function fetchProducts() {
  return apiCall('/api/products');
}

// Health check
export async function checkBackendHealth() {
  return apiCall('/health');
}
