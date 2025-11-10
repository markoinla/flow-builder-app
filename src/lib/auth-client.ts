import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth Client
 * Use this client in React components to access auth state and methods
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
});

/**
 * Export hooks for easy access
 */
export const { useSession, signIn, signUp, signOut } = authClient;
