import { getSupabase } from './getSupabase';
import { API_CONFIG, API_HEADERS, ApiResponse, ApiError, HTTP_STATUS } from '@/api/routes';

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  // Get authentication headers
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await getSupabase().auth.getSession();
    const headers = { ...API_HEADERS };
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    
    return headers;
  }

  // Make HTTP request with retry logic
  private async makeRequest<T>(
    url: string,
    options: RequestInit,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        signal: controller.signal,
        headers: await this.getAuthHeaders(),
      });

      clearTimeout(timeoutId);

      // Handle different response types
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === HTTP_STATUS.UNAUTHORIZED) {
          // Token might be expired, try to refresh
          await this.refreshToken();
          
          // Retry the request once with new token
          if (attempt === 1) {
            return this.makeRequest(url, options, attempt + 1);
          }
        }

        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        data,
        message: data.message
      };

    } catch (error: any) {
      console.error(`API request failed (attempt ${attempt}):`, error);

      // Retry logic for network errors
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * attempt);
        return this.makeRequest(url, options, attempt + 1);
      }

      return {
        success: false,
        error: error.message || 'Network request failed'
      };
    }
  }

  // Check if error should trigger a retry
  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      error.name === 'AbortError' ||
      error.name === 'TypeError' ||
      (error.status >= 500 && error.status < 600)
    );
  }

  // Delay helper for retry logic
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Refresh authentication token
  private async refreshToken(): Promise<void> {
    try {
      const { error } = await getSupabase().auth.refreshSession();
      if (error) throw error;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Redirect to login if refresh fails
      window.location.href = '/login';
    }
  }

  // GET request
  async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.makeRequest<T>(`${url}${queryString}`, {
      method: 'GET',
    });
  }

  // POST request
  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'DELETE',
    });
  }

  // Upload file
  async uploadFile<T>(url: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers = await this.getAuthHeaders();
    delete headers['Content-Type']; // Let browser set content-type for FormData

    return this.makeRequest<T>(url, {
      method: 'POST',
      body: formData,
      headers,
    });
  }

  // Download file
  async downloadFile(url: string, filename?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('File download failed:', error);
      throw error;
    }
  }

  // Batch requests
  async batch<T>(requests: Array<{ url: string; method: string; data?: any }>): Promise<ApiResponse<T[]>> {
    try {
      const promises = requests.map(req => {
        switch (req.method.toUpperCase()) {
          case 'GET':
            return this.get(req.url);
          case 'POST':
            return this.post(req.url, req.data);
          case 'PUT':
            return this.put(req.url, req.data);
          case 'PATCH':
            return this.patch(req.url, req.data);
          case 'DELETE':
            return this.delete(req.url);
          default:
            throw new Error(`Unsupported method: ${req.method}`);
        }
      });

      const results = await Promise.allSettled(promises);
      const data = results.map(result => 
        result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
      );

      return {
        success: true,
        data: data as T[]
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch {
      return false;
    }
  }

  // Set custom headers for specific requests
  setCustomHeaders(headers: Record<string, string>): void {
    Object.assign(API_HEADERS, headers);
  }

  // Clear custom headers
  clearCustomHeaders(): void {
    Object.keys(API_HEADERS).forEach(key => {
      if (!['Content-Type', 'Accept'].includes(key)) {
        delete API_HEADERS[key];
      }
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Convenience methods for common operations
export const api = {
  // Authentication
  auth: {
    signUp: (data: any) => apiClient.post('/api/auth/signup', data),
    signIn: (data: any) => apiClient.post('/api/auth/signin', data),
    signOut: () => apiClient.post('/api/auth/signout'),
    resetPassword: (email: string) => apiClient.post('/api/auth/reset-password', { email }),
    verifyEmail: (token: string) => apiClient.post('/api/auth/verify-email', { token }),
  },

  // Profile
  profile: {
    get: (id: string) => apiClient.get(`/api/profile/${id}`),
    update: (id: string, data: any) => apiClient.put(`/api/profile/${id}`, data),
    search: (filters: any) => apiClient.get('/api/profiles/search', filters),
    uploadImage: (file: File) => apiClient.uploadFile('/api/profile/upload-image', file),
    getStats: (id: string) => apiClient.get(`/api/profile/${id}/stats`),
  },

  // Matching
  matching: {
    sendInterest: (targetId: string, message?: string) => 
      apiClient.post('/api/matches/send-interest', { targetId, message }),
    acceptInterest: (matchId: string) => apiClient.post(`/api/matches/accept/${matchId}`),
    declineInterest: (matchId: string) => apiClient.post(`/api/matches/decline/${matchId}`),
    getSentInterests: () => apiClient.get('/api/matches/sent'),
    getReceivedInterests: () => apiClient.get('/api/matches/received'),
    getConnections: () => apiClient.get('/api/matches/connections'),
    getRecommendations: (limit?: number) => apiClient.get('/api/matches/recommendations', { limit }),
  },

  // Messages
  messages: {
    send: (receiverId: string, content: string) => 
      apiClient.post('/api/messages/send', { receiverId, content }),
    getConversation: (userId: string, limit?: number) => 
      apiClient.get(`/api/messages/conversation/${userId}`, { limit }),
    getConversations: () => apiClient.get('/api/messages/conversations'),
    markRead: (senderId: string) => apiClient.post('/api/messages/mark-read', { senderId }),
  },

  // Payments
  payments: {
    createOrder: (planId: string) => apiClient.post('/api/payments/create-order', { planId }),
    verifyPayment: (paymentData: any) => apiClient.post('/api/payments/verify-payment', paymentData),
    getSubscription: () => apiClient.get('/api/payments/subscription'),
    cancelSubscription: () => apiClient.post('/api/payments/cancel-subscription'),
  },

  // Notifications
  notifications: {
    get: (limit?: number) => apiClient.get('/api/notifications', { limit }),
    markRead: (id: string) => apiClient.post(`/api/notifications/${id}/read`),
    markAllRead: () => apiClient.post('/api/notifications/mark-all-read'),
    getPreferences: () => apiClient.get('/api/notifications/preferences'),
    updatePreferences: (preferences: any) => 
      apiClient.put('/api/notifications/preferences', preferences),
  },

  // Events
  events: {
    getAll: () => apiClient.get('/api/events'),
    get: (id: string) => apiClient.get(`/api/events/${id}`),
    register: (id: string) => apiClient.post(`/api/events/${id}/register`),
  },

  // V-Dates
  vdates: {
    schedule: (data: any) => apiClient.post('/api/vdates/schedule', data),
    getUpcoming: () => apiClient.get('/api/vdates/upcoming'),
    getHistory: () => apiClient.get('/api/vdates/history'),
    accept: (id: string) => apiClient.post(`/api/vdates/${id}/accept`),
    decline: (id: string) => apiClient.post(`/api/vdates/${id}/decline`),
  }
};

export default apiClient;