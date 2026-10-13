import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getSupabaseConfigStatus, checkSupabaseHealth, seedSupabaseDatabase, SupabaseHealthResult } from '../lib/supabase';
import { Database, Copy, Check, X, Shield, Terminal, Key, Play, Sparkles, ExternalLink, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sql' | 'guide' | 'api' | 'status'>('sql');
  const [seedStatus, setSeedStatus] = useState<{ loading: boolean; result?: { success: boolean; message: string } }>({ loading: false });
  const [healthStatus, setHealthStatus] = useState<SupabaseHealthResult | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  if (!isOpen) return null;

  const configStatus = getSupabaseConfigStatus();

  const handleCopy = (text: string, tabId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabId);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleRunHealthCheck = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await checkSupabaseHealth();
      setHealthStatus(res);
    } catch {} finally {
      setIsCheckingHealth(false);
    }
  };

  const handleRunApiSeed = async () => {
    setSeedStatus({ loading: true });
    try {
      const res = await seedSupabaseDatabase();
      setSeedStatus({ loading: false, result: res });
    } catch (e: any) {
      setSeedStatus({ loading: false, result: { success: false, message: e?.message || 'Seed execution failed.' } });
    }
  };

  // Complete SQL Schema + RLS + Rich Dummy Data Seed for Supabase SQL Editor
  const fullSqlSeedSnippet = `-- ==========================================================
-- THAKBO SUPABASE POSTGRESQL FULL SCHEMA + DUMMY DATA SEED
-- Project Ref: algwvliarggdbuebxove
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/algwvliarggdbuebxove/sql/new
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles & RBAC
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('owner', 'superadmin', 'admin', 'moderator', 'user')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Hotels Table
CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_bn TEXT NOT NULL,
  description_en TEXT,
  accommodation_type TEXT NOT NULL,
  location_id TEXT NOT NULL,
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
  published_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Hotel Rooms Table
CREATE TABLE IF NOT EXISTS public.hotel_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- 5. Submissions Table (Pending Moderation)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- 6. Reports Table (Discrepancy Reporting)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  description TEXT NOT NULL,
  reporter_contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  resolution_note TEXT,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Enable Row-Level Security (RLS)
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 9. Open Permissive Policies for Web Application
DROP POLICY IF EXISTS "Public read published hotels" ON public.hotels;
CREATE POLICY "Public read published hotels" ON public.hotels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write hotels" ON public.hotels;
CREATE POLICY "Allow write hotels" ON public.hotels FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read hotel rooms" ON public.hotel_rooms;
CREATE POLICY "Public read hotel rooms" ON public.hotel_rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write hotel rooms" ON public.hotel_rooms;
CREATE POLICY "Allow write hotel rooms" ON public.hotel_rooms FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read and write submissions" ON public.submissions;
CREATE POLICY "Public read and write submissions" ON public.submissions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public reports" ON public.reports;
CREATE POLICY "Public reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public audit logs" ON public.audit_logs;
CREATE POLICY "Public audit logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- 10. DUMMY DATA SEED (নমুনা হোটেল ও সাবমিশন ডেটা)
-- ==========================================================

-- Clean existing demo rows if re-executing
DELETE FROM public.hotels WHERE source_type = 'demo';

-- Hotel 1: Cox's Bazar Sagorika Guest House
INSERT INTO public.hotels (id, name, slug, description_bn, description_en, accommodation_type, location_id, address, contact_phone, status, source_type, verification_status, price_from, facilities)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'সাগরিকা গেস্ট হাউস',
  'sagorika-guest-house-coxsbazar',
  'কক্সবাজার সুগন্ধা বিচ থেকে মাত্র ৩ মিনিট হাঁটার দূরত্বে পরিচ্ছন্ন ও কম খরচের পারিবারিক গেস্ট হাউস। ২৪ ঘণ্টা পানি ও নিরাপত্তা ব্যবস্থা রয়েছে।',
  'Clean and affordable family guest house located near Sugandha Beach, Coxs Bazar.',
  'guest_house',
  'upz-coxsbazar-sadar',
  'হোটেল মোটেল জোন, সুগন্ধা পয়েন্ট, কক্সবাজার সদর',
  '+8801711223344',
  'published',
  'demo',
  'community_verified',
  1200,
  ARRAY['fac-wifi', 'fac-generator', 'fac-attached-bath', 'fac-room-service']
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.hotel_rooms (hotel_id, room_name, room_type, price_per_night, max_guests, air_conditioned, bathroom_type) VALUES
('a1111111-1111-1111-1111-111111111111', 'স্ট্যান্ডার্ড নন-এসি ডাবল', 'double', 1200, 2, false, 'attached'),
('a1111111-1111-1111-1111-111111111111', 'ডিলাক্স এসি ডাবল বেড', 'double', 1800, 2, true, 'attached');

-- Hotel 2: Sajek Valley Megher Bari Eco Cottage
INSERT INTO public.hotels (id, name, slug, description_bn, description_en, accommodation_type, location_id, address, contact_phone, status, source_type, verification_status, price_from, facilities)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'মেঘের বাড়ি ইকো কটেজ',
  'megher-bari-sajek-valley',
  'সাজেক ভ্যালির রুইলুই পাড়ায় কাঠের তৈরি নান্দনিক কটেজ। ব্যালকনি থেকে সরাসরি মেঘের সমুদ্র এবং সূর্যোদয় উপভোগ করা যায়।',
  'Charming wooden eco-cottage in Ruilui Para, Sajek Valley with direct sunrise cloud views.',
  'eco_cottage',
  'upz-baghaichhari',
  'রুইলুই পাড়া, সাজেক ভ্যালি, বাঘাইছড়ি, রাঙ্গামাটি',
  '+8801819556677',
  'published',
  'demo',
  'owner_verified',
  1500,
  ARRAY['fac-generator', 'fac-attached-bath', 'fac-geyser']
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.hotel_rooms (hotel_id, room_name, room_type, price_per_night, max_guests, air_conditioned, bathroom_type) VALUES
('b2222222-2222-2222-2222-222222222222', 'ব্যালকনি উডেন কটেজ', 'double', 1500, 2, false, 'attached'),
('b2222222-2222-2222-2222-222222222222', 'ক্লাউড ভিউ ফ্যামিলি কটেজ', 'family', 2500, 4, false, 'attached');

-- Hotel 3: Sreemangal Green Tea View Resort
INSERT INTO public.hotels (id, name, slug, description_bn, description_en, accommodation_type, location_id, address, contact_phone, status, source_type, verification_status, price_from, facilities)
VALUES (
  'c3333333-3333-3333-3333-333333333333',
  'গ্রিন টি ভিউ রিসোর্ট',
  'green-tea-view-sreemangal',
  'শ্রীমঙ্গলের শ্যামলী চা বাগানের সংলগ্ন শান্ত ও নিরিবিলি ইকো রিসোর্ট। বাঁশ ও খড়ের তৈরি ঐতিহ্যবাহী কটেজ।',
  'Peaceful budget eco stay adjacent to lush tea gardens in Sreemangal.',
  'resort',
  'upz-sreemangal',
  'ভানুগাছ রোড, রাধানগর, শ্রীমঙ্গল, মৌলভীবাজার',
  '+8801912334455',
  'published',
  'demo',
  'community_verified',
  1000,
  ARRAY['fac-wifi', 'fac-generator', 'fac-attached-bath', 'fac-restaurant']
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.hotel_rooms (hotel_id, room_name, room_type, price_per_night, max_guests, air_conditioned, bathroom_type) VALUES
('c3333333-3333-3333-3333-333333333333', 'ইকো বাঁশের কটেজ', 'double', 1000, 2, false, 'attached'),
('c3333333-3333-3333-3333-333333333333', 'এসি ডিলাক্স টি গার্ডেন রুম', 'double', 1600, 2, true, 'attached');

-- 11. Sample Pending Submissions (For Admin Moderation Testing)
INSERT INTO public.submissions (reference_code, submitted_by, private_contact_email, payload, status, admin_notes)
VALUES (
  'THK-BND-7821',
  'কায়সার আহমেদ (ট্যুর গাইড)',
  'kaisar.tour@gmail.com',
  '{"propertyName": "পাহাড়িকা ভিউ পয়েন্ট রিসোর্ট", "accommodationType": "resort", "divisionId": "div-chattogram", "districtId": "dis-bandarban", "upazilaId": "upz-bandarban-sadar", "address": "মেঘলা পর্যটন কমপ্লেক্সের পাশে, বান্দরবান সদর", "contactPhone": "+8801822334455", "descriptionBn": "নীলাচল ও মেঘলার কাছে মনোরম পাহাড়ঘেরা সাশ্রয়ী রিসোর্ট।", "rooms": [{"roomName": "নন-এসি ডাবল", "roomType": "double", "pricePerNight": 1100, "maxGuests": 2, "airConditioned": false, "bathroomType": "attached"}], "facilities": ["fac-wifi", "fac-generator"]}'::jsonb,
  'pending',
  'মালিকের সাথে ফোনে যোগাযোগ করে দাম যাচাই করতে হবে।'
) ON CONFLICT (reference_code) DO NOTHING;

INSERT INTO public.submissions (reference_code, submitted_by, private_contact_email, payload, status, admin_notes)
VALUES (
  'THK-STM-9412',
  'রাকিব হাসান (সেন্টমার্টিন ট্রাভেলার)',
  'rakib.travel@gmail.com',
  '{"propertyName": "সেন্টমার্টিন কোরাল ভিলেজ", "accommodationType": "eco_cottage", "divisionId": "div-chattogram", "districtId": "dis-coxsbazar", "upazilaId": "upz-teknaf", "address": "পশ্চিম বিচ, সেন্টমার্টিন দ্বীপ, টেকনাফ", "contactPhone": "+8801733445566", "descriptionBn": "সমুদ্রের ঢেউয়ের শব্দ শোনা যায় এমন নারিকেল বাগানঘেরা কটেজ।", "rooms": [{"roomName": "বিচ ভিউ কটেজ", "roomType": "double", "pricePerNight": 1400, "maxGuests": 2, "airConditioned": false, "bathroomType": "attached"}], "facilities": ["fac-attached-bath", "fac-restaurant"]}'::jsonb,
  'pending',
  'জাহাজ চলাচলের সময়সূচি অনুযায়ী সক্রিয়।'
) ON CONFLICT (reference_code) DO NOTHING;

-- 12. Sample Reports (For Admin Issue Resolution Testing)
INSERT INTO public.reports (hotel_id, report_type, description, reporter_contact, status)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'incorrect_price',
  'সাগরিকা গেস্ট হাউসে অফ-সিজনে নন-এসি ডাবল ১,০০০ টাকায় পেয়েছি। সাইটে ১২০০ টাকা উল্লেখ আছে।',
  'tourist.bd@gmail.com',
  'pending'
);
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {language === 'bn' ? 'সুপাবেস (Supabase) ডেটাবেস সেটআপ ও ডামি ডেটা' : 'Supabase PostgreSQL Setup & Dummy Data'}
              </h3>
              <p className="text-xs text-slate-400">
                Project Ref: <span className="font-mono text-emerald-400">algwvliarggdbuebxove</span> · Status: {configStatus.statusText}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 gap-2 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'sql' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{language === 'bn' ? 'নমুনা ডেটাসহ সম্পুর্ন SQL' : 'Full Seed SQL'}</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'guide' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>{language === 'bn' ? 'কিভাবে ব্যবহার করবেন' : 'Step-by-Step Guide'}</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'api' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Play className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? '১-ক্লিকে ডেটা সিড (API)' : '1-Click API Seed'}</span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'status' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>{language === 'bn' ? 'কানেকশন ও ক্রেডেনশিয়াল' : 'Connection & Status'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-700 text-xs sm:text-sm">
          
          {/* TAB 1: FULL SEED SQL */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50 border border-blue-200 p-3.5 rounded-xl">
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">
                    {language === 'bn' ? 'নমুনা ডেটাসহ তৈরি প্রস্তুত এসকিউএল স্ক্রিপ্ট' : 'All-in-One SQL Script: Tables + Dummy Data'}
                  </h4>
                  <p className="text-xs text-blue-700">
                    {language === 'bn'
                      ? 'এই স্ক্রিপ্টটিতে সকল টেবিল (hotels, rooms, submissions, reports) এবং নমুনা হোটেল ডেটা একসাথে রয়েছে।'
                      : 'Includes tables, RLS policies, and sample hotels across Coxs Bazar, Sajek, Sreemangal, plus pending submissions.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://supabase.com/dashboard/project/algwvliarggdbuebxove/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <span>Supabase SQL Editor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleCopy(fullSqlSeedSnippet, 'full-sql')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-xs"
                  >
                    {copiedTab === 'full-sql' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTab === 'full-sql' ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-slate-800 max-h-[380px]">
                  <code>{fullSqlSeedSnippet}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: STEP BY STEP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base">
                {language === 'bn' ? 'সুপাবেসে নমুনা ডেটা যুক্ত করার ৩টি সহজ ধাপ:' : 'How to Add Dummy Data in Supabase in 3 Simple Steps:'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                    ১
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {language === 'bn' ? 'SQL কপি করুন' : '1. Copy SQL'}
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'bn'
                      ? 'প্রথম ট্যাব থেকে "নমুনা ডেটাসহ সম্পুর্ন SQL" বাটনে ক্লিক করে পুরো কোডটি কপি করে নিন।'
                      : 'Copy the full SQL script from the Full Seed SQL tab.'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                    ২
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {language === 'bn' ? 'Supabase SQL Editor খুলুন' : '2. Open Supabase'}
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'bn'
                      ? 'আপনার Supabase ড্যাশবোর্ডে লগইন করে বাম মেনু থেকে "SQL Editor" এ যান এবং "New query" চাপুন।'
                      : 'Go to your Supabase dashboard > SQL Editor > New query.'}
                  </p>
                  <a
                    href="https://supabase.com/dashboard/project/algwvliarggdbuebxove/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
                  >
                    <span>লিংক ওপেন করুন</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                    ৩
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {language === 'bn' ? 'পেস্ট করে Run চাপুন' : '3. Paste and Run'}
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'bn'
                      ? 'কপি করা কোডটি পেস্ট করে "Run" বাটনে চাপুন। সাথে সাথে টেবিল ও ডামি ডেটা তৈরি হয়ে যাবে!'
                      : 'Paste the script and click "Run". Tables and sample hotels will be created instantly.'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">
                    {language === 'bn' ? 'ফলস্বরূপ আপনি যা যা পাবেন:' : 'What you will see in your app:'}
                  </span>
                  <span>
                    {language === 'bn' 
                      ? 'কক্সবাজার, সাজেক ও শ্রীমঙ্গলের সাশ্রয়ী হোটেল সাইটে দৃশ্যমান হবে এবং অ্যাডমিন প্যানেলে পেন্ডিং সাবমিশন অনুমোদন বা বাতিল করে পরীক্ষা করতে পারবেন।'
                      : 'Hotels in Coxs Bazar, Sajek, and Sreemangal will appear on the site, and pending submissions will be ready for moderation in the Admin console.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 1-CLICK API SEED */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">
                  {language === 'bn' ? 'ওয়েব অ্যাপ থেকে সরাসরি ১-ক্লিকে ডেটা পুশ' : 'Direct API Push from Web App'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'bn'
                    ? 'আপনার Supabase-এ যদি ইতিমধ্যেই hotels এবং submissions টেবিল তৈরি করা থাকে, তবে নিচের বাটনে ক্লিক করেই সরাসরি Supabase ডেটাবেসে নমুনা ডেটা পাঠাতে পারবেন।'
                    : 'If the tables already exist in your Supabase project, you can insert the dummy data right from this button via the connected client.'}
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleRunApiSeed}
                    disabled={seedStatus.loading}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {seedStatus.loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{language === 'bn' ? 'ডেটা পাঠানো হচ্ছে...' : 'Seeding Data...'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>{language === 'bn' ? '⚡ Supabase-এ নমুনা ডেটা যুক্ত করুন' : '⚡ Seed Demo Data to Supabase'}</span>
                      </>
                    )}
                  </button>
                </div>

                {seedStatus.result && (
                  <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
                    seedStatus.result.success 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {seedStatus.result.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                    <span>{seedStatus.result.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CONNECTION STATUS & CREDENTIALS */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    {language === 'bn' ? 'সুপাবেস প্রজেক্ট কানেকশন স্থিতি' : 'Supabase Connection Live Status'}
                  </span>
                  <button
                    onClick={handleRunHealthCheck}
                    disabled={isCheckingHealth}
                    className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                    <span>{isCheckingHealth ? 'চেক হচ্ছে...' : 'চেক করুন'}</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Project URL:</span>
                    <span className="text-slate-900 font-semibold">{configStatus.url}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Project Ref:</span>
                    <span className="text-blue-600 font-semibold">algwvliarggdbuebxove</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Anon Key Configured:</span>
                    <span className="text-emerald-600 font-semibold">{configStatus.hasKey ? 'YES (Valid)' : 'NO'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Mode:</span>
                    <span className="text-emerald-600 font-bold">{configStatus.statusText}</span>
                  </div>
                </div>

                {healthStatus && (
                  <div className={`p-3 rounded-lg text-xs ${healthStatus.tablesExist ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                    <strong>Health Check Result:</strong> {healthStatus.statusText}
                    {healthStatus.errorMessage && <p className="mt-1 text-[11px]">{healthStatus.errorMessage}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            {language === 'bn' ? 'টিপস: কীবোর্ডে Alt + A চেপে যেকোনো সময় অ্যাডমিন প্যানেল খোলা যায়।' : 'Tip: Press Alt + A anytime to open admin console.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
