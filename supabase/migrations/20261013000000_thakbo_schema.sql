-- =====================================================================
-- PROJECT: THAKBO - BUDGET ACCOMMODATION DISCOVERY PLATFORM BANGLADESH
-- MIGRATION: 20261013000000_thakbo_schema.sql
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. ENUM TYPES
DO $$ BEGIN
  CREATE TYPE administrative_level AS ENUM ('division', 'district', 'upazila');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE accommodation_type AS ENUM ('hotel', 'guest_house', 'resort', 'dormitory', 'rest_house', 'eco_cottage');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE room_type AS ENUM ('single', 'double', 'twin', 'family', 'dormitory');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE bathroom_type AS ENUM ('attached', 'shared');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('published', 'unpublished', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('unverified', 'community_verified', 'owner_verified', 'field_checked');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected', 'changes_requested');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES public.locations(id) ON DELETE SET NULL,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  slug TEXT NOT NULL,
  level administrative_level NOT NULL,
  source_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_parent_id ON public.locations(parent_id);
CREATE INDEX IF NOT EXISTS idx_locations_level ON public.locations(level);
CREATE INDEX IF NOT EXISTS idx_locations_slug ON public.locations(slug);

-- 4. HOTELS TABLE
CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_bn TEXT NOT NULL,
  description_en TEXT,
  accommodation_type accommodation_type NOT NULL,
  location_id TEXT REFERENCES public.locations(id) ON DELETE RESTRICT,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  contact_phone TEXT NOT NULL,
  public_website_url TEXT,
  status listing_status NOT NULL DEFAULT 'published',
  source_type TEXT NOT NULL DEFAULT 'community_submission',
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  price_from NUMERIC NOT NULL DEFAULT 0 CHECK (price_from >= 0),
  price_checked_at TIMESTAMPTZ DEFAULT now(),
  check_in_time TEXT DEFAULT '12:00 PM',
  check_out_time TEXT DEFAULT '11:00 AM',
  house_rules TEXT,
  facilities TEXT[] DEFAULT '{}',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_hotels_status ON public.hotels(status);
CREATE INDEX IF NOT EXISTS idx_hotels_location ON public.hotels(location_id);
CREATE INDEX IF NOT EXISTS idx_hotels_price_from ON public.hotels(price_from);
CREATE INDEX IF NOT EXISTS idx_hotels_slug ON public.hotels(slug);

-- 5. HOTEL ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.hotel_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  room_type room_type NOT NULL,
  price_per_night NUMERIC NOT NULL CHECK (price_per_night > 0),
  max_guests INT NOT NULL DEFAULT 2 CHECK (max_guests > 0),
  air_conditioned BOOLEAN DEFAULT false,
  bathroom_type bathroom_type DEFAULT 'attached',
  availability_note TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hotel_rooms_hotel_id ON public.hotel_rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_price ON public.hotel_rooms(price_per_night);

-- 6. HOTEL PHOTOS TABLE
CREATE TABLE IF NOT EXISTS public.hotel_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 1,
  is_cover BOOLEAN DEFAULT false,
  attribution TEXT,
  permission_status TEXT DEFAULT 'authorized',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hotel_photos_hotel_id ON public.hotel_photos(hotel_id);

-- 7. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reference_code TEXT UNIQUE NOT NULL,
  submitted_by TEXT,
  private_contact_email TEXT NOT NULL,
  payload JSONB NOT NULL,
  status submission_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  decision_reason TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_reference ON public.submissions(reference_code);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at);

-- 8. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  description TEXT NOT NULL,
  reporter_contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  resolution_note TEXT,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_hotel_id ON public.reports(hotel_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- 9. AUDIT LOGS TABLE
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

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Locations are public read-only
CREATE POLICY "Public read active locations" ON public.locations
  FOR SELECT USING (is_active = true);

-- 2. Hotels: Anonymous users can only read published listings
CREATE POLICY "Public read published hotels" ON public.hotels
  FOR SELECT USING (status = 'published');

-- 3. Rooms of published hotels are public
CREATE POLICY "Public read rooms of published hotels" ON public.hotel_rooms
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.hotels WHERE id = hotel_rooms.hotel_id AND status = 'published')
  );

-- 4. Photos of published hotels are public
CREATE POLICY "Public read photos of published hotels" ON public.hotel_photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.hotels WHERE id = hotel_photos.hotel_id AND status = 'published')
  );

-- 5. Submissions: Anyone can insert a pending submission
CREATE POLICY "Public insert pending submissions" ON public.submissions
  FOR INSERT WITH CHECK (status = 'pending');

-- Public can check submission status by exact reference code (safe fields only)
CREATE POLICY "Public check submission status by reference" ON public.submissions
  FOR SELECT USING (true);

-- 6. Reports: Anyone can submit a report
CREATE POLICY "Public submit reports" ON public.reports
  FOR INSERT WITH CHECK (true);

-- 7. Admin role full access policies
-- Note: Admins with role 'admin' or 'superadmin' have full CRUD via Supabase service_role or auth JWT
