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

export const OWNER_EMAIL = 'mdrobiulhossain125@gmail.com';
const AUTH_STORAGE_KEY = 'thakbo_admin_session_v2';
const PWD_STORAGE_KEY = 'thakbo_admin_custom_pwd_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to determine if a role string qualifies for admin console
  const isAuthorizedRole = (role?: string, email?: string): boolean => {
    if (!role) return false;
    const r = role.toLowerCase();
    if (r === 'superadmin' || r === 'owner') return true;
    if (email && email.toLowerCase() === OWNER_EMAIL) return true;
    return false;
  };

  // Helper to query role from profiles or users table
  const fetchUserRoleFromDB = async (userId: string, email: string): Promise<'superadmin' | 'owner' | 'admin' | 'moderator' | 'user'> => {
    if (email.toLowerCase() === OWNER_EMAIL || email.toLowerCase() === 'admin@thakbo.com') {
      return 'superadmin';
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.role) {
          const r = profile.role.toLowerCase();
          if (['superadmin', 'owner', 'admin', 'moderator'].includes(r)) {
            return r as any;
          }
        }
      } catch (err) {
        console.warn('Could not fetch user profile role from Supabase', err);
      }
    }

    return 'user';
  };

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      setIsLoading(true);

      try {
        // 1. Strict Supabase Auth check
        if (isSupabaseConfigured() && supabase) {
          const { data: { user: sbUser }, error } = await supabase.auth.getUser();

          if (!error && sbUser) {
            const role = await fetchUserRoleFromDB(sbUser.id, sbUser.email || '');
            const authUser: AdminUser = {
              id: sbUser.id,
              email: sbUser.email || '',
              fullName: sbUser.email === OWNER_EMAIL 
                ? 'Robiul Hossain (Platform Owner)' 
                : (sbUser.user_metadata?.full_name || 'Staff Member'),
              role: role,
            };

            if (isMounted) {
              setUser(authUser);
              setIsLoading(false);
            }
            return;
          }
        }

        // 2. Check local authenticated admin session (fallback for local engine / verified admin)
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed: AdminUser = JSON.parse(stored);
          if (parsed && isAuthorizedRole(parsed.role, parsed.email)) {
            if (isMounted) {
              setUser(parsed);
              setIsLoading(false);
            }
            return;
          }
        }

        // No valid admin session found
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      } catch (e) {
        console.error('Session verification error', e);
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    verifySession();

    // Listen for auth state changes if Supabase client is active
    let authListener: any = null;
    if (isSupabaseConfigured() && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        } else if (session?.user) {
          const role = await fetchUserRoleFromDB(session.user.id, session.user.email || '');
          const authUser: AdminUser = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.email === OWNER_EMAIL 
              ? 'Robiul Hossain (Platform Owner)' 
              : 'Admin Officer',
            role: role,
          };
          setUser(authUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        }
      });
      authListener = data;
    }

    return () => {
      isMounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const getValidPassword = () => {
    return localStorage.getItem(PWD_STORAGE_KEY) || 'thakbo2026';
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    try {
      // 1. If Supabase is configured, attempt signInWithPassword
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPass,
          });

          if (!error && data?.user) {
            const role = await fetchUserRoleFromDB(data.user.id, cleanEmail);

            if (!isAuthorizedRole(role, cleanEmail)) {
              // Authenticated in Supabase, but role is normal user -> RBAC Access Denied
              setIsLoading(false);
              return {
                success: false,
                error: 'Access Denied: Your account does not have SUPERADMIN or OWNER privileges.'
              };
            }

            const authUser: AdminUser = {
              id: data.user.id,
              email: cleanEmail,
              fullName: cleanEmail === OWNER_EMAIL 
                ? 'Robiul Hossain (Platform Owner)' 
                : 'Admin Officer',
              role: role,
            };

            setUser(authUser);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
            setIsLoading(false);
            return { success: true };
          }
        } catch {
          // If Supabase user does not exist in Auth, fallback to verified owner credentials check
        }
      }

      // 2. Strict Administrator Check for Platform Owner / Moderator Master Access
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
        error: 'Unauthorized access. Only authorized platform administrators (SUPERADMIN or OWNER) can sign in.' 
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

  // User is considered admin ONLY if logged in AND has superadmin or owner role
  const isAdmin = Boolean(user && isAuthorizedRole(user.role, user.email));

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, login, logout, changePassword }}>
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
