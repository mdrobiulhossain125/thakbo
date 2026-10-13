import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://algwvliarggdbuebxove.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fDBjF-mLz-BYp8kl2KN4xg_o9g18nAi';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project')
  );
};

export interface SupabaseHealthResult {
  isConfigured: boolean;
  isConnected: boolean;
  tablesExist: boolean;
  url: string;
  projectRef: string;
  errorMessage?: string;
  statusText: string;
}

export const getSupabaseConfigStatus = () => {
  const configured = isSupabaseConfigured();
  return {
    isConfigured: configured,
    url: supabaseUrl,
    hasKey: Boolean(supabaseAnonKey),
    statusText: configured ? 'Connected to Supabase Project' : 'Local Persistence Engine Active'
  };
};

export const checkSupabaseHealth = async (): Promise<SupabaseHealthResult> => {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      isConfigured: false,
      isConnected: false,
      tablesExist: false,
      url: supabaseUrl,
      projectRef: 'algwvliarggdbuebxove',
      statusText: 'Supabase credentials not configured'
    };
  }

  try {
    const { data, error, status } = await supabase.from('hotels').select('id').limit(1);

    if (error) {
      // PGRST205: relation "public.hotels" does not exist in schema cache
      if (error.code === 'PGRST205' || error.message.includes('Could not find the table') || error.message.includes('relation "public.hotels" does not exist')) {
        return {
          isConfigured: true,
          isConnected: true,
          tablesExist: false,
          url: supabaseUrl,
          projectRef: 'algwvliarggdbuebxove',
          errorMessage: 'Connected to Supabase, but database tables (hotels, submissions) have not been created yet.',
          statusText: 'Connected (Tables Need Migration)'
        };
      }

      return {
        isConfigured: true,
        isConnected: false,
        tablesExist: false,
        url: supabaseUrl,
        projectRef: 'algwvliarggdbuebxove',
        errorMessage: error.message,
        statusText: `Connection Warning (${error.message})`
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      tablesExist: true,
      url: supabaseUrl,
      projectRef: 'algwvliarggdbuebxove',
      statusText: 'Fully Connected & Database Tables Verified'
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      isConnected: false,
      tablesExist: false,
      url: supabaseUrl,
      projectRef: 'algwvliarggdbuebxove',
      errorMessage: err?.message || 'Network exception connecting to Supabase',
      statusText: 'Connection Failed'
    };
  }
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
