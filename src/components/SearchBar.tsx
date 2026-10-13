import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { DIVISIONS, getDistrictsByDivision, getUpazilasByDistrict } from '../data/locations';
import { Search, MapPin, DollarSign, ArrowRight } from 'lucide-react';

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

  // Dependent districts and upazilas
  const availableDistricts = selectedDivision !== 'all' 
    ? getDistrictsByDivision(selectedDivision) 
    : [];

  const availableUpazilas = selectedDistrict !== 'all' 
    ? getUpazilasByDistrict(selectedDistrict) 
    : [];

  // When division changes, reset dependent levels
  const handleDivisionChange = (divId: string) => {
    setSelectedDivision(divId);
    setSelectedDistrict('all');
    setSelectedUpazila('all');
  };

  const handleDistrictChange = (disId: string) => {
    setSelectedDistrict(disId);
    setSelectedUpazila('all');
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
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={selectedDivision}
          onChange={(e) => handleDivisionChange(e.target.value)}
          className="text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">{t('allDivisions')}</option>
          {DIVISIONS.map(d => (
            <option key={d.id} value={d.id}>
              {language === 'bn' ? d.nameBn : d.nameEn}
            </option>
          ))}
        </select>

        <select
          value={budgetPreset}
          onChange={(e) => setBudgetPreset(e.target.value)}
          className="text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    <div className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl p-4 sm:p-6 transition-all">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Main query input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Hierarchical location and budget selectors grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Division */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {language === 'bn' ? 'বিভাগ' : 'Division'}
            </label>
            <div className="relative">
              <select
                value={selectedDivision}
                onChange={(e) => handleDivisionChange(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors appearance-none"
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

          {/* District */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {language === 'bn' ? 'জেলা' : 'District'}
            </label>
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={selectedDivision === 'all'}
                className="w-full text-xs sm:text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors disabled:opacity-50 appearance-none"
              >
                <option value="all">{t('allDistricts')}</option>
                {availableDistricts.map(d => (
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

          {/* Upazila */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {language === 'bn' ? 'উপজেলা' : 'Upazila'}
            </label>
            <div className="relative">
              <select
                value={selectedUpazila}
                onChange={(e) => setSelectedUpazila(e.target.value)}
                disabled={selectedDistrict === 'all' || availableUpazilas.length === 0}
                className="w-full text-xs sm:text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors disabled:opacity-50 appearance-none"
              >
                <option value="all">{t('allUpazilas')}</option>
                {availableUpazilas.map(u => (
                  <option key={u.id} value={u.id}>
                    {language === 'bn' ? u.nameBn : u.nameEn}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Budget Presets */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {language === 'bn' ? 'বাজেট সীমা' : 'Budget Range'}
            </label>
            <div className="relative">
              <select
                value={budgetPreset}
                onChange={(e) => setBudgetPreset(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors appearance-none"
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
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>{t('searchButton')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
};
