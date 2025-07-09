const API_URL = 'http://localhost:5000/api';

export const profileApi = {
  getProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('[profileApi] Fetching profile...');
      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[profileApi] Profile response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[profileApi] Profile data received:', data);
      
      if (data.success && data.profile) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to get profile');
      }
    } catch (error) {
      console.error('[profileApi] Error getting profile:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to get profile',
        profile: null 
      };
    }
  },

  updateProfile: async (profileData: any) => {
    try {
      const token = localStorage.getItem('token');
      console.log('[profileApi] JWT token:', token);
      if (!token) {
        alert('You are not logged in. Please log in again.');
        throw new Error('No authentication token found');
      }
      // Remove empty fields from payload
      const cleaned = Object.fromEntries(Object.entries(profileData).filter(([k, v]) => v !== undefined && v !== null && v !== ''));
      // Clean socials
      if (cleaned.socials) {
        cleaned.socials = Object.fromEntries(Object.entries(cleaned.socials).filter(([_, v]) => typeof v === 'string' && v.trim() !== ''));
      }
      console.log('[profileApi] Sending update payload:', cleaned);
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleaned),
      });
      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        data = { message: 'Invalid server response' };
      }
      console.log('[profileApi] Update response:', data);
      if (!response.ok) {
        return { success: false, ...data, status: response.status };
      }
      if (typeof data === 'object' && data !== null && 'success' in data && (data as any).success && 'profile' in data) {
        return data;
      } else {
        return { success: false, ...data };
      }
    } catch (error: any) {
      console.error('[profileApi] Error updating profile:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update profile',
        profile: null
      };
    }
  },

  uploadAvatar: async (file: File) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      if (!file) return { success: true, url: null };
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:5000/api/profile/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        data = { message: 'Invalid server response' };
      }
      console.log('[profileApi] Avatar upload response:', data);
      if (!response.ok) {
        return { success: false, ...data, status: response.status };
      }
      if (typeof data === 'object' && data !== null && 'success' in data && (data as any).success && 'url' in data) {
        return data;
      } else {
        return { success: false, ...data };
      }
    } catch (error: any) {
      console.error('[profileApi] Error uploading avatar:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload avatar',
        url: null
      };
    }
  },

  // Helper function to get default avatar
  getDefaultAvatar: (name: string = 'User') => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  },

  // Helper function to validate image file
  validateImageFile: (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'Only JPG and PNG files are allowed' };
    }

    if (file.size > maxSize) {
      return { valid: false, message: 'File size must be less than 5MB' };
    }

    return { valid: true, message: 'File is valid' };
  }
}; 