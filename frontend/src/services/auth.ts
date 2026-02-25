import apiClient from './api';
import {
  User,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../types/user';

const AUTH_TOKEN_KEY = 'auth_tokens';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Token storage utilities
export const tokenStorage = {
  getTokens(): AuthTokens | null {
    const tokensStr = localStorage.getItem(AUTH_TOKEN_KEY);
    if (tokensStr) {
      try {
        return JSON.parse(tokensStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(tokens));
    if (tokens.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    }
  },

  getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.access_token || null;
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  clearTokens(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isTokenExpired(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return true;

    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;

    return Date.now() >= parseInt(expiresAt);
  },

  setTokenExpiry(expiresIn: number): void {
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem('token_expires_at', expiresAt.toString());
  },
};

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    if (response.data.tokens) {
      tokenStorage.setTokens(response.data.tokens);
      tokenStorage.setTokenExpiry(response.data.tokens.expires_in);
    }
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.data.tokens) {
      tokenStorage.setTokens(response.data.tokens);
      tokenStorage.setTokenExpiry(response.data.tokens.expires_in);
    }
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      tokenStorage.clearTokens();
      localStorage.removeItem('token_expires_at');
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    const newTokens = response.data;
    tokenStorage.setTokens(newTokens);
    tokenStorage.setTokenExpiry(newTokens.expires_in);
    return newTokens;
  },

  async refreshIfExpired(): Promise<boolean> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken || tokenStorage.isTokenExpired()) {
      if (refreshToken) {
        try {
          await this.refreshToken(refreshToken);
          return true;
        } catch {
          tokenStorage.clearTokens();
          return false;
        }
      }
      return false;
    }
    return true;
  },
};
