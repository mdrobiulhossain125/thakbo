import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  DIVISIONS, 
  DISTRICTS, 
  UPAZILAS,
  getDistrictsByDivision, 
  getUpazilasByDistrict, 
  getUpazilasByDivision,
  findDistrictById, 
  findUpazilaById,
  POPULAR_TRAVEL_UPAZILAS 
} from '../data/locations';
import { Search, MapPin, DollarSign, ArrowRight, Compass } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  initialDivisionId?: string;
  initialDistrictId?: string;
  initialUpazilaId?: string;
  initialBudgetPreset?: string;
  onSearch: (params: {
    query: string;
    divisionId: string;
    districtId: string;
    upazilaId: string;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
  variant?: 'hero' | 'compact';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  initialDivisionId = 'all',
  initialDistrictId = 'all',
  initialUpazilaId = 'all',
  initialBudgetPreset = 'any',
  onSearch,
  variant = 'hero'
}) => {
  const { language, t } = useLanguage();

  const [query, setQuery] = useState(initialQuery);
  const [selectedDivision, setSelectedDivision] = useState(initialDivisionId);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrictId);
  const [selectedUpazila, setSelectedUpazila] = useState(initialUpazilaId);
  const [budgetPreset, setBudgetPreset] = useState(initialBudgetPreset);

  // When division is selected, show its districts; otherwise show all 64 districts
  const availableDistricts = selectedDivision !== 'all' 
    ? getDistrictsByDivision(selectedDivision) 
    : DISTRICTS;

  // Upazilas based on selection hierarchy
  const availableUpazilas = selectedDistrict !== 'all'
    ? getUpazilasByDistrict(selectedDistrict)
    : selectedDivision !== 'all'
      ? getUpazilasByDivision(selectedDivision)
      : UPAZILAS.filter(u => POPULAR_TRAVEL_UPAZILAS.includes(u.id));

  // When division changes
  const handleDivisionChange = (divId: string) => {
    setSelectedDivision(divId);
    if (divId !== 'all') {
      // If currently selected district is not in this division, reset
      if (selectedDistrict !== 'all') {
        const d = findDistrictById(selectedDistrict);
        if (d?.parentId !== divId) {
          setSelectedDistrict('all');
          setSelectedUpazila('all');
        }
      }
    }
  };

  // When district changes
  const handleDistrictChange = (disId: string) => {
    setSelectedDistrict(disId);
    setSelectedUpazila('all');
    if (disId !== 'all') {
      const d = findDistrictById(disId);
      if (d?.parentId) {
        setSelectedDivision(d.parentId);
      }
    }
  };

  // When upazila changes
  const handleUpazilaChange = (upzId: string) => {
    setSelectedUpazila(upzId);
    if (upzId !== 'all') {
      const u = findUpazilaById(upzId);
      if (u?.parentId) {
        setSelectedDistrict(u.parentId);
        const d = findDistrictById(u.parentId);
        if (d?.parentId) {
          setSelectedDivision(d.parentId);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (budgetPreset === 'under1000') {
      maxPrice = 1000;
    } else if (budgetPreset === '1000to2000') {
      minPrice = 1000;
      maxPrice = 2000;
    } else if (budgetPreset === '2000plus') {
      minPrice = 2000;
    }

    onSearch({
      query,
      divisionId: selectedDivision,
      districtId: selectedDistrict,
      upazilaId: selectedUpazila,
      minPrice,
      maxPrice
    });
  };

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Division Selector */}
        <select
          value={selectedDivision}
          onChange={(e) => handleDivisionChange(e.target.value)}
          className="text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="all">{t('allDivisions')}</option>
          {DIVISIONS.map(d => (
            <option key={d.id} value={d.id}>
              {language === 'bn' ? d.nameBn : d.nameEn}
            </option>
          ))}
        </select>

        {/* District Selector (All 64 districts available) */}
        <select
          value={selectedDistrict}
          onChange={(e) => handleDistrictChange(e.target.value)}
          className="text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium max-w-[150px]"
        >
          <option value="all">{t('allDistricts')} (৬৪ জেলা)</option>
          {selectedDivision === 'all' ? (
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
            availableDistricts.map(d => (
              <option key={d.id} value={d.id}>
                {language === 'bn' ? d.nameBn : d.nameEn}
              </option>
            ))
          )}
        </select>

        {/* Budget Preset */}
        <select
          value={budgetPreset}
          onChange={(e) => setBudgetPreset(e.target.value)}
          className="text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="any">{t('budgetAny')}</option>
          <option value="under1000">{t('budgetUnder1000')}</option>
          <option value="1000to2000">{t('budget1000to2000')}</option>
          <option value="2000plus">{t('budget2000plus')}</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{t('searchButton')}</span>
        </button>
      </form>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl p-4 sm:p-6 transition-all ring-1 ring-slate-900/5">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Main query input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'bn' ? 'হোটেল, কটেজ বা এলাকার নাম লিখুন (যেমন: সুগন্ধা বিচ, কলাতলী, রাতারগুল...)' : t('searchPlaceholder')}
            className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Hierarchical location and budget selectors grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
          
          {/* 1. Division Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
              {language === 'bn' ? 'বিভাগ (Division)' : 'Division'}
            </label>
            <div className="relative">
              <select
                value={selectedDivision}
                onChange={(e) => handleDivisionChange(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors appearance-none font-medium cursor-pointer"
              >
                <option value="all">{t('allDivisions')}</option>
                {DIVISIONS.map(d => (
                  <option key={d.id} value={d.id}>
                    {language === 'bn' ? d.nameBn : d.nameEn}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* 2. District Selector (Full 64 districts always accessible) */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center justify-between">
              <span>{language === 'bn' ? 'জেলা (District)' : 'District'}</span>
              <span className="text-[10px] font-normal text-blue-600">
                {selectedDivision === 'all' 
                  ? (language === 'bn' ? '৬৪ জেলা' : 'All 64') 
                  : (language === 'bn' ? `${availableDistricts.length}টি জেলা` : `${availableDistricts.length} districts`)}
              </span>
            </label>
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors appearance-none font-medium cursor-pointer"
              >
                <option value="all">
                  {selectedDivision === 'all' 
                    ? (language === 'bn' ? 'সকল জেলা (৬৪টি জেলা)' : 'All Districts (64)') 
                    : t('allDistricts')}
                </option>
                {selectedDivision === 'all' ? (
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
                  availableDistricts.map(d => (
                    <option key={d.id} value={d.id}>
                      {language === 'bn' ? d.nameBn : d.nameEn}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* 3. Upazila Selector (Always active) */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center justify-between">
              <span>{language === 'bn' ? 'উপজেলা (Upazila)' : 'Upazila'}</span>
              <span className="text-[10px] font-normal text-blue-600">
                {selectedDistrict !== 'all' 
                  ? (language === 'bn' ? `${availableUpazilas.length}টি উপজেলা` : `${availableUpazilas.length} upazilas`)
                  : (language === 'bn' ? 'উপজেলা সমূহ' : 'All hubs')}
              </span>
            </label>
            <div className="relative">
              <select
                value={selectedUpazila}
                onChange={(e) => handleUpazilaChange(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors appearance-none font-medium cursor-pointer"
              >
                <option value="all">
                  {selectedDistrict === 'all'
                    ? (language === 'bn' ? 'সকল উপজেলা / পর্যটন স্পট' : 'All Upazilas / Spots')
                    : t('allUpazilas')}
                </option>
                {selectedDistrict === 'all' ? (
                  <>
                    <optgroup label={language === 'bn' ? 'জনপ্রিয় ভ্রমণ গন্তব্য' : 'Top Travel Destinations'}>
                      {UPAZILAS.filter(u => POPULAR_TRAVEL_UPAZILAS.includes(u.id)).map(u => (
                        <option key={u.id} value={u.id}>
                          ⭐ {language === 'bn' ? u.nameBn : u.nameEn}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={language === 'bn' ? 'সকল জেলা ও উপজেলা' : 'All Upazilas'}>
                      {UPAZILAS.slice(0, 80).map(u => (
                        <option key={u.id} value={u.id}>
                          {language === 'bn' ? u.nameBn : u.nameEn}
                        </option>
                      ))}
                    </optgroup>
                  </>
                ) : (
                  availableUpazilas.map(u => (
                    <option key={u.id} value={u.id}>
                      {language === 'bn' ? u.nameBn : u.nameEn}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <Compass className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* 4. Budget Presets */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
              {language === 'bn' ? 'বাজেট সীমা' : 'Budget Range'}
            </label>
            <div className="relative">
              <select
                value={budgetPreset}
                onChange={(e) => setBudgetPreset(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors appearance-none font-medium cursor-pointer"
              >
                <option value="any">{t('budgetAny')}</option>
                <option value="under1000">{t('budgetUnder1000')}</option>
                <option value="1000to2000">{t('budget1000to2000')}</option>
                <option value="2000plus">{t('budget2000plus')}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {language === 'bn' 
                ? 'বাংলাদেশের ৮ বিভাগ, ৬৪ জেলা এবং ৫০৫টি উপজেলার সকল সাশ্রয়ী হোটেল' 
                : 'Searching across all 8 divisions, 64 districts & 505 upazilas'}
            </span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>{t('searchButton')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
};
