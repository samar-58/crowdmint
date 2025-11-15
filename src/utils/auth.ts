/**
 * Utility functions for authentication and token management
 */

export type UserRole = "user" | "worker";

/**
 * Get the localStorage key for a specific role's token
 */
export const getTokenKey = (role: UserRole): string => {
  return `${role}Token`;
};

/**
 * Get the token for a specific role from localStorage
 */
export const getToken = (role: UserRole): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(getTokenKey(role));
};

/**
 * Set the token for a specific role in localStorage
 */
export const setToken = (role: UserRole, token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(getTokenKey(role), token);
};

/**
 * Remove the token for a specific role from localStorage
 */
export const removeToken = (role: UserRole): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getTokenKey(role));
};

/**
 * Clear all tokens from localStorage
 */
export const clearAllTokens = (): void => {
  if (typeof window === "undefined") return;
  removeToken("user");
  removeToken("worker");
};

/**
 * Get authorization headers for API requests
 */
export const getAuthHeaders = (role: UserRole): Record<string, string> => {
  const token = getToken(role);
  if (!token) return {};
  
  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Create axios config with authentication headers
 */
export const getAuthConfig = (role: UserRole) => {
  return {
    headers: getAuthHeaders(role),
  };
};

