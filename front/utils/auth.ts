interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  avatar?: string;
}

interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

const API_BASE = '/api';

export const auth = {
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data;
  },

  async getProfile(): Promise<{ user: User }> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch profile');
    }

    return data;
  },

  setToken(token: string) {
    localStorage.setItem('token', token);
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Important to send cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove token from localStorage
      this.removeToken();
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

export type { User, AuthResponse };