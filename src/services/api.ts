// API configuration and common utilities
interface ImportMetaEnv {
  VITE_API_BASE_URL: string;
}

declare global {
  interface ImportMeta {
    env: ImportMetaEnv;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = {
  get: async (endpoint: string) => {
    try {
      console.log(`Making GET request to: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        console.error(`API Error - Status: ${response.status}, URL: ${API_BASE_URL}${endpoint}`);
        const errorText = await response.text();
        console.error(`Error response body: ${errorText}`);
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`API Response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API GET request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  post: async (endpoint: string, data: any) => {
    try {
      console.log(`Making POST request to: ${API_BASE_URL}${endpoint}`, data);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        console.error(`API Error - Status: ${response.status}, URL: ${API_BASE_URL}${endpoint}`);
        const errorText = await response.text();
        console.error(`Error response body: ${errorText}`);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log(`API Response from POST ${endpoint}:`, responseData);
      return responseData;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  put: async (endpoint: string, data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  delete: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },
};