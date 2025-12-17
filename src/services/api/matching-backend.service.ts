import { supabase } from '@/lib/supabase';

class MatchingBackendService {
  private readonly API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  private async getAuthToken(): Promise<string | null> {
    const { data: session } = await supabase.auth.getSession();
    return session?.session?.access_token || null;
  }

  async getRecommendations(limit: number = 20): Promise<any[]> {
    try {
      const token = await this.getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${this.API_URL}/matching/recommendations?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.warn('Backend recommendations failed, falling back to direct Supabase');
        return [];
      }

      const result = await response.json();
      return result.matches || [];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  async sendInterest(receiverId: string, message: string): Promise<void> {
    try {
      const token = await this.getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${this.API_URL}/matching/interest/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId, message })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send interest');
      }
    } catch (error: any) {
      console.error('Error sending interest:', error);
      throw error;
    }
  }

  async getSentInterests(): Promise<any[]> {
    try {
      const token = await this.getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${this.API_URL}/matching/interests/sent`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.warn('Failed to fetch sent interests from backend');
        return [];
      }

      const result = await response.json();
      return result.interests || [];
    } catch (error) {
      console.error('Error fetching sent interests:', error);
      return [];
    }
  }

  async getReceivedInterests(): Promise<any[]> {
    try {
      const token = await this.getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${this.API_URL}/matching/interests/received`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.warn('Failed to fetch received interests from backend');
        return [];
      }

      const result = await response.json();
      return result.interests || [];
    } catch (error) {
      console.error('Error fetching received interests:', error);
      return [];
    }
  }

  async respondToInterest(interestId: string, action: 'accept' | 'decline'): Promise<void> {
    try {
      const token = await this.getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${this.API_URL}/matching/interest/${interestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to respond to interest');
      }
    } catch (error: any) {
      console.error('Error responding to interest:', error);
      throw error;
    }
  }
}

export const matchingBackendService = new MatchingBackendService();
