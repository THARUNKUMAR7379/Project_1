// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const messagingApi = {
  getConversations: async () => {
    const response = await fetch(`${API_URL}/messages/conversations`, {
      credentials: 'include',
    });
    return response.json();
  },

  getMessages: async (conversationId: string) => {
    const response = await fetch(`${API_URL}/messages/${conversationId}`, {
      credentials: 'include',
    });
    return response.json();
  },

  sendMessage: async (conversationId: string, message: any) => {
    const response = await fetch(`${API_URL}/messages/${conversationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
      credentials: 'include',
    });
    return response.json();
  },
}; 