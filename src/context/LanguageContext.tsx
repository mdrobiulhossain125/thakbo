import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

interface Translations {
  [key: string]: {
    bn: string;
    en: string;
  };
}

export const TRANSLATIONS: Translations = {
  // Navigation
  appName: { bn: 'থাকবো', en: 'Thakbo' },
  appTagline: { bn: 'ঘুরতে বের হোন, থাকার চিন্তা কমান।', en: 'Find affordable stays across Bangladesh.' },
  navExplore: { bn: 'হোটেল খুঁজুন', en: 'Explore Stays' },
  navAddStay: { bn: 'হোটেল যুক্ত করুন', en: 'Add a Stay' },
  navAbout: { bn: 'আমাদের সম্পর্কে', en: 'About' },
  navStatus: { bn: 'আবেদনের স্ট্যাটাস', en: 'Submission Status' },
  navAdmin: { bn: 'অ্যাডমিন ড্যাশবোর্ড', en: 'Admin Portal' },

  // Hero
  heroHeading: { bn: 'ঘুরতে যান। থাকার জায়গা খুঁজে নিন সহজেই।', en: 'Travel Bangladesh. Find affordable stays with ease.' },
  heroSubtitle: { bn: 'বাংলাদেশের বিভিন্ন বিভাগ, জেলা ও উপজেলার সাশ্রয়ী থাকার জায়গা খুঁজুন এক প্ল্যাটফর্মে। সরাসরি যাচাইকৃত তথ্য ও কমিউনিটি অবদান।', en: 'Discover budget-friendly hotels, cottages, and guest houses across divisions, districts, and upazilas in Bangladesh.' },
  searchPlaceholder: { bn: 'হোটেলের নাম বা ঠিকানা লিখুন...', en: 'Search hotel name or address...' },
  allDivisions: { bn: 'সকল বিভাগ', en: 'All Divisions' },
  allDistricts: { bn: 'সকল জেলা', en: 'All Districts' },
  allUpazilas: { bn: 'সকল উপজেলা', en: 'All Upazilas' },
  budgetAny: { bn: 'যেকোনো বাজেট', en: 'Any Budget' },
  budgetUnder1000: { bn: '৳১,০০০ এর নিচে', en: 'Under ৳1,000' },
  budget1000to2000: { bn: '৳১,০০০ – ৳২,০০০', en: '৳1,000 – ৳2,000' },
  budget2000plus: { bn: '৳২,০০০ এর উপরে', en: '৳2,000+' },
  searchButton: { bn: 'খুঁজুন', en: 'Search Stays' },

  // Sections
  popularDestinations: { bn: 'জনপ্রিয় গন্তব্যসমূহ', en: 'Popular Destinations' },
  budgetStays: { bn: 'সাশ্রয়ী মূল্যের থাকার জায়গা', en: 'Budget-Friendly Stays' },
  browseByDivision: { bn: 'বিভাগ অনুযায়ী খুঁজুন', en: 'Browse by Division' },
  recentlyUpdated: { bn: 'সম্প্রতি তথ্য হালনাগাদ করা স্টুডিও ও হোটেল', en: 'Recently Updated Stays' },
  howItWorks: { bn: 'থাকবো যেভাবে কাজ করে', en: 'How Thakbo Works' },
  communityCtaHeading: { bn: 'আপনার এলাকার সাশ্রয়ী হোটেল জানেন?', en: 'Know an affordable stay in your area?' },
  communityCtaDesc: { bn: 'স্থানীয় ট্রাভেলারদের সাহায্য করতে নতুন হোটেল যোগ করুন। প্রতিটি তালিকা অ্যাডমিন দ্বারা যাচাইয়ের পর প্রকাশিত হয়।', en: 'Help local travelers by contributing new stays. Every submission is reviewed by moderators before publication.' },
  communityCtaBtn: { bn: 'নতুন হোটেল যোগ করুন', en: 'Contribute a Stay' },

  // Filters
  filterHeading: { bn: 'ফিল্টারসমূহ', en: 'Filters' },
  filterReset: { bn: 'রিসেট করুন', en: 'Clear Filters' },
  filterAccommodationType: { bn: 'আবাসনের ধরন', en: 'Accommodation Type' },
  filterRoomType: { bn: 'রুমের ধরন', en: 'Room Type' },
  filterAc: { bn: 'এসি / নন-এসি', en: 'AC / Non-AC' },
  filterBathroom: { bn: 'বাথরুমের ধরন', en: 'Bathroom Type' },
  filterFacilities: { bn: 'সুবিধাসমূহ', en: 'Facilities' },
  filterSortBy: { bn: 'সাজান', en: 'Sort By' },
  sortPriceAsc: { bn: 'কম মূল্য থেকে বেশি', en: 'Price: Low to High' },
  sortPriceDesc: { bn: 'বেশি মূল্য থেকে কম', en: 'Price: High to Low' },
  sortRecentlyUpdated: { bn: 'সম্প্রতি হালনাগাদ', en: 'Recently Updated' },
  sortNameAsc: { bn: 'নামের ক্রমানুসারে', en: 'Name: A to Z' },

  // Badges & Statuses
  demoListingBadge: { bn: 'ডেমো তালিকা — বাস্তব প্রপার্টি নয়', en: 'Demo listing — not a real property' },
  communityVerified: { bn: 'কমিউনিটি যাচাইকৃত', en: 'Community Verified' },
  fieldChecked: { bn: 'মাঠপর্যায়ে পরীক্ষিত', en: 'Field Checked' },
  ownerVerified: { bn: 'মালিক কর্তৃক যাচাইকৃত', en: 'Owner Verified' },
  perNight: { bn: '/ রাত', en: '/ night' },
  startsFrom: { bn: 'শুরু', en: 'From' },
  viewDetails: { bn: 'বিস্তারিত দেখুন', en: 'View Details' },
  lastPriceCheck: { bn: 'মূল্য যাচাইয়ের তারিখ:', en: 'Price last verified:' },

  // Hotel Details
  callHotel: { bn: 'যোগাযোগের নম্বর', en: 'Contact Phone' },
  getDirections: { bn: 'ম্যাপে অবস্থান', en: 'View on Map' },
  reportListing: { bn: 'ভুল তথ্য রিপোর্ট করুন', en: 'Report Incorrect Info' },
  roomPricing: { bn: 'রুমের ধরন ও ভাড়ার তালিকা', en: 'Room Types & Rates' },
  amenities: { bn: 'সুবিধাসমূহ', en: 'Facilities & Amenities' },
  houseRules: { bn: 'হোটেলের নিয়মাবলী', en: 'House Rules' },
  checkIn: { bn: 'চেক-ইন সময়', en: 'Check-in Time' },
  checkOut: { bn: 'চেক-আউট সময়', en: 'Check-out Time' },
  similarStays: { bn: 'কাছাকাছি আরও থাকার জায়গা', en: 'Similar Stays Nearby' },

  // Footer & Trust
  trustPolicyTitle: { bn: 'আমাদের সততা ও লিস্টিং নীতিমালা', en: 'Trust & Listing Policy' },
  trustPolicyText: { bn: 'থাকবো কোনো ভুয়া রেটিং, অবাস্তব ডিসকাউন্ট বা কৃত্রিম রিভিউ প্রদর্শন করে না। আমাদের প্রতিটি ডেটা ট্রাভেলার ও স্থানীয় অবদানের ভিত্তিতে অ্যাডমিন পর্যালোচনার পর সংরক্ষিত হয়।', en: 'Thakbo does not display fabricated ratings or artificial reviews. All listings are community-powered and curated through verified administrative review.' },
  footerTagline: { bn: 'বাংলাদেশ ভ্রমণ সহজ ও সাশ্রয়ী করার উন্মুক্ত প্ল্যাটফর্ম।', en: 'Open platform making travel in Bangladesh simple and affordable.' },
  allRightsReserved: { bn: 'সর্বস্বত্ব সংরক্ষিত।', en: 'All rights reserved.' },
  privacyPolicy: { bn: 'গোপনীয়তা নীতি', en: 'Privacy Policy' },
  termsOfUse: { bn: 'ব্যবহারের শর্তাবলী', en: 'Terms of Use' },
  listingPolicy: { bn: 'তালিকাভুক্তি নীতি', en: 'Listing Policy' },
  contactUs: { bn: 'যোগাযোগ', en: 'Contact Us' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatPrice: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Bengali digit conversion
const enToBnDigits = (str: string): string => {
  const map: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return str.replace(/[0-9]/g, match => map[match] || match);
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('thakbo_lang') as Language;
      if (saved === 'en' || saved === 'bn') return saved;
    }
    return 'bn'; // Default to Bengali as specified in brief
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('thakbo_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  const formatPrice = (amount: number): string => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return language === 'bn' ? 'মূল্য নিশ্চিত নয়' : 'Price unconfirmed';
    }
    const formattedNum = new Intl.NumberFormat('en-IN').format(amount);
    if (language === 'bn') {
      return `৳${enToBnDigits(formattedNum)}`;
    }
    return `৳${formattedNum}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      
      if (language === 'bn') {
        const enDate = date.toLocaleDateString('en-GB', options);
        return enToBnDigits(enDate);
      }
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatPrice, formatDate }}>
      <div className={language === 'bn' ? 'font-bn' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
