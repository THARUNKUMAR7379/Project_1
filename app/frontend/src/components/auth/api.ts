const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function fetchWithTimeoutAndRetry(url: string, options: any, timeoutMs: number, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    // Wait 1s before fetch (Render cold start mitigation)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error(`[authApi] Request timeout after ${timeoutMs / 1000} seconds`);
    }, timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.status === 404) {
        console.error(`[authApi] 404 Not Found: ${url}`);
        return { success: false, message: 'API endpoint not found (404). Please try again later.' };
      }
      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        data = {};
      }
      if (!response.ok) {
        let errorMessage = data.message || 'Request failed';
        return { success: false, message: errorMessage };
      }
      return { ...data, success: true };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        if (attempt < retries) {
          console.warn(`[authApi] AbortError, retrying (${attempt + 1}/${retries})...`);
          continue;
        }
        return { success: false, message: `Request timeout after ${timeoutMs / 1000} seconds. Please try again.` };
      }
      if (attempt < retries) {
        console.warn(`[authApi] Network error, retrying (${attempt + 1}/${retries})...`, error);
        continue;
      }
      return { success: false, message: error.message || 'Network error' };
    }
  }
  return { success: false, message: 'Request failed after retries.' };
}

export const authApi = {
  login: async (credentials: { identifier: string; password: string }) => {
    console.log('[authApi] login called with:', credentials);
    return fetchWithTimeoutAndRetry(
      `${API_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          identifier: credentials.identifier,
          password: credentials.password,
        }),
        credentials: 'include',
      },
      60000 // 60 seconds
    );
  },
  signup: async (userData: { email: string; password: string; username: string }) => {
    console.log('[authApi] signup called with:', userData);
    return fetchWithTimeoutAndRetry(
      `${API_URL}/api/auth/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      },
      60000 // 60 seconds
    );
  },

  getProfile: async (token: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error('[authApi] Profile request timeout after 10 seconds');
    }, 10000);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal,
        credentials: 'include',
      });
      
      clearTimeout(timeoutId);
      
      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        data = {};
      }
      
      if (!response.ok) {
        let errorMessage = data.message || 'Failed to get profile';
        return { success: false, message: errorMessage };
      }
      
      return { ...data, success: true };
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('[authApi] getProfile error:', error);
      
      if (error.name === 'AbortError') {
        return { success: false, message: 'Request timeout. Please try again.' };
      }
      
      return { success: false, message: error.message || 'Network error' };
    }
  },

  forgotPassword: async (email: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error('[authApi] Forgot password request timeout after 10 seconds');
    }, 10000);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
        signal: controller.signal,
        credentials: 'include',
      });
      
      clearTimeout(timeoutId);
      
      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        data = {};
      }
      
      if (!response.ok) {
        let errorMessage = data.message || 'Failed to send reset email';
        return { success: false, message: errorMessage };
      }
      
      return { ...data, success: true };
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('[authApi] forgotPassword error:', error);
      
      if (error.name === 'AbortError') {
        return { success: false, message: 'Request timeout. Please try again.' };
      }
      
      return { success: false, message: error.message || 'Network error' };
    }
  },
}; 