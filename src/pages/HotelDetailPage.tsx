import React, { useState, useEffect } from 'react';
import { Hotel } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getFacilityById } from '../data/facilities';
import { getSimilarHotels } from '../services/db';
import { ReportModal } from '../components/ReportModal';
import { HotelCard } from '../components/HotelCard';
import { 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft, 
  Share2, 
  ExternalLink,
  Users,
  Wind,
  Bath,
  CheckCircle2,
  Building,
  Check
} from 'lucide-react';

interface HotelDetailPageProps {
  hotel: Hotel;
  onBack: () => void;
  onSelectSimilar: (hotel: Hotel) => void;
}

export const HotelDetailPage: React.FC<HotelDetailPageProps> = ({ 
  hotel, 
  onBack, 
  onSelectSimilar 
}) => {
  const { language, t, formatPrice, formatDate } = useLanguage();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [similarHotels, setSimilarHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    async function loadSimilar() {
      const res = await getSimilarHotels(hotel.id, hotel.locationId, 3);
      setSimilarHotels(res);
    }
    loadSimilar();
  }, [hotel.id, hotel.locationId]);

  const handleCopyShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const coverPhoto = hotel.photos[selectedPhotoIndex] || hotel.photos[0];

  // Administrative hierarchy breadcrumbs
  const divisionName = language === 'bn' 
    ? (hotel.locationHierarchy?.division.nameBn || '') 
    : (hotel.locationHierarchy?.division.nameEn || '');
  const districtName = language === 'bn' 
    ? (hotel.locationHierarchy?.district.nameBn || '') 
    : (hotel.locationHierarchy?.district.nameEn || '');
  const upazilaName = language === 'bn' 
    ? (hotel.locationHierarchy?.upazila?.nameBn || '') 
    : (hotel.locationHierarchy?.upazila?.nameEn || '');

  // Room type labels
  const roomTypeMap: { [key: string]: { bn: string; en: string } } = {
    single: { bn: 'সিঙ্গেল বেড', en: 'Single Bed' },
    double: { bn: 'ডাবল বেড', en: 'Double Bed' },
    twin: { bn: 'টুইন বেড', en: 'Twin Bed' },
    family: { bn: 'ফ্যামিলি স্যুট', en: 'Family Suite' },
    dormitory: { bn: 'ডরমিটরি বাঙ্ক', en: 'Dormitory Bunk' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* 1. TOP BREADCRUMBS & ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ফিরে যান' : 'Back to Listings'}</span>
          </button>
          <span>/</span>
          <span>{divisionName}</span>
          <span>/</span>
          <span>{districtName}</span>
          {upazilaName && (
            <>
              <span>/</span>
              <span className="font-medium text-slate-800">{upazilaName}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedLink ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied!') : (language === 'bn' ? 'শেয়ার লিংক' : 'Share')}</span>
          </button>

          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 text-xs font-medium text-amber-800 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('reportListing')}</span>
          </button>
        </div>
      </div>

      {/* 2. DEMO WARNING BANNER IF DEMO PROPERTY */}
      {hotel.sourceType === 'demo' && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 flex items-start gap-3 text-xs text-blue-900">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">{t('demoListingBadge')}</span>
            <p className="text-blue-700">
              {language === 'bn'
                ? 'এটি প্ল্যাটফর্মের ফিচার প্রদর্শনের জন্য নির্মিত একটি ডেমো রেকর্ড। বাস্তব বুকিং বা যোগাযোগের জন্য ব্যবহৃত হবে না।'
                : 'This is an illustrative demo record for platform preview. Real phone calls should not be placed to demo phone numbers.'}
            </p>
          </div>
        </div>
      )}

      {/* 3. MAIN HEADER: TITLE, LOCATION, BASE PRICE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <span>{hotel.accommodationType.replace('_', ' ')}</span>
            <span>·</span>
            <span>{hotel.verificationStatus === 'community_verified' ? t('communityVerified') : t('fieldChecked')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {hotel.name}
          </h1>
          <p className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{hotel.address}</span>
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl sm:text-right shrink-0">
          <span className="text-xs text-slate-500 font-medium block">
            {t('startsFrom')}
          </span>
          <div className="flex items-baseline sm:justify-end gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-blue-600">
              {formatPrice(hotel.priceFrom)}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {t('perNight')}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            {t('lastPriceCheck')} {formatDate(hotel.priceCheckedAt)}
          </span>
        </div>
      </div>

      {/* 4. IMAGE GALLERY */}
      <div className="space-y-3">
        {/* Main Cover Display */}
        <div className="w-full aspect-16/9 sm:aspect-21/9 rounded-2xl overflow-hidden bg-slate-900 relative shadow-sm border border-slate-200">
          {coverPhoto ? (
            <img
              src={coverPhoto.storagePath}
              alt={hotel.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Building className="w-12 h-12" />
            </div>
          )}

          {coverPhoto?.caption && (
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-lg">
              {coverPhoto.caption}
            </div>
          )}
        </div>

        {/* Thumbnails if multiple photos */}
        {hotel.photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {hotel.photos.map((photo, idx) => (
              <button
                key={photo.id || idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  selectedPhotoIndex === idx ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={photo.storagePath} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. TWO-COLUMN SPLIT: LEFT DETAILS + RIGHT CONTACT & POLICIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (2 Cols): Description, Rooms Table, Facilities */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'bn' ? 'আবাসনের বিবরণ' : 'About this stay'}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {language === 'bn' ? hotel.descriptionBn : (hotel.descriptionEn || hotel.descriptionBn)}
            </p>
          </div>

          {/* Room Pricing & Availability Table */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {t('roomPricing')}
            </h2>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 bg-white">
              {hotel.rooms.map((room) => {
                const roomTypeLabel = roomTypeMap[room.roomType] 
                  ? roomTypeMap[room.roomType][language] 
                  : room.roomType;

                return (
                  <div key={room.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          {room.roomName}
                        </h3>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {roomTypeLabel}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{room.maxGuests} {language === 'bn' ? 'জন অতিথি' : 'Guests'}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Wind className="w-3.5 h-3.5 text-slate-400" />
                          <span>{room.airConditioned ? 'AC' : 'Non-AC'}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-slate-400" />
                          <span>{room.bathroomType === 'attached' ? (language === 'bn' ? 'সংযুক্ত বাথরুম' : 'Attached Bath') : (language === 'bn' ? 'শেয়ার্ড বাথরুম' : 'Shared Bath')}</span>
                        </span>
                      </div>

                      {room.availabilityNote && (
                        <p className="text-xs text-slate-500 italic">
                          "{room.availabilityNote}"
                        </p>
                      )}
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-blue-600">
                        {formatPrice(room.pricePerNight)}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {t('perNight')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Facilities & Amenities */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {t('amenities')}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {hotel.facilities.map((facId) => {
                const fac = getFacilityById(facId);
                if (!fac) return null;
                return (
                  <div
                    key={facId}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{language === 'bn' ? fac.labelBn : fac.labelEn}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* House Rules */}
          {hotel.houseRules && (
            <div className="space-y-3 p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                {t('houseRules')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {hotel.houseRules}
              </p>
            </div>
          )}

        </div>

        {/* Right Column (1 Col Sticky): Contact Card, Check-In/Out & Directions */}
        <div className="lg:col-span-1 space-y-6 sticky top-20">
          
          {/* Direct Contact Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-base">
              {language === 'bn' ? 'সরাসরি যোগাযোগ ও বুকিং' : 'Direct Booking Contact'}
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'bn'
                ? 'থাকবো কোনো কমিশন নেয় না। নিচের নম্বরে যোগাযোগ করে সরাসরি রুম বুক করুন।'
                : 'Thakbo does not take any commission. Call the property directly to check live room availability.'}
            </p>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                {t('callHotel')}
              </span>
              <a
                href={hotel.sourceType === 'demo' ? '#demo-alert' : `tel:${hotel.contactPhone}`}
                className="text-base sm:text-lg font-bold font-mono text-blue-900 hover:text-blue-700 flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-blue-600" />
                <span>{hotel.contactPhone}</span>
              </a>
              {hotel.sourceType === 'demo' && (
                <span className="text-[10px] text-blue-600 block">
                  ({language === 'bn' ? 'ডেমো নম্বর — কল করা যাবে না' : 'Demo record — no call'})
                </span>
              )}
            </div>

            {/* Check-In / Check-Out */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block mb-1">{t('checkIn')}</span>
                <span className="font-semibold text-slate-900 font-mono">{hotel.checkInTime || '12:00 PM'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block mb-1">{t('checkOut')}</span>
                <span className="font-semibold text-slate-900 font-mono">{hotel.checkOutTime || '11:00 AM'}</span>
              </div>
            </div>

            {/* Location & Directions Button */}
            {hotel.latitude && hotel.longitude && (
              <a
                href={`https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t('getDirections')}</span>
              </a>
            )}

            {/* Report Button */}
            <button
              onClick={() => setIsReportOpen(true)}
              className="w-full py-2 text-center text-xs text-slate-500 hover:text-amber-700 transition-colors"
            >
              {language === 'bn' ? 'তথ্য ভুল মনে হচ্ছে? রিপোর্ট করুন' : 'Information incorrect? Report here'}
            </button>
          </div>

        </div>

      </div>

      {/* 6. SIMILAR STAYS IN NEARBY UPAZILAS */}
      {similarHotels.length > 0 && (
        <section className="pt-12 border-t border-slate-200 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('similarStays')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarHotels.map((sim) => (
              <HotelCard
                key={sim.id}
                hotel={sim}
                onSelect={onSelectSimilar}
              />
            ))}
          </div>
        </section>
      )}

      {/* Report Modal */}
      <ReportModal
        hotelId={hotel.id}
        hotelName={hotel.name}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

    </div>
  );
};
