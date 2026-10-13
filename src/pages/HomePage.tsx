import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Hotel } from '../types';
import { getPublishedHotels } from '../services/db';
import { SearchBar } from '../components/SearchBar';
import { HotelCard } from '../components/HotelCard';
import { DIVISIONS } from '../data/locations';
import { 
  Compass, 
  ShieldCheck, 
  MapPin, 
  PlusCircle, 
  ArrowRight, 
  HeartHandshake, 
  CheckCircle2, 
  HelpCircle,
  Building,
  Sparkles
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string, params?: any) => void;
  onSelectHotel: (hotel: Hotel) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectHotel }) => {
  const { language, t, formatPrice } = useLanguage();
  const [budgetStays, setBudgetStays] = useState<Hotel[]>([]);
  const [recentStays, setRecentStays] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const { hotels } = await getPublishedHotels();
        // Budget-friendly stays under ৳1500
        const budget = hotels.filter(h => h.priceFrom <= 1500).slice(0, 4);
        setBudgetStays(budget);
        // Recently updated
        setRecentStays(hotels.slice(0, 4));
      } catch (err) {
        console.error('Failed to load home page stays', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleHeroSearch = (params: any) => {
    onNavigate('hotels', params);
  };

  const popularDestinations = [
    {
      nameBn: 'কক্সবাজার',
      nameEn: "Cox's Bazar",
      locationId: 'upz-coxsbazar-sadar',
      image: '/src/assets/images/cox_beach_guesthouse_1791896539124.jpg',
      tagBn: 'দীর্ঘতম সমুদ্র সৈকত',
      tagEn: 'Longest Sea Beach'
    },
    {
      nameBn: 'সাজেক ভ্যালি',
      nameEn: 'Sajek Valley',
      locationId: 'upz-baghaichhari',
      image: '/src/assets/images/sajek_wooden_cottage_1791896536367.jpg',
      tagBn: 'মেঘের রাজ্য',
      tagEn: 'Kingdom of Clouds'
    },
    {
      nameBn: 'শ্রীমঙ্গল',
      nameEn: 'Sreemangal',
      locationId: 'upz-sreemangal',
      image: '/src/assets/images/sreemangal_tea_resort_1791896538678.jpg',
      tagBn: 'চায়ের রাজধানী',
      tagEn: 'Tea Capital'
    },
    {
      nameBn: 'ঢাকা সদরঘাট ও মিরপুর',
      nameEn: 'Dhaka Transit',
      locationId: 'upz-mirpur',
      image: '/src/assets/images/dhaka_budget_hotel_1791896536825.jpg',
      tagBn: 'বাজেট বিজনেস স্টে',
      tagEn: 'Budget City Transit'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 bg-slate-950 overflow-hidden">
        
        {/* Creative Background Image with Atmospheric Cinematic Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/bangladesh_creative_hero_1791902323480.jpg"
            alt="Bangladesh Creative Travel Landscape - Rolling tea terraces, misty rivers, and majestic mountains"
            className="w-full h-full object-cover object-center scale-105 transform motion-safe:animate-[pulse_10s_ease-in-out_infinite]"
          />
          {/* Multi-layered cinematic gradient: warm golden top-left accent + deep navy contrast base */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/60" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Subtitle / Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-blue-200 text-xs sm:text-sm font-semibold mb-6 shadow-lg shadow-black/20">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t('appTagline')}</span>
            <span className="hidden sm:inline-block text-white/40">|</span>
            <span className="hidden sm:inline-block text-emerald-300 font-normal">
              {language === 'bn' ? '৬৪ জেলা ও ৫০৫+ উপজেলা' : '64 Districts & 505+ Upazilas'}
            </span>
          </div>

          {/* Bengali & English Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight mb-4 text-balance drop-shadow-md">
            {t('heroHeading')}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-200/90 max-w-2xl mx-auto leading-relaxed mb-10 text-balance font-medium drop-shadow-sm">
            {t('heroSubtitle')}
          </p>

          {/* Functional Hero Search Bar */}
          <SearchBar onSearch={handleHeroSearch} variant="hero" />

          {/* Quick Filter Prompts */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'bn' ? 'জনপ্রিয় গন্তব্য:' : 'Quick Hubs:'}</span>
            </span>
            {[
              { id: 'upz-coxsbazar-sadar', bn: 'কক্সবাজার', en: "Cox's Bazar" },
              { id: 'upz-baghaichhari', bn: 'সাজেক ভ্যালি', en: 'Sajek Valley' },
              { id: 'upz-sreemangal', bn: 'শ্রীমঙ্গল', en: 'Sreemangal' },
              { id: 'upz-bandarban-sadar', bn: 'বান্দরবান', en: 'Bandarban' },
              { id: 'upz-kalapara', bn: 'কুয়াকাটা', en: 'Kuakata' },
              { id: 'upz-gowainghat', bn: 'জাফলং / সিলেট', en: 'Jaflong / Sylhet' },
              { id: 'upz-teknaf', bn: 'সেন্টমার্টিন / টেকনাফ', en: 'St. Martin / Teknaf' }
            ].map((hub) => (
              <button
                key={hub.id}
                onClick={() => onNavigate('hotels', { upazilaId: hub.id })}
                className="px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-blue-600/80 backdrop-blur-sm border border-white/10 hover:border-blue-400 text-slate-200 hover:text-white transition-all shadow-xs"
              >
                {language === 'bn' ? hub.bn : hub.en}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 2. POPULAR DESTINATIONS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              {language === 'bn' ? 'আকর্ষণীয় ভ্রমণ স্থান' : 'Top Travel Hubs'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {t('popularDestinations')}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('hotels')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>{language === 'bn' ? 'সবগুলো গন্তব্য দেখুন' : 'Explore All Locations'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularDestinations.map((dest) => (
            <div
              key={dest.locationId}
              onClick={() => onNavigate('hotels', { upazilaId: dest.locationId })}
              className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-4/3 border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300"
            >
              <img
                src={dest.image}
                alt={dest.nameEn}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[11px] text-blue-300 font-medium block">
                  {language === 'bn' ? dest.tagBn : dest.tagEn}
                </span>
                <h3 className="text-lg font-bold">
                  {language === 'bn' ? dest.nameBn : dest.nameEn}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BUDGET-FRIENDLY STAYS (UNDER ৳1500) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              {language === 'bn' ? 'সাশ্রয়ী ভ্রমণ' : 'Low-Cost Discovery'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {t('budgetStays')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'bn'
                ? 'ছাত্র, ব্যাকপ্যাকার ও বাজেট ভ্রমণকারীদের উপযোগী যাচাইকৃত থাকার জায়গা।'
                : 'Verified affordable accommodations ideal for solo travelers, backpackers and students.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('hotels', { maxPrice: 1500 })}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>{language === 'bn' ? 'সকল বাজেট স্টে দেখুন' : 'View All Budget Stays'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-slate-100 rounded-xl h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {budgetStays.map(hotel => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onSelect={onSelectHotel}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. BROWSE BY BANGLADESH DIVISION */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
              {t('browseByDivision')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {language === 'bn'
                ? 'বাংলাদেশের ৮টি প্রশাসনিক বিভাগের সকল জেলা ও উপজেলার হোটেল অন্বেষণ করুন।'
                : 'Search budget stays across all 8 administrative divisions of Bangladesh.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {DIVISIONS.map(division => (
              <button
                key={division.id}
                onClick={() => onNavigate('hotels', { divisionId: division.id })}
                className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-600 hover:shadow-md transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {division.nameBn[0]}
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {language === 'bn' ? division.nameBn : division.nameEn}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {language === 'bn' ? `${division.nameEn} Division` : `${division.nameBn} বিভাগ`}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-blue-600">
                  <span>{language === 'bn' ? 'অন্বেষণ করুন' : 'Browse Stays'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. RECENTLY UPDATED STAYS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              {language === 'bn' ? 'তাজা তথ্য' : 'Verified Listings'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {t('recentlyUpdated')}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('hotels', { sortBy: 'recently_updated' })}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>{language === 'bn' ? 'সবগুলো দেখুন' : 'View All Stays'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentStays.map(hotel => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onSelect={onSelectHotel}
            />
          ))}
        </div>
      </section>

      {/* 6. HOW THAKBO WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
              {t('howItWorks')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {language === 'bn'
                ? 'থাকবো কোনো ভুয়া কমিশন বা হিডেন চার্জ রাখে না। এটি একটি সরাসরি উন্মুক্ত নির্দেশিকা।'
                : 'Thakbo does not charge commissions or booking fees. It connects travelers directly with local stays.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg mx-auto sm:mx-0">
                ১
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'bn' ? 'উপজেলা ও বাজেট অনুযায়ী খুঁজুন' : 'Search by Upazila & Budget'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {language === 'bn'
                  ? 'আপনার কাঙ্ক্ষিত ভ্রমণ উপজেলার নাম লিখে কিংবা সর্বোচ্চ বাজেট সেট করে তাৎক্ষণিক ফিল্টার করুন।'
                  : 'Enter your destination upazila or district, filter by AC/non-AC rooms and nightly budget in ৳ BDT.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg mx-auto sm:mx-0">
                ২
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'bn' ? 'সরাসরি যোগাযোগ করুন' : 'Contact Properties Directly'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {language === 'bn'
                  ? 'যাচাইকৃত ফোন নম্বরে কল করে সরাসরি বুকিং দিন। কোনো মধ্যস্বত্বভোগী বা হিডেন চার্জ নেই।'
                  : 'Call property managers directly using verified phone numbers. No middleman commissions or markup.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg mx-auto sm:mx-0">
                ৩
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'bn' ? 'কমিউনিটি ও অ্যাডমিন যাচাই' : 'Community Moderation'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {language === 'bn'
                  ? 'প্রতিটি নতুন প্রপার্টি সাবমিশন ও রিপোর্ট মডারেটর দ্বারা যাচাইয়ের পর মূল তালিকায় আপডেট করা হয়।'
                  : 'Every contributor submission and price report is reviewed by moderators before publication.'}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. COMMUNITY CONTRIBUTION CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-8 sm:p-12 relative overflow-hidden shadow-lg">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-md bg-white/20 text-white text-xs font-semibold uppercase tracking-wider inline-block">
              {language === 'bn' ? 'কমিউনিটি অবদান' : 'Community Powered'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {t('communityCtaHeading')}
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              {t('communityCtaDesc')}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('add-hotel')}
                className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('communityCtaBtn')}</span>
              </button>
              <button
                onClick={() => onNavigate('status')}
                className="px-6 py-3 bg-blue-800/80 hover:bg-blue-900 text-white text-xs sm:text-sm font-semibold rounded-xl border border-blue-400/30 transition-colors"
              >
                {t('navStatus')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TRUST AND LISTING POLICY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-3 max-w-2xl">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {t('trustPolicyTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('trustPolicyText')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('listing-policy')}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
          >
            {language === 'bn' ? 'নীতিমালা পড়ুন' : 'Read Policy'}
          </button>
        </div>
      </section>

    </div>
  );
};
