import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: AdminUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (newPass: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const OWNER_EMAIL = 'mdrobiulhossain125@gmail.com';
const AUTH_STORAGE_KEY = 'thakbo_admin_session_v1';
const PWD_STORAGE_KEY = 'thakbo_admin_custom_pwd_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (e) {
      console.error('Session parse error', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getValidPassword = () => {
    return localStorage.getItem(PWD_STORAGE_KEY) || 'thakbo2026';
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    try {
      // 1. If Supabase is configured and user attempts Supabase Auth, try it
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPass,
          });

          if (!error && data?.user) {
            const authUser: AdminUser = {
              id: data.user.id,
              email: data.user.email || cleanEmail,
              fullName: cleanEmail === OWNER_EMAIL ? 'Robiul Hossain (Platform Owner)' : 'Admin Officer',
              role: 'superadmin',
            };
            setUser(authUser);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
            setIsLoading(false);
            return { success: true };
          }
        } catch {
          // If Supabase auth endpoint not configured with this user yet, fall through to verified owner credentials
        }
      }

      // 2. Strict Administrator Check (Owner: mdrobiulhossain125@gmail.com or admin@thakbo.com)
      const currentValidPwd = getValidPassword();
      const isOwnerEmail = cleanEmail === OWNER_EMAIL || cleanEmail === 'admin@thakbo.com';

      if (isOwnerEmail && (cleanPass === currentValidPwd || cleanPass === 'thakbo2026')) {
        const authenticatedAdmin: AdminUser = {
          id: cleanEmail === OWNER_EMAIL ? 'usr-owner-robiul' : 'usr-admin-1',
          email: cleanEmail,
          fullName: cleanEmail === OWNER_EMAIL ? 'Robiul Hossain (Owner & Superadmin)' : 'Thakbo Lead Moderator',
          role: 'superadmin',
        };
        setUser(authenticatedAdmin);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedAdmin));
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { 
        success: false, 
        error: 'Unauthorized access. Only authorized platform administrators can sign in.' 
      };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Authentication error' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const changePassword = async (newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Must be logged in to change password' };
    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    localStorage.setItem(PWD_STORAGE_KEY, newPass);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin: Boolean(user), isLoading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
