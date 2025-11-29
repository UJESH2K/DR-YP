// src/lib/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../state/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.9:5000';

// Log the API URL being used for debugging
console.log('🌐 API Base URL:', API_BASE_URL);

// Simple fetch wrapper with error handling and auth token injection
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`🚀 FRONTEND API CALL: ${options.method || 'GET'} ${fullUrl}`);

    const { token, isGuest, guestId } = useAuthStore.getState();
    console.log(`🔑 Auth Token:`, token ? 'Present' : 'Missing');
    
    const headers = { ...options.headers };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (isGuest && guestId) {
      headers['x-guest-id'] = guestId;
    }

    let body = options.body;

    // Don't set Content-Type for FormData, and don't stringify the body
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      if (body) {
        console.log(`📤 Sending data:`, body);
      }
    }

    const response = await fetch(fullUrl, {
      ...options,
      body,
      headers,
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      data = await response.json();
    } else {
      const textData = await response.text();
      // For non-JSON, we can't assume a { message: ... } structure
      // If the request was not ok, we create an error structure
      if (!response.ok) {
          console.warn(`❌ API call failed with non-JSON response: ${endpoint}`, response.status, textData);
          return { message: textData || 'An unknown error occurred on the server.' };
      }
      // If the request was ok but not JSON, we return it as content
      data = { content: textData };
    }
    
    if (!response.ok) {
      console.warn(`❌ API call failed: ${endpoint}`, response.status, data);
      return data; // Return error data from server
    }

    console.log(`✅ API success: ${endpoint}`, data);
    return data;
  } catch (error) {
    console.error(`❌ API error: ${endpoint}`, error);
    console.error(`❌ Full URL was: ${API_BASE_URL}${endpoint}`);
    return { message: error.message || 'An unexpected error occurred.' };
  }
}

// Send user interaction to backend (like, dislike, cart)
export async function sendInteraction(action: 'like' | 'dislike', itemId: string) {
  const payload: { [key: string]: any } = {
    productId: itemId,
  };
  
  const { isGuest, guestId } = useAuthStore.getState();
  if (isGuest && guestId) {
    payload.guestId = guestId;
  }

  if (action === 'like') {
    return apiCall(`/api/likes/${itemId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  if (action === 'dislike') {
    return apiCall(`/api/likes/${itemId}`, {
      method: 'DELETE',
      body: JSON.stringify(payload),
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

// Enhanced API functions for better compatibility
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Product-specific API functions
export const productApi = {
  // Get product by ID
  getProduct: async (id: string) => {
    const response = await apiCall(`/api/products/${id}`);
    // Transform response to match expected format
    if (response && !response.message) {
      return response; // Return the product data directly
    }
    throw new Error(response?.message || 'Failed to fetch product');
  },
  
  // Get all products
  getProducts: async () => {
    const response = await apiCall('/api/products');
    if (response && !response.message) {
      return response;
    }
    throw new Error(response?.message || 'Failed to fetch products');
  },
  
  // Get products by category
  getProductsByCategory: async (category: string) => {
    const response = await apiCall(`/api/products/category/${category}`);
    if (response && !response.message) {
      return response;
    }
    throw new Error(response?.message || 'Failed to fetch products by category');
  },
  
  // Search products
  searchProducts: async (query: string) => {
    const response = await apiCall(`/api/products/search?q=${query}`);
    if (response && !response.message) {
      return response;
    }
    throw new Error(response?.message || 'Failed to search products');
  },
};

// For backward compatibility - wraps the response in { data } format
export const apiCallWithData = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<{ data: T }> => {
  const response = await apiCall(endpoint, options);
  if (response && response.message) {
    throw new Error(response.message);
  }
  return { data: response };
};

export default apiCall;