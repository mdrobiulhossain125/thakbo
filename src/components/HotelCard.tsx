import React, { useState } from 'react';
import { Hotel } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getFacilityById } from '../data/facilities';
import { MapPin, Calendar, ArrowRight, Bed, AlertCircle, Building2 } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
  onSelect: (hotel: Hotel) => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, onSelect }) => {
  const { language, formatPrice, formatDate, t } = useLanguage();
  const [imageFailed, setImageFailed] = useState(false);

  const coverPhoto = hotel.photos.find(p => p.isCover) || hotel.photos[0];
  const photoUrl = coverPhoto ? coverPhoto.storagePath : null;

  // Location display
  const districtName = language === 'bn' 
    ? (hotel.locationHierarchy?.district.nameBn || '') 
    : (hotel.locationHierarchy?.district.nameEn || '');
  const upazilaName = language === 'bn' 
    ? (hotel.locationHierarchy?.upazila?.nameBn || '') 
    : (hotel.locationHierarchy?.upazila?.nameEn || '');

  const locationText = upazilaName 
    ? `${upazilaName}, ${districtName}` 
    : districtName || hotel.address;

  // Accommodation type translation
  const typeMap: { [key: string]: { bn: string; en: string } } = {
    hotel: { bn: 'হোটেল', en: 'Hotel' },
    guest_house: { bn: 'গেস্ট হাউস', en: 'Guest House' },
    resort: { bn: 'রিসোর্ট', en: 'Resort' },
    dormitory: { bn: 'ডরমিটরি', en: 'Dormitory' },
    rest_house: { bn: 'রেস্ট হাউস', en: 'Rest House' },
    eco_cottage: { bn: 'ইকো কটেজ', en: 'Eco Cottage' },
  };

  const typeLabel = typeMap[hotel.accommodationType] 
    ? typeMap[hotel.accommodationType][language] 
    : hotel.accommodationType;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col h-full">
      
      {/* Visual Anchor: 4:3 Image container with fallback */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        {photoUrl && !imageFailed ? (
          <img
            src={photoUrl}
            alt={hotel.name}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
            <Building2 className="w-8 h-8 mb-2 text-slate-300" />
            <span className="text-xs font-medium text-slate-500">{hotel.name}</span>
          </div>
        )}

        {/* Demo listing warning overlay if source is demo */}
        {hotel.sourceType === 'demo' && (
          <div className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md font-medium tracking-tight">
            {t('demoListingBadge')}
          </div>
        )}

        {/* Accommodation Type Tag */}
        <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
          {typeLabel}
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        
        {/* Zero-Pill Location Metadata: Clean unboxed text with typographic separator */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">{locationText}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="capitalize">{hotel.rooms.length} {language === 'bn' ? 'ধরনের রুম' : 'room types'}</span>
        </div>

        {/* Hotel Name */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
          {hotel.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed flex-1">
          {language === 'bn' ? hotel.descriptionBn : (hotel.descriptionEn || hotel.descriptionBn)}
        </p>

        {/* Key Facilities: Clean unboxed inline list */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mb-4 pt-2 border-t border-slate-100">
          {hotel.facilities.slice(0, 3).map(facId => {
            const fac = getFacilityById(facId);
            if (!fac) return null;
            return (
              <span key={facId} className="inline-flex items-center gap-1">
                <span>•</span>
                <span>{language === 'bn' ? fac.labelBn : fac.labelEn}</span>
              </span>
            );
          })}
          {hotel.facilities.length > 3 && (
            <span className="text-slate-400">
              +{hotel.facilities.length - 3} {language === 'bn' ? 'আরও' : 'more'}
            </span>
          )}
        </div>

        {/* Pricing and Action row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">
              {t('startsFrom')}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-blue-600">
                {formatPrice(hotel.priceFrom)}
              </span>
              <span className="text-xs text-slate-500">
                {t('perNight')}
              </span>
            </div>
          </div>

          <button
            onClick={() => onSelect(hotel)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
          >
            <span>{t('viewDetails')}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Verified Date metadata */}
        <div className="mt-2.5 pt-1.5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{t('lastPriceCheck')} {formatDate(hotel.priceCheckedAt)}</span>
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-tight">
            {hotel.verificationStatus === 'community_verified' ? t('communityVerified') : t('fieldChecked')}
          </span>
        </div>

      </div>

    </div>
  );
};
