// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const jobApi = {
  getJobs: async () => {
    const response = await fetch(`${API_URL}/jobs`, {
      credentials: 'include',
    });
    return response.json();
  },
  getJob: async (jobId: string) => {
    const response = await fetch(`${API_URL}/jobs/${jobId}`, {
      credentials: 'include',
    });
    return response.json();
  },
  applyToJob: async (jobId: string, application: any) => {
    const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(application),
      credentials: 'include',
    });
    return response.json();
  },
}; 