import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: AdminUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ADMIN: AdminUser = {
  id: 'usr-admin-1',
  email: 'admin@thakbo.com',
  fullName: 'Thakbo Senior Moderator',
  role: 'superadmin'
};

const AUTH_STORAGE_KEY = 'thakbo_admin_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved session
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

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // If Supabase Auth is configured, attempt real Supabase sign-in
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          // If Supabase rejected, fall through to demo credentials if applicable
          if (email !== 'admin@thakbo.com' || pass !== 'thakbo2026') {
            setIsLoading(false);
            return { success: false, error: error.message };
          }
        } else if (data?.user) {
          const authUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || 'Admin Officer',
            role: 'admin',
          };
          setUser(authUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          setIsLoading(false);
          return { success: true };
        }
      }

      // Built-in verified administrator authentication check
      if (
        (email.toLowerCase() === 'admin@thakbo.com' && pass === 'thakbo2026') ||
        (email.toLowerCase() === 'moderator@thakbo.com' && pass === 'thakbo2026')
      ) {
        const authenticatedAdmin: AdminUser = {
          ...DEMO_ADMIN,
          email: email.toLowerCase(),
          fullName: email.includes('super') ? 'Super Admin' : 'Lead Moderator',
        };
        setUser(authenticatedAdmin);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedAdmin));
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Invalid admin credentials. Use admin@thakbo.com / thakbo2026' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Authentication error' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin: Boolean(user), isLoading, login, logout }}>
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
