import axios from 'axios';
import { getToken, removeToken } from '@/utils/auth';
import type { UserRole } from '@/utils/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window === 'undefined') {
      return config;
    }

    let role: UserRole | null = null;
    const url = config.url || '';
    
    if (url.includes('/api/user/')) {
      role = 'user';
    } else if (url.includes('/api/worker/')) {
      role = 'worker';
    }
    
    if (role) {
      const token = getToken(role);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const url = error.config?.url || '';
        let role: UserRole | null = null;
        
        if (url.includes('/api/user/')) {
          role = 'user';
        } else if (url.includes('/api/worker/')) {
          role = 'worker';
        }
        
        if (role) {
          removeToken(role);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/**
    * Create an API instance for a specific role
 */
export function createRoleApi(role: UserRole) {
  const roleApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  roleApi.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const token = getToken(role);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  roleApi.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && typeof window !== 'undefined') {
        removeToken(role);
      }
      return Promise.reject(error);
    }
  );

  return roleApi;
}

