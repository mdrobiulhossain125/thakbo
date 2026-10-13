-- =====================================================================
-- PROJECT: THAKBO - BANGLADESH BUDGET ACCOMMODATION SEED DATA
-- FILE: supabase/seed.sql
-- =====================================================================

-- 1. SEED DIVISIONS
INSERT INTO public.locations (id, parent_id, name_en, name_bn, slug, level, source_code, is_active) VALUES
('div-dhaka', NULL, 'Dhaka', 'ঢাকা', 'dhaka', 'division', '30', true),
('div-chattogram', NULL, 'Chattogram', 'চট্টগ্রাম', 'chattogram', 'division', '20', true),
('div-sylhet', NULL, 'Sylhet', 'সিলেট', 'sylhet', 'division', '60', true),
('div-rajshahi', NULL, 'Rajshahi', 'রাজশাহী', 'rajshahi', 'division', '50', true),
('div-khulna', NULL, 'Khulna', 'খুলনা', 'khulna', 'division', '40', true),
('div-barishal', NULL, 'Barishal', 'বরিশাল', 'barishal', 'division', '10', true),
('div-rangpur', NULL, 'Rangpur', 'রংপুর', 'rangpur', 'division', '55', true),
('div-mymensingh', NULL, 'Mymensingh', 'ময়মনসিংহ', 'mymensingh', 'division', '45', true)
ON CONFLICT (id) DO NOTHING;

-- 2. SAMPLE DEMO HOTEL RECORD
INSERT INTO public.hotels (
  id, name, slug, description_bn, description_en, accommodation_type, 
  location_id, address, latitude, longitude, contact_phone, 
  status, source_type, verification_status, price_from, price_checked_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Sagorika Guest House',
  'sagorika-guest-house-coxsbazar',
  'কক্সবাজার সুগন্ধা পয়েন্ট থেকে মাত্র ৫ মিনিট হাঁটার দূরত্বে পরিচ্ছন্ন ও সাশ্রয়ী পারিবারিক গেস্ট হাউস।',
  'Clean and affordable family guest house located near Sugandha Beach point in Coxs Bazar.',
  'guest_house',
  'div-chattogram',
  'প্লট-২৪, হোটেল মোটেল জোন, সুগন্ধা পয়েন্ট, কক্সবাজার',
  21.4272,
  91.9715,
  '+880 1700-000101',
  'published',
  'demo',
  'community_verified',
  1200,
  now()
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.hotel_rooms (
  hotel_id, room_name, room_type, price_per_night, max_guests, air_conditioned, bathroom_type
) VALUES 
('00000000-0000-0000-0000-000000000001', 'নন-এসি ডাবল বেড (স্ট্যান্ডার্ড)', 'double', 1200, 2, false, 'attached'),
('00000000-0000-0000-0000-000000000001', 'ডিলাক্স এসি ডাবল বেড', 'double', 2000, 2, true, 'attached')
ON CONFLICT DO NOTHING;
