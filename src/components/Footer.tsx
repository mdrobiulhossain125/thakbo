import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, ShieldCheck, Heart, Database, AlertCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenSupabaseModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenSupabaseModal }) => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                থ
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                {language === 'bn' ? 'থাকবো' : 'Thakbo'}
              </span>
            </div>
            
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {language === 'bn' 
                ? 'বাংলাদেশের বিভিন্ন উপজেলা ও জেলা পর্যায়ের সাশ্রয়ী ও পরিচ্ছন্ন থাকার জায়গা সহজে খুঁজে নেওয়ার উন্মুক্ত কমিউনিটি প্ল্যাটফর্ম।' 
                : 'An open, community-powered discovery platform to find budget-friendly, verified stays across all upazilas and districts in Bangladesh.'}
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{language === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}</span>
              </span>
              <span>·</span>
              <span className="font-mono text-slate-300">BDT (৳)</span>
              <span>·</span>
              <span>Asia/Dhaka</span>
            </div>
          </div>

          {/* Stays & Discovery */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              {language === 'bn' ? 'আবাসন ও অন্বেষণ' : 'Discovery'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('hotels')} className="hover:text-white transition-colors text-slate-400">
                  {t('navExplore')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('add-hotel')} className="hover:text-white transition-colors text-slate-400">
                  {t('navAddStay')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('status')} className="hover:text-white transition-colors text-slate-400">
                  {t('navStatus')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors text-slate-400">
                  {t('navAbout')}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              {language === 'bn' ? 'নীতিমালা ও বিশ্বাস' : 'Policy & Trust'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('listing-policy')} className="hover:text-white transition-colors text-slate-400">
                  {t('listingPolicy')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors text-slate-400">
                  {t('privacyPolicy')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors text-slate-400">
                  {t('termsOfUse')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors text-slate-400">
                  {t('contactUs')}
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Architecture & Supabase Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              {language === 'bn' ? 'সিস্টেম ও ডেটাবেস' : 'Architecture'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'bn'
                ? 'পোস্টগ্রেস এসকিউএল স্কিমা ও রো-লেভেল সিকিউরিটি (RLS) সমর্থিত স্থাপত্য।'
                : 'Built with Supabase PostgreSQL schema, RLS policies, and server authorization.'}
            </p>
            <div className="flex flex-col gap-2 pt-1">
              {onOpenSupabaseModal && (
                <button
                  onClick={onOpenSupabaseModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition-colors w-fit"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সুপাবেস ডেটাবেস স্কিমা' : 'Supabase SQL & Schema'}</span>
                </button>
              )}
              <button
                onClick={() => onNavigate('admin')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors w-fit"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>{language === 'bn' ? 'মডারেটর ও ওনার লগইন' : 'Admin & Moderator Login'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>© 2026 {language === 'bn' ? 'থাকবো' : 'Thakbo'}. {t('allRightsReserved')}</span>
            <button 
              onClick={() => onNavigate('admin')}
              className="text-slate-400 hover:text-white transition-colors underline ml-2"
              title="Restricted Staff Entry"
            >
              {language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Console'}
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>{language === 'bn' ? 'নো-হিডেন চার্জ' : 'No Hidden Fees'}</span>
            <span>·</span>
            <span>{language === 'bn' ? 'কমিউনিটি চালিত' : 'Community Powered'}</span>
            <span>·</span>
            <span>{language === 'bn' ? 'যাচাইকৃত আবাসন' : 'Verified Directory'}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
