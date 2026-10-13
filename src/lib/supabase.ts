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

export const seedSupabaseDatabase = async (): Promise<{ success: boolean; message: string; insertedCount?: number }> => {
  if (!supabase) {
    return { success: false, message: 'Supabase client is not initialized.' };
  }

  try {
    const { error: testErr } = await supabase.from('hotels').select('id').limit(1);
    if (testErr) {
      return {
        success: false,
        message: 'Database tables do not exist yet in Supabase. Please copy and run the SQL Script in your Supabase SQL Editor first, then run this seed.'
      };
    }

    const sampleHotels = [
      {
        name: 'সাগরিকা গেস্ট হাউস',
        slug: 'sagorika-guest-house-coxsbazar',
        description_bn: 'কক্সবাজার সুগন্ধা বিচ থেকে মাত্র ৩ মিনিট হাঁটার দূরত্বে পরিচ্ছন্ন ও কম খরচের পারিবারিক গেস্ট হাউস।',
        description_en: 'Clean and affordable family guest house located near Sugandha Beach, Coxs Bazar.',
        accommodation_type: 'guest_house',
        location_id: 'upz-coxsbazar-sadar',
        address: 'হোটেল মোটেল জোন, সুগন্ধা পয়েন্ট, কক্সবাজার সদর',
        contact_phone: '+8801711223344',
        status: 'published',
        source_type: 'demo',
        verification_status: 'community_verified',
        price_from: 1200,
        facilities: ['fac-wifi', 'fac-generator', 'fac-attached-bath']
      },
      {
        name: 'মেঘের বাড়ি ইকো কটেজ',
        slug: 'megher-bari-sajek-valley',
        description_bn: 'সাজেক ভ্যালির রুইলুই পাড়ায় কাঠের তৈরি নান্দনিক কটেজ। ব্যালকনি থেকে সরাসরি মেঘের সমুদ্র এবং সূর্যোদয় উপভোগ করা যায়।',
        description_en: 'Charming wooden eco-cottage in Ruilui Para, Sajek Valley with direct sunrise cloud views.',
        accommodation_type: 'eco_cottage',
        location_id: 'upz-baghaichhari',
        address: 'রুইলুই পাড়া, সাজেক ভ্যালি, বাঘাইছড়ি, রাঙ্গামাটি',
        contact_phone: '+8801819556677',
        status: 'published',
        source_type: 'demo',
        verification_status: 'owner_verified',
        price_from: 1500,
        facilities: ['fac-generator', 'fac-attached-bath']
      },
      {
        name: 'গ্রিন টি ভিউ রিসোর্ট',
        slug: 'green-tea-view-sreemangal',
        description_bn: 'শ্রীমঙ্গলের শ্যামলী চা বাগানের সংলগ্ন শান্ত ও নিরিবিলি ইকো রিসোর্ট। বাঁশ ও খড়ের তৈরি ঐতিহ্যবাহী কটেজ।',
        description_en: 'Peaceful budget eco stay adjacent to lush tea gardens in Sreemangal.',
        accommodation_type: 'resort',
        location_id: 'upz-sreemangal',
        address: 'ভানুগাছ রোড, রাধানগর, শ্রীমঙ্গল, মৌলভীবাজার',
        contact_phone: '+8801912334455',
        status: 'published',
        source_type: 'demo',
        verification_status: 'community_verified',
        price_from: 1000,
        facilities: ['fac-wifi', 'fac-generator', 'fac-attached-bath']
      }
    ];

    const { data: insertedHotels, error: insertHotelsErr } = await supabase
      .from('hotels')
      .upsert(sampleHotels, { onConflict: 'slug' })
      .select();

    if (insertHotelsErr) {
      return { success: false, message: `Hotels insertion error: ${insertHotelsErr.message}` };
    }

    const sampleSubmissions = [
      {
        reference_code: 'THK-BND-7821',
        submitted_by: 'কায়সার আহমেদ (ট্যুর গাইড)',
        private_contact_email: 'kaisar.tour@gmail.com',
        payload: {
          propertyName: 'পাহাড়িকা ভিউ পয়েন্ট রিসোর্ট',
          accommodationType: 'resort',
          divisionId: 'div-chattogram',
          districtId: 'dis-bandarban',
          upazilaId: 'upz-bandarban-sadar',
          address: 'মেঘলা পর্যটন কমপ্লেক্সের পাশে, বান্দরবান সদর',
          contactPhone: '+8801822334455',
          descriptionBn: 'নীলাচল ও মেঘলার কাছে মনোরম পাহাড়ঘেরা সাশ্রয়ী রিসোর্ট।',
          rooms: [
            { roomName: 'নন-এসি ডাবল', roomType: 'double', pricePerNight: 1100, maxGuests: 2, airConditioned: false, bathroomType: 'attached' }
          ],
          facilities: ['fac-wifi', 'fac-generator']
        },
        status: 'pending',
        admin_notes: 'মালিকের সাথে ফোনে যোগাযোগ করে দাম যাচাই করতে হবে।'
      },
      {
        reference_code: 'THK-STM-9412',
        submitted_by: 'রাকিব হাসান (সেন্টমার্টিন ট্রাভেলার)',
        private_contact_email: 'rakib.travel@gmail.com',
        payload: {
          propertyName: 'সেন্টমার্টিন কোরাল ভিলেজ',
          accommodationType: 'eco_cottage',
          divisionId: 'div-chattogram',
          districtId: 'dis-coxsbazar',
          upazilaId: 'upz-teknaf',
          address: 'পশ্চিম বিচ, সেন্টমার্টিন দ্বীপ, টেকনাফ',
          contactPhone: '+8801733445566',
          descriptionBn: 'সমুদ্রের ঢেউয়ের শব্দ শোনা যায় এমন নারিকেল বাগানঘেরা কটেজ।',
          rooms: [
            { roomName: 'বিচ ভিউ কটেজ', roomType: 'double', pricePerNight: 1400, maxGuests: 2, airConditioned: false, bathroomType: 'attached' }
          ],
          facilities: ['fac-attached-bath', 'fac-restaurant']
        },
        status: 'pending',
        admin_notes: 'জাহাজ চলাচলের সময়সূচি অনুযায়ী সক্রিয়।'
      }
    ];

    await supabase
      .from('submissions')
      .upsert(sampleSubmissions, { onConflict: 'reference_code' });

    return {
      success: true,
      message: 'সফলভাবে Supabase ডেটাবেসে নমুনা হোটেল ও পেন্ডিং সাবমিশন যুক্ত হয়েছে!',
      insertedCount: (insertedHotels?.length || sampleHotels.length)
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error executing Supabase seed.'
    };
  }
};

