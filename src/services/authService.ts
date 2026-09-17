import api from './api'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'

const TOKEN_KEY = 'token'

function storeToken(response: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, response.token)
  return response
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials)
    return storeToken(response.data)
  },

  async register(credentials: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', credentials)
    return storeToken(response.data)
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY)
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_KEY))
  },
}
