import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AccommodationType, RoomType, BathroomType, ContributorRelationship, SubmissionPayload } from '../types';
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
import { ALL_FACILITIES } from '../data/facilities';
import { createStaySubmission } from '../services/db';
import { 
  Building2, 
  MapPin, 
  Bed, 
  Sparkles, 
  Upload, 
  Trash2, 
  Plus, 
  Phone, 
  CheckCircle2, 
  ShieldAlert, 
  Copy, 
  Check, 
  ArrowRight,
  Info
} from 'lucide-react';

interface AddHotelPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const AddHotelPage: React.FC<AddHotelPageProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();

  // Basic Info
  const [propertyName, setPropertyName] = useState('');
  const [accommodationType, setAccommodationType] = useState<AccommodationType>('hotel');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');

  // Location
  const [divisionId, setDivisionId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [upazilaId, setUpazilaId] = useState('');
  const [address, setAddress] = useState('');

  // Rooms (Dynamic list)
  const [rooms, setRooms] = useState<Array<{
    roomName: string;
    roomType: RoomType;
    pricePerNight: number;
    maxGuests: number;
    airConditioned: boolean;
    bathroomType: BathroomType;
    availabilityNote: string;
  }>>([
    {
      roomName: 'স্ট্যান্ডার্ড নন-এসি ডাবল',
      roomType: 'double',
      pricePerNight: 1200,
      maxGuests: 2,
      airConditioned: false,
      bathroomType: 'attached',
      availabilityNote: ''
    }
  ]);

  // Facilities
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(['fac-attached-bath']);

  // Photos
  const [photos, setPhotos] = useState<Array<{
    storagePath: string;
    isCover: boolean;
    caption: string;
    attribution: string;
  }>>([
    {
      storagePath: '/src/assets/images/cox_beach_guesthouse_1791896539124.jpg',
      isCover: true,
      caption: 'হোটেলের প্রধান সম্মুখভাগ',
      attribution: 'Contributor'
    }
  ]);

  // Contact Info & Contributor
  const [contactPhone, setContactPhone] = useState('');
  const [publicWebsiteUrl, setPublicWebsiteUrl] = useState('');
  const [contributorRelationship, setContributorRelationship] = useState<ContributorRelationship>('local_contributor');
  const [privateContactEmail, setPrivateContactEmail] = useState('');

  // Terms and Consent
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    referenceCode: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Dependent location lists (all 64 districts always available)
  const availableDistricts = divisionId ? getDistrictsByDivision(divisionId) : DISTRICTS;
  const availableUpazilas = districtId 
    ? getUpazilasByDistrict(districtId) 
    : divisionId 
      ? getUpazilasByDivision(divisionId) 
      : UPAZILAS.filter(u => POPULAR_TRAVEL_UPAZILAS.includes(u.id));

  const handleDistrictChange = (disId: string) => {
    setDistrictId(disId);
    setUpazilaId('');
    if (disId) {
      const d = findDistrictById(disId);
      if (d?.parentId) {
        setDivisionId(d.parentId);
      }
    }
  };

  const handleUpazilaChange = (upzId: string) => {
    setUpazilaId(upzId);
    if (upzId) {
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

  const handleAddRoom = () => {
    setRooms([
      ...rooms,
      {
        roomName: 'ডিলাক্স এসি ডাবল',
        roomType: 'double',
        pricePerNight: 2000,
        maxGuests: 2,
        airConditioned: true,
        bathroomType: 'attached',
        availabilityNote: ''
      }
    ]);
  };

  const handleRemoveRoom = (index: number) => {
    if (rooms.length <= 1) return;
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleRoomChange = (index: number, field: string, value: any) => {
    const updated = [...rooms];
    (updated[index] as any)[field] = value;
    setRooms(updated);
  };

  const toggleFacility = (facId: string) => {
    if (selectedFacilities.includes(facId)) {
      setSelectedFacilities(selectedFacilities.filter(f => f !== facId));
    } else {
      setSelectedFacilities([...selectedFacilities, facId]);
    }
  };

  const handlePhotoUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Simulate image read to dataURL or local preview
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(language === 'bn' ? 'ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে' : 'Image size must be 5MB or less');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotos([
        ...photos,
        {
          storagePath: result,
          isCover: photos.length === 0,
          caption: file.name,
          attribution: 'Submitter Upload'
        }
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleSetCoverPhoto = (idx: number) => {
    const updated = photos.map((p, i) => ({
      ...p,
      isCover: i === idx
    }));
    setPhotos(updated);
  };

  const handleRemovePhoto = (idx: number) => {
    if (photos.length <= 1) return;
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!propertyName.trim()) {
      setErrorMessage(language === 'bn' ? 'হোটেলের নাম দেওয়া বাধ্যতামূলক' : 'Hotel name is required');
      return;
    }
    if (!divisionId || !districtId) {
      setErrorMessage(language === 'bn' ? 'বিভাগ এবং জেলা নির্বাচন করুন' : 'Division and district are required');
      return;
    }
    if (!address.trim()) {
      setErrorMessage(language === 'bn' ? 'পূর্ণাঙ্গ ঠিকানা লিখুন' : 'Detailed address is required');
      return;
    }
    if (!contactPhone.trim()) {
      setErrorMessage(language === 'bn' ? 'যোগাযোগের ফোন নম্বর দিন' : 'Contact phone number is required');
      return;
    }
    if (!privateContactEmail.trim() || !privateContactEmail.includes('@')) {
      setErrorMessage(language === 'bn' ? 'সঠিক যোগাযোগের ইমেইল দিন (স্ট্যাটাস জানার জন্য)' : 'Valid contact email is required');
      return;
    }
    if (!agreedToTerms) {
      setErrorMessage(language === 'bn' ? 'শর্তাবলী মেনে নেওয়ার টিক দিন' : 'Please agree to submission terms');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: SubmissionPayload = {
        propertyName: propertyName.trim(),
        accommodationType,
        descriptionBn: descriptionBn.trim() || propertyName,
        descriptionEn: descriptionEn.trim(),
        divisionId,
        districtId,
        upazilaId: upazilaId || districtId,
        address: address.trim(),
        contactPhone: contactPhone.trim(),
        publicWebsiteUrl: publicWebsiteUrl.trim(),
        contributorRelationship,
        privateContactEmail: privateContactEmail.trim(),
        facilities: selectedFacilities,
        rooms,
        photos,
      };

      const result = await createStaySubmission(payload);
      if (result.success) {
        setSubmissionResult({ referenceCode: result.referenceCode });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error creating submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!submissionResult) return;
    navigator.clipboard.writeText(submissionResult.referenceCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // SUCCESS STATE MODAL / VIEW
  if (submissionResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {language === 'bn' ? 'আবেদন সফলভাবে গ্রহণ করা হয়েছে!' : 'Submission Received Successfully!'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {language === 'bn'
              ? 'আপনার জমা দেওয়া প্রপার্টির তথ্য আমাদের মডারেটর দলের কাছে অপেক্ষমাণ (Pending Review) তালিকায় যুক্ত হয়েছে। যাচাই শেষে এটি প্রকাশিত হবে।'
              : 'Your submission is now pending moderation. Once our moderators review and verify the details, it will be published.'}
          </p>
        </div>

        {/* Reference Code Card */}
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            {language === 'bn' ? 'আপনার ট্র্যাকিং রেফারেন্স কোড' : 'Your Tracking Reference Code'}
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-black text-blue-600 tracking-wider">
              {submissionResult.referenceCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
              title="Copy code"
            >
              {copiedCode ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            {language === 'bn' 
              ? 'এই কোডটি সংরক্ষণ করুন। এটি দিয়ে আপনি যেকোনো সময় আবেদনের স্ট্যাটাস দেখতে পারবেন।'
              : 'Save this code to check your approval status at any time.'}
          </p>
        </div>

        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onNavigate('status', { ref: submissionResult.referenceCode })}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <span>{language === 'bn' ? 'স্ট্যাটাস চেক করুন' : 'Track Submission Status'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
          >
            {language === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'কমিউনিটি অবদান' : 'Community Submission'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {language === 'bn' ? 'নতুন বাজেট হোটেল বা কটেজ যুক্ত করুন' : 'Add a Budget Stay to Thakbo'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          {language === 'bn'
            ? 'উপজেলা বা পর্যটন এলাকার সাশ্রয়ী থাকার জায়গা সম্পর্কে সঠিক তথ্য দিন। মডারেটর দল তথ্য যাচাই করার পর এটি মূল সাইটে প্রকাশিত হবে।'
            : 'Contribute verified budget stays. To protect travelers from fraud and false prices, all submissions require moderation before publication.'}
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-700 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Section 1: Basic Information */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>{language === 'bn' ? '১. প্রাথমিক তথ্য' : '1. Basic Information'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'হোটেল বা কটেজের নাম *' : 'Property Name *'}
              </label>
              <input
                type="text"
                required
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: সাগরিকা গেস্ট হাউস' : 'e.g. Hillside Rest Inn'}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'আবাসনের ধরন *' : 'Accommodation Type *'}
              </label>
              <select
                value={accommodationType}
                onChange={(e) => setAccommodationType(e.target.value as AccommodationType)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="hotel">{language === 'bn' ? 'হোটেল' : 'Hotel'}</option>
                <option value="guest_house">{language === 'bn' ? 'গেস্ট হাউস' : 'Guest House'}</option>
                <option value="eco_cottage">{language === 'bn' ? 'ইকো কটেজ' : 'Eco Cottage'}</option>
                <option value="resort">{language === 'bn' ? 'রিসোর্ট' : 'Resort'}</option>
                <option value="dormitory">{language === 'bn' ? 'ডরমিটরি' : 'Dormitory'}</option>
                <option value="rest_house">{language === 'bn' ? 'রেস্ট হাউস' : 'Rest House'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'বাংলা বিবরণ *' : 'Description in Bengali *'}
            </label>
            <textarea
              rows={3}
              required
              value={descriptionBn}
              onChange={(e) => setDescriptionBn(e.target.value)}
              placeholder={language === 'bn' ? 'হোটেলের পরিবেশ, অবস্থান ও ভ্রমণকারীদের জন্য উপযোগী সুবিধার সংক্ষিপ্ত বিবরণ লিখুন...' : 'Short description in Bengali...'}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'ইংরেজি বিবরণ (ঐচ্ছিক)' : 'English Description (Optional)'}
            </label>
            <textarea
              rows={2}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              placeholder="English description for international travelers..."
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </section>

        {/* Section 2: Location */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>{language === 'bn' ? '২. প্রশাসনিক অবস্থান ও ঠিকানা' : '2. Administrative Location'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'বিভাগ *' : 'Division *'}
              </label>
              <select
                required
                value={divisionId}
                onChange={(e) => {
                  setDivisionId(e.target.value);
                  setDistrictId('');
                  setUpazilaId('');
                }}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">{language === 'bn' ? '-- বিভাগ নির্বাচন করুন --' : '-- Select Division --'}</option>
                {DIVISIONS.map(d => (
                  <option key={d.id} value={d.id}>
                    {language === 'bn' ? d.nameBn : d.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {language === 'bn' ? 'জেলা *' : 'District *'}
                </label>
                <span className="text-[10px] text-blue-600 font-medium">
                  {divisionId ? `${availableDistricts.length}টি জেলা` : (language === 'bn' ? '৬৪ জেলা' : 'All 64')}
                </span>
              </div>
              <select
                required
                value={districtId}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">
                  {divisionId 
                    ? (language === 'bn' ? '-- জেলা নির্বাচন করুন --' : '-- Select District --')
                    : (language === 'bn' ? '-- জেলা নির্বাচন করুন (৬৪ জেলা) --' : '-- Select District (All 64) --')}
                </option>
                {!divisionId ? (
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
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {language === 'bn' ? 'উপজেলা *' : 'Upazila *'}
                </label>
                <span className="text-[10px] text-blue-600 font-medium">
                  {districtId ? `${availableUpazilas.length}টি` : (language === 'bn' ? 'সকল' : 'All')}
                </span>
              </div>
              <select
                required
                value={upazilaId}
                onChange={(e) => handleUpazilaChange(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">{language === 'bn' ? '-- উপজেলা নির্বাচন করুন --' : '-- Select Upazila --'}</option>
                {!districtId ? (
                  <>
                    <optgroup label={language === 'bn' ? 'জনপ্রিয় পর্যটন এলাকা' : 'Top Tourist Hubs'}>
                      {UPAZILAS.filter(u => POPULAR_TRAVEL_UPAZILAS.includes(u.id)).map(u => (
                        <option key={u.id} value={u.id}>
                          ⭐ {language === 'bn' ? u.nameBn : u.nameEn}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={language === 'bn' ? 'সকল উপজেলা' : 'All Upazilas'}>
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
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'পূর্ণাঙ্গ ঠিকানা ও চেনার উপায় *' : 'Detailed Address & Landmark *'}
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={language === 'bn' ? 'যেমন: মেইন রোড, থানা মোড় সংলগ্ন, কুয়াকাটা' : 'Street name, landmark, road number...'}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </section>

        {/* Section 3: Rooms & Pricing */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bed className="w-4 h-4 text-blue-600" />
              <span>{language === 'bn' ? '৩. রুমের ধরন ও প্রতি রাতের ভাড়া' : '3. Rooms & Nightly Rates'}</span>
            </h2>
            <button
              type="button"
              onClick={handleAddRoom}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'রুম যোগ করুন' : 'Add Room'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {rooms.map((room, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                {rooms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRoom(idx)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"
                    title="Remove room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {language === 'bn' ? 'রুমের নাম' : 'Room Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={room.roomName}
                      onChange={(e) => handleRoomChange(idx, 'roomName', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {language === 'bn' ? 'প্রতি রাতের ভাড়া (৳ BDT) *' : 'Nightly Price (৳) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={room.pricePerNight}
                      onChange={(e) => handleRoomChange(idx, 'pricePerNight', Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {language === 'bn' ? 'সর্বোচ্চ অতিথি' : 'Max Guests'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={room.maxGuests}
                      onChange={(e) => handleRoomChange(idx, 'maxGuests', Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {language === 'bn' ? 'এসি সুবিধা' : 'AC Condition'}
                    </label>
                    <select
                      value={room.airConditioned ? 'true' : 'false'}
                      onChange={(e) => handleRoomChange(idx, 'airConditioned', e.target.value === 'true')}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="false">{language === 'bn' ? 'নন-এসি (Non-AC)' : 'Non-AC'}</option>
                      <option value="true">{language === 'bn' ? 'এয়ার কন্ডিশনার (AC)' : 'AC'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {language === 'bn' ? 'বাথরুম' : 'Bathroom'}
                    </label>
                    <select
                      value={room.bathroomType}
                      onChange={(e) => handleRoomChange(idx, 'bathroomType', e.target.value as BathroomType)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="attached">{language === 'bn' ? 'সংযুক্ত বাথরুম' : 'Attached'}</option>
                      <option value="shared">{language === 'bn' ? 'শেয়ার্ড বাথরুম' : 'Shared'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {language === 'bn' ? 'বিশেষ নোট (ঐচ্ছিক)' : 'Note'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'bn' ? 'ব্যালকনি ভিউ / গিজার' : 'Balcony / Mountain view'}
                      value={room.availabilityNote}
                      onChange={(e) => handleRoomChange(idx, 'availabilityNote', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Facilities */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>{language === 'bn' ? '৪. বিদ্যমান সুবিধাসমূহ' : '4. Amenities & Facilities'}</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ALL_FACILITIES.map(fac => {
              const isChecked = selectedFacilities.includes(fac.id);
              return (
                <button
                  type="button"
                  key={fac.id}
                  onClick={() => toggleFacility(fac.id)}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2 transition-all text-left ${
                    isChecked
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                  <span>{language === 'bn' ? fac.labelBn : fac.labelEn}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 5: Photos */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>{language === 'bn' ? '৫. ছবি যুক্ত করুন' : '5. Property Photos'}</span>
          </h2>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors">
                <Upload className="w-4 h-4" />
                <span>{language === 'bn' ? 'ডিভাইস থেকে ছবি আপলোড করুন' : 'Upload from Device'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoUploadMock}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-400">
                {language === 'bn' ? 'সর্বোচ্চ ৫ মেগাবাইট (JPG, PNG, WebP)' : 'Max 5MB (JPG, PNG, WebP)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-4/3 bg-slate-100 group">
                  <img src={photo.storagePath} alt="" className="w-full h-full object-cover" />
                  
                  <div className="absolute top-2 left-2">
                    <button
                      type="button"
                      onClick={() => handleSetCoverPhoto(idx)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs ${
                        photo.isCover 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-black/60 text-white hover:bg-blue-600'
                      }`}
                    >
                      {photo.isCover ? (language === 'bn' ? 'কভার ছবি' : 'Cover Photo') : (language === 'bn' ? 'কভার করুন' : 'Set Cover')}
                    </button>
                  </div>

                  {photos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-2 right-2 p-1 rounded bg-black/60 text-white hover:bg-red-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Contact & Contributor Relationship */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            <span>{language === 'bn' ? '৬. যোগাযোগ ও সাবমিটারের তথ্য' : '6. Contact & Submitter Info'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'হোটেলের বুকিং ফোন নম্বর *' : 'Hotel Booking Phone Number *'}
              </label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+880 1..."
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'ওয়েবসাইট বা ফেসবুক পেজ লিংক (ঐচ্ছিক)' : 'Website or Facebook Page (Optional)'}
              </label>
              <input
                type="url"
                value={publicWebsiteUrl}
                onChange={(e) => setPublicWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'হোটেলের সাথে আপনার সম্পর্ক *' : 'Your Relationship to Property *'}
              </label>
              <select
                value={contributorRelationship}
                onChange={(e) => setContributorRelationship(e.target.value as ContributorRelationship)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="owner_manager">{language === 'bn' ? 'মালিক বা ম্যানেজার' : 'Owner / Manager'}</option>
                <option value="hotel_staff">{language === 'bn' ? 'হোটেল স্টাফ' : 'Hotel Staff'}</option>
                <option value="local_contributor">{language === 'bn' ? 'স্থানীয় অধিবাসী / গাইড' : 'Local Resident / Guide'}</option>
                <option value="past_traveler">{language === 'bn' ? 'সাবেক ভ্রমণকারী' : 'Past Traveler'}</option>
                <option value="other">{language === 'bn' ? 'অন্যান্য' : 'Other'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'আপনার ব্যক্তিগত ইমেইল (গোপন থাকবে) *' : 'Your Private Contact Email *'}
              </label>
              <input
                type="email"
                required
                value={privateContactEmail}
                onChange={(e) => setPrivateContactEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {language === 'bn' ? 'এই ইমেইলটি সর্বসাধারণের কাছে প্রকাশ করা হবে না।' : 'Never exposed publicly. Used solely for submission approval updates.'}
              </span>
            </div>
          </div>
        </section>

        {/* Section 7: Agreement & Submission */}
        <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm text-slate-700">
            <input
              type="checkbox"
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="leading-relaxed">
              {language === 'bn'
                ? 'আমি নিশ্চিত করছি যে প্রদত্ত তথ্য সত্য ও নির্ভরযোগ্য। আমি থাকবো প্ল্যাটফর্মের লিস্টিং নীতিমালা ও গোপনীয়তা শর্তাবলীর সাথে একমত।'
                : 'I confirm that the submitted accommodation details and prices are accurate to the best of my knowledge, and agree to Thakbo\'s Listing Policy.'}
            </span>
          </label>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span>{isSubmitting ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...') : (language === 'bn' ? 'আবেদন জমা দিন' : 'Submit Accommodation')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

      </form>

    </div>
  );
};
