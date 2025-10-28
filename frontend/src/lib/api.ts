// Simple API service to send data to backend without changing frontend structure
const API_BASE_URL = 'http://localhost:5000';

// Simple fetch wrapper with error handling
async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    console.log(`🚀 FRONTEND API CALL: ${options.method || 'GET'} ${endpoint}`);
    if (options.body) {
      console.log(`📤 Sending data:`, JSON.parse(options.body as string));
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.warn(`❌ API call failed: ${endpoint}`, response.status, data);
      return null;
    }

    console.log(`✅ API success: ${endpoint}`, data);
    return data;
  } catch (error) {
    console.warn(`❌ API error: ${endpoint}`, error);
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
      body: JSON.stringify(payload),
    });
  }

  if (action === 'dislike') {
    return apiCall(`/api/likes/${itemId}`, {
      method: 'DELETE',
      body: JSON.stringify(payload),
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

// Send user authentication to backend
export async function sendAuth(email: string, name: string) {
  return apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      name,
      password: 'temp_password', // You can improve this later
    }),
  });
}

// Fetch products from backend (optional - can be used to replace static data later)
export async function fetchProducts() {
  return apiCall('/api/products');
}

// Health check
export async function checkBackendHealth() {
  return apiCall('/health');
}
