import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Hotel, AccommodationType, RoomType, BathroomType } from '../types';
import { getPublishedHotels } from '../services/db';
import { 
  DIVISIONS, 
  DISTRICTS, 
  UPAZILAS, 
  getDistrictsByDivision, 
  getUpazilasByDistrict, 
  getUpazilasByDivision,
  findLocationById, 
  findDistrictById, 
  findUpazilaById,
  POPULAR_TRAVEL_UPAZILAS 
} from '../data/locations';
import { ALL_FACILITIES } from '../data/facilities';
import { HotelCard } from '../components/HotelCard';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  MapPin, 
  Building2, 
  Check, 
  ArrowUpDown,
  Filter
} from 'lucide-react';

interface ExplorePageProps {
  initialParams?: any;
  onSelectHotel: (hotel: Hotel) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ 
  initialParams = {}, 
  onSelectHotel, 
  onNavigate 
}) => {
  const { language, t, formatPrice } = useLanguage();

  // Search & Filter State
  const [query, setQuery] = useState<string>(initialParams.query || '');
  const [divisionId, setDivisionId] = useState<string>(initialParams.divisionId || 'all');
  const [districtId, setDistrictId] = useState<string>(initialParams.districtId || 'all');
  const [upazilaId, setUpazilaId] = useState<string>(initialParams.upazilaId || 'all');
  const [minPrice, setMinPrice] = useState<number | undefined>(initialParams.minPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialParams.maxPrice);
  const [accommodationType, setAccommodationType] = useState<AccommodationType | 'all'>('all');
  const [roomType, setRoomType] = useState<RoomType | 'all'>('all');
  const [airConditioned, setAirConditioned] = useState<boolean | 'all'>('all');
  const [bathroomType, setBathroomType] = useState<BathroomType | 'all'>('all');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'recently_updated' | 'name_asc'>('recently_updated');

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Dependent location lists (always full access to 64 districts)
  const districts = divisionId !== 'all' ? getDistrictsByDivision(divisionId) : DISTRICTS;
  const upazilas = districtId !== 'all' 
    ? getUpazilasByDistrict(districtId) 
    : divisionId !== 'all'
      ? getUpazilasByDivision(divisionId)
      : UPAZILAS.filter(u => POPULAR_TRAVEL_UPAZILAS.includes(u.id));

  const handleDistrictChange = (disId: string) => {
    setDistrictId(disId);
    setUpazilaId('all');
    if (disId !== 'all') {
      const d = findDistrictById(disId);
      if (d?.parentId) {
        setDivisionId(d.parentId);
      }
    }
  };

  const handleUpazilaChange = (upzId: string) => {
    setUpazilaId(upzId);
    if (upzId !== 'all') {
      const u = findUpazilaById(upzId);
      if (u?.parentId) {
        setDistrictId(u.parentId);
        const d = findDistrictById(u.parentId);
        if (d?.parentId) {
          setDivisionId(d.parentId);
        }
      }
    }
  };

  const fetchHotels = async () => {
    setIsLoading(true);
    try {
      const res = await getPublishedHotels({
        query,
        divisionId,
        districtId,
        upazilaId,
        minPrice,
        maxPrice,
        accommodationType,
        roomType,
        airConditioned,
        bathroomType,
        facilityIds: selectedFacilities,
        sortBy,
      });
      setHotels(res.hotels);
      setTotalCount(res.total);
    } catch (e) {
      console.error('Error fetching hotels', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [
    query, 
    divisionId, 
    districtId, 
    upazilaId, 
    minPrice, 
    maxPrice, 
    accommodationType, 
    roomType, 
    airConditioned, 
    bathroomType, 
    selectedFacilities, 
    sortBy
  ]);

  const handleClearFilters = () => {
    setQuery('');
    setDivisionId('all');
    setDistrictId('all');
    setUpazilaId('all');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setAccommodationType('all');
    setRoomType('all');
    setAirConditioned('all');
    setBathroomType('all');
    setSelectedFacilities([]);
    setSortBy('recently_updated');
  };

  const toggleFacility = (id: string) => {
    if (selectedFacilities.includes(id)) {
      setSelectedFacilities(selectedFacilities.filter(f => f !== id));
    } else {
      setSelectedFacilities([...selectedFacilities, id]);
    }
  };

  // Accommodation type labels
  const accommodationOptions: { value: AccommodationType | 'all'; bn: string; en: string }[] = [
    { value: 'all', bn: 'সকল ধরন', en: 'All Types' },
    { value: 'hotel', bn: 'হোটেল', en: 'Hotel' },
    { value: 'guest_house', bn: 'গেস্ট হাউস', en: 'Guest House' },
    { value: 'eco_cottage', bn: 'ইকো কটেজ', en: 'Eco Cottage' },
    { value: 'resort', bn: 'রিসোর্ট', en: 'Resort' },
    { value: 'dormitory', bn: 'ডরমিটরি', en: 'Dormitory' },
    { value: 'rest_house', bn: 'রেস্ট হাউস', en: 'Rest House' },
  ];

  const activeLocationTitle = () => {
    if (upazilaId !== 'all') {
      const u = findLocationById(upazilaId);
      if (u) return language === 'bn' ? `${u.nameBn}-এর হোটেল` : `Stays in ${u.nameEn}`;
    }
    if (districtId !== 'all') {
      const d = findLocationById(districtId);
      if (d) return language === 'bn' ? `${d.nameBn} জেলার হোটেল` : `Stays in ${d.nameEn} District`;
    }
    if (divisionId !== 'all') {
      const div = findLocationById(divisionId);
      if (div) return language === 'bn' ? `${div.nameBn} বিভাগের হোটেল` : `Stays in ${div.nameEn} Division`;
    }
    return language === 'bn' ? 'সকল তালিকাভুক্ত আবাসন' : 'All Published Stays';
  };

  const FilterPanelContent = () => (
    <div className="space-y-6 text-xs sm:text-sm text-slate-700">
      
      {/* Header and Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>{t('filterHeading')}</span>
        </span>
        <button
          onClick={handleClearFilters}
          className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t('filterReset')}</span>
        </button>
      </div>

      {/* 1. Location Hierarchy */}
      <div className="space-y-2.5">
        <label className="font-semibold text-slate-900 block text-xs uppercase tracking-wider">
          {language === 'bn' ? 'প্রশাসনিক এলাকা' : 'Location Hierarchy'}
        </label>
        
        {/* Division */}
        <select
          value={divisionId}
          onChange={(e) => {
            setDivisionId(e.target.value);
            setDistrictId('all');
            setUpazilaId('all');
          }}
          className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
        >
          <option value="all">{t('allDivisions')}</option>
          {DIVISIONS.map(d => (
            <option key={d.id} value={d.id}>
              {language === 'bn' ? d.nameBn : d.nameEn}
            </option>
          ))}
        </select>

        {/* District (All 64 districts selectable) */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>{language === 'bn' ? 'জেলা' : 'District'}</span>
            <span className="text-blue-600 font-medium">
              {divisionId === 'all' 
                ? (language === 'bn' ? '৬৪ জেলা' : 'All 64') 
                : (language === 'bn' ? `${districts.length}টি জেলা` : `${districts.length} districts`)}
            </span>
          </div>
          <select
            value={districtId}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">
              {divisionId === 'all' 
                ? (language === 'bn' ? 'সকল জেলা (৬৪টি জেলা)' : 'All Districts (64)') 
                : t('allDistricts')}
            </option>
            {divisionId === 'all' ? (
              DIVISIONS.map(div => {
                const divDistricts = DISTRICTS.filter(d => d.parentId === div.id);
                return (
                  <optgroup 
                    key={div.id} 
                    label={`${language === 'bn' ? div.nameBn : div.nameEn} ${language === 'bn' ? 'বিভাগ' : 'Division'}`}
                  >
                    {divDistricts.map(d => (
                      <option key={d.id} value={d.id}>
                        {language === 'bn' ? d.nameBn : d.nameEn}
                      </option>
                    ))}
                  </optgroup>
                );
              })
            ) : (
              districts.map(d => (
                <option key={d.id} value={d.id}>
                  {language === 'bn' ? d.nameBn : d.nameEn}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Upazila */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>{language === 'bn' ? 'উপজেলা' : 'Upazila'}</span>
            <span className="text-blue-600 font-medium">
              {districtId !== 'all' 
                ? `${upazilas.length}টি` 
                : (language === 'bn' ? 'সকল' : 'All')}
            </span>
          </div>
          <select
            value={upazilaId}
            onChange={(e) => handleUpazilaChange(e.target.value)}
            className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">
              {districtId === 'all' 
                ? (language === 'bn' ? 'সকল উপজেলা / পর্যটন এলাকা' : 'All Upazilas / Spots') 
                : t('allUpazilas')}
            </option>
            {districtId === 'all' ? (
              <>
                <optgroup label={language === 'bn' ? 'শীর্ষ পর্যটন গন্তব্য' : 'Top Travel Destinations'}>
                  {UPAZILAS.filter(u => POPULAR_TRAVEL_UPAZILAS.includes(u.id)).map(u => (
                    <option key={u.id} value={u.id}>
                      ⭐ {language === 'bn' ? u.nameBn : u.nameEn}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={language === 'bn' ? 'অন্যান্য উপজেলা' : 'Other Upazilas'}>
                  {UPAZILAS.slice(0, 60).map(u => (
                    <option key={u.id} value={u.id}>
                      {language === 'bn' ? u.nameBn : u.nameEn}
                    </option>
                  ))}
                </optgroup>
              </>
            ) : (
              upazilas.map(u => (
                <option key={u.id} value={u.id}>
                  {language === 'bn' ? u.nameBn : u.nameEn}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* 2. Nightly Budget in BDT */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="font-semibold text-slate-900 block text-xs uppercase tracking-wider">
          {language === 'bn' ? 'বাজেট সীমা (প্রতি রাত ৳)' : 'Budget Per Night (৳)'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={language === 'bn' ? 'সর্বনিম্ন ৳' : 'Min ৳'}
            value={minPrice ?? ''}
            onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <input
            type="number"
            placeholder={language === 'bn' ? 'সর্বোচ্চ ৳' : 'Max ৳'}
            value={maxPrice ?? ''}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* 3. Accommodation Type */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="font-semibold text-slate-900 block text-xs uppercase tracking-wider">
          {t('filterAccommodationType')}
        </label>
        <div className="space-y-1">
          {accommodationOptions.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-xs py-0.5">
              <input
                type="radio"
                name="accType"
                checked={accommodationType === opt.value}
                onChange={() => setAccommodationType(opt.value)}
                className="text-blue-600 focus:ring-blue-500 rounded"
              />
              <span className={accommodationType === opt.value ? 'font-semibold text-blue-600' : 'text-slate-600'}>
                {language === 'bn' ? opt.bn : opt.en}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 4. AC / Non-AC */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="font-semibold text-slate-900 block text-xs uppercase tracking-wider">
          {t('filterAc')}
        </label>
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setAirConditioned('all')}
            className={`py-1 text-center rounded-md font-medium transition-colors ${airConditioned === 'all' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'}`}
          >
            {language === 'bn' ? 'সব' : 'All'}
          </button>
          <button
            onClick={() => setAirConditioned(true)}
            className={`py-1 text-center rounded-md font-medium transition-colors ${airConditioned === true ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'}`}
          >
            AC
          </button>
          <button
            onClick={() => setAirConditioned(false)}
            className={`py-1 text-center rounded-md font-medium transition-colors ${airConditioned === false ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'}`}
          >
            Non-AC
          </button>
        </div>
      </div>

      {/* 5. Bathroom Type */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="font-semibold text-slate-900 block text-xs uppercase tracking-wider">
          {t('filterBathroom')}
        </label>
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setBathroomType('all')}
            className={`py-1 text-center rounded-md font-medium transition-colors ${bathroomType === 'all' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'}`}
          >
            {language === 'bn' ? 'সব' : 'All'}
          </button>
          <button
            onClick={() => setBathroomType('attached')}
            className={`py-1 text-center rounded-md font-medium transition-colors ${bathroomType === 'attached' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'}`}
          >
            {language === 'bn' ? 'সংযুক্ত' : 'Attached'}
          </button>
          <button
            onClick={() => setBathroomType('shared')}
            className={`py-1 text-center rounded-md font-medium transition-colors ${bathroomType === 'shared' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'}`}
          >
            {language === 'bn' ? 'শেয়ার্ড' : 'Shared'}
          </button>
        </div>
      </div>

      {/* 6. Facilities Checkboxes */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="font-semibold text-slate-900 block text-xs uppercase tracking-wider">
          {t('filterFacilities')}
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {ALL_FACILITIES.map(fac => {
            const isChecked = selectedFacilities.includes(fac.id);
            return (
              <label key={fac.id} className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleFacility(fac.id)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className={isChecked ? 'font-medium text-slate-900' : 'text-slate-600'}>
                  {language === 'bn' ? fac.labelBn : fac.labelEn}
                </span>
              </label>
            );
          })}
        </div>
      </div>

    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner / Breadcrumb & Search Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {activeLocationTitle()}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'bn' 
              ? `মোট ${hotels.length}টি সাশ্রয়ী থাকার ব্যবস্থা পাওয়া গেছে`
              : `Found ${hotels.length} affordable places to stay`}
          </p>
        </div>

        {/* Live Text Search Box */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t('filterHeading')}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left Sidebar Filters + Right Hotel Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Left Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-xs sticky top-20">
          <FilterPanelContent />
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Active Filter Chips & Sorting Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Sorting Select */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-slate-500 font-medium">{t('filterSortBy')}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="recently_updated">{t('sortRecentlyUpdated')}</option>
                <option value="price_asc">{t('sortPriceAsc')}</option>
                <option value="price_desc">{t('sortPriceDesc')}</option>
                <option value="name_asc">{t('sortNameAsc')}</option>
              </select>
            </div>
          </div>

          {/* Results Grid / Loading / Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-slate-100 rounded-xl h-80 border border-slate-200" />
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div className="py-16 px-6 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {language === 'bn' ? 'কোনো থাকার জায়গা পাওয়া যায়নি' : 'No Accommodations Found'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                {language === 'bn'
                  ? 'আপনার ফিল্টারের সাথে মিলে এমন কোনো হোটেল খুঁজে পাওয়া যায়নি। ফিল্টার রিসেট করুন অথবা এই এলাকার নতুন কোনো হোটেল থাকলে যোগ করুন।'
                  : 'No stays match your active filter criteria. Try clearing filters or submit a stay if you know one here.'}
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  {t('filterReset')}
                </button>
                <button
                  onClick={() => onNavigate('add-hotel')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {language === 'bn' ? 'নতুন হোটেল যোগ করুন' : 'Suggest a Stay'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {hotels.map(hotel => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onSelect={onSelectHotel}
                />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Mobile Filter Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white ml-auto h-full p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">{t('filterHeading')}</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanelContent />
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg"
              >
                {language === 'bn' ? 'ফলাফল দেখুন' : 'Apply Filters'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
