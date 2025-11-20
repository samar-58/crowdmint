import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export type UserRole = "user" | "worker";

interface AuthState {
  userToken: string | null;
  workerToken: string | null;
  isAuthenticating: boolean;

  getToken: (role: UserRole) => string | null;

  setUserToken: (token: string) => void;
  setWorkerToken: (token: string) => void;
  setToken: (role: UserRole, token: string) => void;

  removeUserToken: () => void;
  removeWorkerToken: () => void;
  removeToken: (role: UserRole) => void;
  clearAllTokens: () => void;

  setAuthenticating: (isAuthenticating: boolean) => void;

  verifyToken: (role: UserRole) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userToken: null,
      workerToken: null,
      isAuthenticating: false,

      // Getters
      getToken: (role: UserRole) => {
        const state = get();
        return role === 'user' ? state.userToken : state.workerToken;
      },


      setUserToken: (token: string) => set({ userToken: token }),

      setWorkerToken: (token: string) => set({ workerToken: token }),

      setToken: (role: UserRole, token: string) => {
        if (role === 'user') {
          set({ userToken: token });
        } else {
          set({ workerToken: token });
        }
      },


      removeUserToken: () => set({ userToken: null }),

      removeWorkerToken: () => set({ workerToken: null }),

      removeToken: (role: UserRole) => {
        if (role === 'user') {
          set({ userToken: null });
        } else {
          set({ workerToken: null });
        }
      },

      clearAllTokens: () => set({ userToken: null, workerToken: null }),


      setAuthenticating: (isAuthenticating: boolean) => set({ isAuthenticating }),


      verifyToken: async (role: UserRole) => {
        const token = get().getToken(role);
        if (!token) return false;

        try {
          const response = await axios.get(`/api/${role}/health`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          return response.status === 200;
        } catch {
          get().removeToken(role);
          return false;
        }
      },
    }),
    {
      name: 'crowdmint-auth-storage',
      partialize: (state) => ({
        userToken: state.userToken,
        workerToken: state.workerToken,
      }),
    }
  )
);

export const useAuthHeaders = (role: UserRole) => {
  const token = useAuthStore((state) => state.getToken(role));

  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getTokenFromStore = (role: UserRole): string | null => {
  return useAuthStore.getState().getToken(role);
};

export const setTokenInStore = (role: UserRole, token: string) => {
  useAuthStore.getState().setToken(role, token);
};

export const removeTokenFromStore = (role: UserRole) => {
  useAuthStore.getState().removeToken(role);
};

