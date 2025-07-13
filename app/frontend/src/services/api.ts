// NOTE: The backend API base URL should be 'http://localhost:5000'.
// Example endpoints: '/api/auth/login', '/api/auth/signup', '/api/profile', etc.
// Make sure your frontend calls match these routes and the backend is running on this port.

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  // Remove Content-Type for GET requests
  if (req.method && req.method.toLowerCase() === 'get' && req.headers['Content-Type']) {
    delete req.headers['Content-Type'];
  }
  return req;
});

export const createPost = (postData: {
  content: string;
  tags?: string[];
  visibility?: string;
  media?: string[];
}) => API.post('/posts', postData);

export const getProfile = () => API.get('/profile');

export const api = {
  // Auth endpoints
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  signup: async (userData: { email: string; password: string; name: string }) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Profile endpoints
  getProfile: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
    if (!response.ok) {
      // Fallback: return a default profile structure
      return {
        success: false,
        profile: null,
        message: 'Failed to fetch profile',
      };
    }
    return response.json();
  },

  updateProfile: async (profileData: any) => {
    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(profileData),
    });
    return response.json();
  },
}; 