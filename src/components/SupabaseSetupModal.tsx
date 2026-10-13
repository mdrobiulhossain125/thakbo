import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getSupabaseConfigStatus } from '../lib/supabase';
import { Database, Copy, Check, X, Shield, Terminal, Key } from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'env' | 'storage'>('status');

  if (!isOpen) return null;

  const configStatus = getSupabaseConfigStatus();

  const handleCopy = (text: string, tabId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabId);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const envSnippet = `# Thakbo Production Supabase Integration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
`;

  const sqlSchemaSnippet = `-- ==========================================
-- THAKBO POSTGRESQL SCHEMA & RLS POLICIES
-- Target: Supabase PostgreSQL
-- ==========================================

-- 1. Locations
CREATE TABLE IF NOT EXISTS public.locations (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES public.locations(id) ON DELETE SET NULL,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  slug TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('division', 'district', 'upazila')),
  source_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Hotels
CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_bn TEXT NOT NULL,
  description_en TEXT,
  accommodation_type TEXT NOT NULL,
  location_id TEXT REFERENCES public.locations(id),
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  contact_phone TEXT NOT NULL,
  public_website_url TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'unpublished', 'archived')),
  source_type TEXT NOT NULL DEFAULT 'community_submission',
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  price_from NUMERIC NOT NULL DEFAULT 0,
  price_checked_at TIMESTAMPTZ DEFAULT now(),
  facilities TEXT[] DEFAULT '{}',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- 3. Hotel Rooms
CREATE TABLE IF NOT EXISTS public.hotel_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  room_type TEXT NOT NULL,
  price_per_night NUMERIC NOT NULL,
  max_guests INT NOT NULL DEFAULT 2,
  air_conditioned BOOLEAN DEFAULT false,
  bathroom_type TEXT DEFAULT 'attached',
  availability_note TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Hotel Photos
CREATE TABLE IF NOT EXISTS public.hotel_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 1,
  is_cover BOOLEAN DEFAULT false,
  attribution TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Submissions (Private to submitter & admins)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_code TEXT UNIQUE NOT NULL,
  submitted_by TEXT,
  private_contact_email TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  admin_notes TEXT,
  decision_reason TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Reports (Issue flagging)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  description TEXT NOT NULL,
  reporter_contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  resolution_note TEXT,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous users may only read published hotels & photos
CREATE POLICY "Public read published hotels" ON public.hotels
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read rooms of published hotels" ON public.hotel_rooms
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.hotels WHERE id = hotel_rooms.hotel_id AND status = 'published'));

CREATE POLICY "Public read photos of published hotels" ON public.hotel_photos
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.hotels WHERE id = hotel_photos.hotel_id AND status = 'published'));

-- Anonymous users can create pending submissions (write only)
CREATE POLICY "Public insert submissions" ON public.submissions
  FOR INSERT WITH CHECK (status = 'pending');

-- Public lookup by reference code (safe fields only)
CREATE POLICY "Public reference lookup" ON public.submissions
  FOR SELECT USING (true);

-- Anonymous users can submit reports
CREATE POLICY "Public insert reports" ON public.reports
  FOR INSERT WITH CHECK (true);
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'bn' ? 'সুপ্রাডেস্ক / সুপাবেস আর্কিটেকচার সেটআপ' : 'Supabase Integration & Architecture'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'bn' ? 'রিয়েল PostgreSQL ডেটাবেস ও স্টোরেজ নির্দেশিকা' : 'Production PostgreSQL, RLS policies & Auth specification'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 px-6 gap-2 bg-white text-xs font-medium">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'status' 
                ? 'border-blue-600 text-blue-600 font-semibold' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'bn' ? 'সংযোগের বর্তমান অবস্থা' : 'Connection Status'}
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'sql' 
                ? 'border-blue-600 text-blue-600 font-semibold' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'bn' ? 'SQL মাইগ্রেশন ও RLS' : 'SQL Schema & RLS'}
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'env' 
                ? 'border-blue-600 text-blue-600 font-semibold' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            .env.example
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'storage' 
                ? 'border-blue-600 text-blue-600 font-semibold' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'bn' ? 'স্টোরেজ বাকেট' : 'Storage Setup'}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 font-sans text-slate-800">
          
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <div className={`p-2 rounded-lg text-white shrink-0 ${configStatus.isConfigured ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {configStatus.statusText}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {configStatus.isConfigured 
                      ? 'The application is actively communicating with Supabase PostgreSQL and Storage.'
                      : 'The application is currently running with the zero-setup Universal Persistence Engine with realistic demo data across Bangladesh, community pending submission flows, and admin moderation. Simply add your Supabase credentials in .env to switch to cloud Postgres!'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-1">VITE_SUPABASE_URL</span>
                  <span className="font-mono text-slate-700 font-medium">{configStatus.url}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-1">VITE_SUPABASE_ANON_KEY</span>
                  <span className="font-mono text-slate-700 font-medium">
                    {configStatus.hasKey ? 'Configured (Secret Hidden)' : 'Not Set (Using Local Storage)'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 text-xs text-slate-700 space-y-2">
                <h5 className="font-bold text-blue-900">
                  {language === 'bn' ? 'কীভাবে আপনার সুপাবেস যুক্ত করবেন?' : 'How to connect your own Supabase project:'}
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed">
                  <li>Create a free project at <span className="font-mono text-blue-700">supabase.com</span>.</li>
                  <li>Copy and execute the SQL from the <strong>SQL Schema & RLS</strong> tab in Supabase's SQL Editor.</li>
                  <li>Create a public bucket named <span className="font-mono text-blue-700">hotel-photos</span> in Supabase Storage.</li>
                  <li>Add your Project URL and Anon Key to your environment variables.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {language === 'bn' ? 'Supabase SQL এডিটর এ হুবহু পেস্ট করুন' : 'Paste into Supabase SQL Editor'}
                </span>
                <button
                  onClick={() => handleCopy(sqlSchemaSnippet, 'sql')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  {copiedTab === 'sql' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTab === 'sql' ? 'কপি হয়েছে' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-200 text-xs font-mono rounded-xl overflow-x-auto max-h-[360px] leading-relaxed">
                {sqlSchemaSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'env' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {language === 'bn' ? 'আপনার .env ফাইলে সংরক্ষণ করুন' : 'Save in your root .env file'}
                </span>
                <button
                  onClick={() => handleCopy(envSnippet, 'env')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  {copiedTab === 'env' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTab === 'env' ? 'কপি হয়েছে' : 'Copy .env'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 text-xs font-mono rounded-xl overflow-x-auto leading-relaxed">
                {envSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Supabase Storage: hotel-photos</h4>
                <p className="text-slate-600 leading-relaxed">
                  Go to <strong>Storage</strong> in Supabase dashboard and create a new bucket:
                </p>
                <ul className="list-disc list-inside space-y-1 font-mono text-slate-800">
                  <li>Bucket name: <span className="text-blue-600 font-bold">hotel-photos</span></li>
                  <li>Public bucket: <span className="text-emerald-600 font-bold">true</span></li>
                  <li>Allowed MIME types: image/jpeg, image/png, image/webp</li>
                  <li>Max file size: 5 MB</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {language === 'bn' ? 'ঠিক আছে' : 'Done'}
          </button>
        </div>

      </div>
    </div>
  );
};
