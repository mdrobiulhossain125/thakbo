import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Globe, Shield, PlusCircle, Compass, FileText, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenSupabaseModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenSupabaseModal }) => {
  const { language, setLanguage, t } = useLanguage();
  const { isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const navItems = [
    { id: 'home', label: language === 'bn' ? 'হোম' : 'Home' },
    { id: 'hotels', label: t('navExplore') },
    { id: 'add-hotel', label: t('navAddStay') },
    { id: 'status', label: t('navStatus') },
    { id: 'about', label: t('navAbout') },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strict Top Bar Contract: Zone 1 (Brand) — Zone 2 (4-5 Nav Links) — Zone 3 (Primary Action / Switches) */}
        <div className="flex items-center justify-between h-16 gap-8">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:bg-blue-700 transition-colors">
                থ
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  {language === 'bn' ? 'থাকবো' : 'Thakbo'}
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500">
                  {language === 'bn' ? 'বাজেট আবাসন' : 'Budget Stays'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-5 single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`whitespace-nowrap transition-colors relative py-1 ${
                    isActive 
                      ? 'text-blue-600 font-semibold' 
                      : 'hover:text-slate-900 text-slate-600'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action & Language Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold">{language === 'bn' ? 'EN' : 'বাংলা'}</span>
            </button>

            {/* Add Stay Quick CTA */}
            <button
              onClick={() => handleNavClick('add-hotel')}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('navAddStay')}</span>
            </button>

            {/* Admin Portal Button - Only visible when already logged in as administrator */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 transition-colors"
                title="Admin Dashboard"
              >
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">{language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
              </button>
            )}

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.id
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => handleNavClick('add-hotel')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('navAddStay')}</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg"
              >
                <Shield className="w-4 h-4 text-blue-600" />
                <span>{language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
