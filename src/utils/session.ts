/**
 * Session Management Utilities
 * Handles session persistence and token refresh
 */

import { supabase } from '@/services/api/base';
import { Session } from '@supabase/supabase-js';

const SESSION_STORAGE_KEY = 'brahmin_soulmate_session';
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes (tokens expire in 1 hour)

/**
 * Save session to local storage
 */
export function saveSession(session: Session): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

/**
 * Load session from local storage
 */
export function loadSession(): Session | null {
  try {
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData) as Session;
    
    // Check if session is expired
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      clearSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
}

/**
 * Clear session from local storage
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}

/**
 * Check if session is about to expire (within 10 minutes)
 */
export function isSessionExpiringSoon(session: Session): boolean {
  if (!session.expires_at) return false;
  const expiresAt = session.expires_at * 1000;
  const tenMinutesFromNow = Date.now() + (10 * 60 * 1000);
  return expiresAt < tenMinutesFromNow;
}

/**
 * Refresh session token
 */
export async function refreshSessionToken(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Failed to refresh session:', error);
      return null;
    }
    
    if (data.session) {
      saveSession(data.session);
      return data.session;
    }
    
    return null;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
}

/**
 * Set up automatic token refresh
 */
export function setupTokenRefresh(): () => void {
  const intervalId = setInterval(async () => {
    const session = loadSession();
    
    if (session && isSessionExpiringSoon(session)) {
      console.log('Session expiring soon, refreshing token...');
      await refreshSessionToken();
    }
  }, TOKEN_REFRESH_INTERVAL);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Initialize session management
 */
export async function initializeSession(): Promise<Session | null> {
  // Try to load session from storage
  const storedSession = loadSession();
  
  if (storedSession) {
    // Check if session needs refresh
    if (isSessionExpiringSoon(storedSession)) {
      return await refreshSessionToken();
    }
    return storedSession;
  }
  
  // Try to get session from Supabase
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Failed to get session:', error);
    return null;
  }
  
  if (data.session) {
    saveSession(data.session);
    return data.session;
  }
  
  return null;
}

/**
 * Handle session expiry
 */
export function handleSessionExpiry(callback: () => void): void {
  const session = loadSession();
  
  if (!session || !session.expires_at) return;
  
  const expiresAt = session.expires_at * 1000;
  const timeUntilExpiry = expiresAt - Date.now();
  
  if (timeUntilExpiry > 0) {
    setTimeout(() => {
      clearSession();
      callback();
    }, timeUntilExpiry);
  } else {
    clearSession();
    callback();
  }
}

/**
 * Get time until session expires (in minutes)
 */
export function getTimeUntilExpiry(session: Session): number {
  if (!session.expires_at) return 0;
  const expiresAt = session.expires_at * 1000;
  const timeUntilExpiry = expiresAt - Date.now();
  return Math.floor(timeUntilExpiry / (60 * 1000));
}

/**
 * Check if user has active session
 */
export async function hasActiveSession(): Promise<boolean> {
  const session = await initializeSession();
  return !!session;
}
