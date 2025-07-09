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
      if (!token) {
        throw new Error('No authentication token found');
      }
      console.log('[profileApi] Updating profile with data:', profileData);
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      console.log('[profileApi] Update response status:', response.status);
      const data = await response.json();
      if (!response.ok) {
        // Return all error details for 400/422
        return { success: false, ...data, status: response.status };
      }
      if (data.success && data.profile) {
        return data;
      } else {
        return { success: false, ...data };
      }
    } catch (error) {
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

      console.log('[profileApi] Uploading avatar:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/profile/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('[profileApi] Upload response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[profileApi] Upload response:', data);
      
      if (data.success && data.url) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to upload avatar');
      }
    } catch (error) {
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