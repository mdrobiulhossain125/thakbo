import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { HotelDetailPage } from './pages/HotelDetailPage';
import { AddHotelPage } from './pages/AddHotelPage';
import { SubmissionStatusPage } from './pages/SubmissionStatusPage';
import { AdminPage } from './pages/AdminPage';
import { StaticPage } from './pages/StaticPages';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { Hotel } from './types';

function MainApp() {
  const { language } = useLanguage();
  const [currentView, setCurrentView] = useState<string>('home');
  const [navParams, setNavParams] = useState<any>({});
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Sync window URL hash for browser history / direct linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (hash.startsWith('hotel/')) {
        // Will be handled if hotel is loaded or falls back to hotels
      } else if (['home', 'hotels', 'add-hotel', 'status', 'admin', 'about', 'privacy', 'terms', 'listing-policy', 'contact'].includes(hash)) {
        setCurrentView(hash);
      }
    };

    // Keyboard shortcut for owner: Alt+A or Ctrl+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setCurrentView('admin');
        window.location.hash = 'admin';
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavigate = (view: string, params: any = {}) => {
    setCurrentView(view);
    setNavParams(params);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setCurrentView('hotel-detail');
    window.location.hash = `hotel/${hotel.slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setCurrentView('hotels');
    window.location.hash = 'hotels';
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Universal Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Content Router */}
      <div className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectHotel={handleSelectHotel}
          />
        )}

        {currentView === 'hotels' && (
          <ExplorePage
            key={JSON.stringify(navParams)}
            initialParams={navParams}
            onSelectHotel={handleSelectHotel}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'hotel-detail' && selectedHotel && (
          <HotelDetailPage
            hotel={selectedHotel}
            onBack={handleBackFromDetail}
            onSelectSimilar={handleSelectHotel}
          />
        )}

        {currentView === 'add-hotel' && (
          <AddHotelPage onNavigate={handleNavigate} />
        )}

        {currentView === 'status' && (
          <SubmissionStatusPage
            initialRef={navParams?.ref || ''}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'admin' && (
          <AdminPage
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          />
        )}

        {['about', 'privacy', 'terms', 'listing-policy', 'contact'].includes(currentView) && (
          <StaticPage
            page={currentView as any}
            onNavigate={handleNavigate}
          />
        )}
      </div>

      {/* Universal Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Database Setup & Architecture Modal */}
      <SupabaseSetupModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
