import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getSubmissionStatusByReference } from '../services/db';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Building2, 
  Calendar,
  FileCheck,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface SubmissionStatusPageProps {
  initialRef?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const SubmissionStatusPage: React.FC<SubmissionStatusPageProps> = ({ 
  initialRef = '', 
  onNavigate 
}) => {
  const { language, t, formatDate } = useLanguage();
  const [referenceCode, setReferenceCode] = useState(initialRef);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [statusResult, setStatusResult] = useState<any>(null);

  const handleLookup = async (codeToSearch?: string) => {
    const code = (codeToSearch || referenceCode).trim();
    if (!code) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await getSubmissionStatusByReference(code);
      setStatusResult(res.found ? res : null);
    } catch (err) {
      console.error(err);
      setStatusResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      setReferenceCode(initialRef);
      handleLookup(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          title: language === 'bn' ? 'অনুমোদিত ও প্রকাশিত' : 'Approved & Published',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          desc: language === 'bn' ? 'আপনার প্রপার্টি যাচাই সম্পন্ন হয়েছে এবং তা মূল সাইটে সরাসরি প্রকাশিত হয়েছে।' : 'Your property has been verified and is now live on the Thakbo directory.'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          title: language === 'bn' ? 'বাতিল করা হয়েছে' : 'Rejected',
          color: 'text-red-700 bg-red-50 border-red-200',
          desc: language === 'bn' ? 'তথ্য অসম্পূর্ণ বা নীতিমালা বিরোধী হওয়ায় আবেদনটি গ্রহণ করা সম্ভব হয়নি।' : 'The submission could not be approved based on our listing verification guidelines.'
        };
      case 'changes_requested':
        return {
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
          title: language === 'bn' ? 'সংশোধন প্রয়োজন' : 'Changes Requested',
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          desc: language === 'bn' ? 'মডারেটর কিছু তথ্য যাচাইয়ের জন্য সংশোধন অনুরোধ করেছেন।' : 'The moderation team requires additional details before publishing.'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-blue-600" />,
          title: language === 'bn' ? 'পর্যালোচনাধীন (অপেক্ষমাণ)' : 'Pending Review',
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          desc: language === 'bn' ? 'আপনার আবেদনটি আমাদের মডারেটর দলের কাছে পর্যালোচনার জন্য অপেক্ষমাণ রয়েছে।' : 'Your submission is queued for moderator verification.'
        };
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {language === 'bn' ? 'আবেদনের স্ট্যাটাস ট্র্যাক করুন' : 'Track Your Submission'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          {language === 'bn'
            ? 'সাবমিশন করার সময় প্রাপ্ত ট্র্যাকিং কোড (যেমন: TB-SUB-784912) লিখে আবেদনের বর্তমান অবস্থা দেখুন।'
            : 'Enter the reference code received upon submission to see moderation progress.'}
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            required
            value={referenceCode}
            onChange={(e) => setReferenceCode(e.target.value)}
            placeholder="e.g. TB-SUB-784912"
            className="w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border-none font-mono uppercase focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs shrink-0 disabled:opacity-50"
        >
          {isSearching ? (language === 'bn' ? 'অনুসন্ধান...' : 'Checking...') : (language === 'bn' ? 'স্ট্যাটাস দেখুন' : 'Track')}
        </button>
      </form>

      {/* Results Box */}
      {hasSearched && (
        <div className="animate-in fade-in duration-150">
          {statusResult ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 font-mono">
                    {statusResult.referenceCode}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>{statusResult.propertyName}</span>
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{formatDate(statusResult.submittedAt)}</span>
                </div>
              </div>

              {/* Status Badge Box */}
              {(() => {
                const info = getStatusBadge(statusResult.status);
                return (
                  <div className={`p-5 rounded-xl border flex items-start gap-4 ${info.color}`}>
                    <div className="shrink-0 mt-0.5">{info.icon}</div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm sm:text-base">{info.title}</h3>
                      <p className="text-xs sm:text-sm leading-relaxed">{info.desc}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Decision reason if rejected or changes requested */}
              {statusResult.decisionReason && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs sm:text-sm text-slate-700">
                  <span className="font-bold text-slate-900 block">
                    {language === 'bn' ? 'মডারেটরের নোট:' : 'Moderation Note:'}
                  </span>
                  <p className="text-slate-600 italic">
                    "{statusResult.decisionReason}"
                  </p>
                </div>
              )}

              {/* Progress Steps */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                  {language === 'bn' ? 'পর্যালোচনা অগ্রগতি' : 'Moderation Lifecycle'}
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-emerald-600 block mb-0.5">✓ {language === 'bn' ? 'গৃহীত' : 'Received'}</span>
                    <span className="text-[11px] text-slate-400">{language === 'bn' ? 'ডেটাবেসে সংরক্ষিত' : 'Stored in queue'}</span>
                  </div>
                  <div className={`p-3 rounded-lg border ${statusResult.status === 'pending' ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span className="block mb-0.5">{language === 'bn' ? 'যাচাইকরণ' : 'Verification'}</span>
                    <span className="text-[11px] text-slate-400">{language === 'bn' ? 'অ্যাডমিন পর্যালোচনা' : 'Admin review'}</span>
                  </div>
                  <div className={`p-3 rounded-lg border ${statusResult.status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span className="block mb-0.5">{language === 'bn' ? 'সিদ্ধান্ত' : 'Decision'}</span>
                    <span className="text-[11px] text-slate-400">{statusResult.status}</span>
                  </div>
                </div>
              </div>

              {statusResult.status === 'approved' && (
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => onNavigate('hotels')}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2"
                  >
                    <span>{language === 'bn' ? 'তালিকায় দেখুন' : 'Explore Published Stays'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="py-12 px-6 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'bn' ? 'কোনো আবেদন পাওয়া যায়নি' : 'No Submission Found'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'আপনার দেওয়া রেফারেন্স কোডটি সঠিক কিনা পুনরায় পরীক্ষা করুন। কোডটি TB-SUB- দিয়ে শুরু হয়।'
                  : 'Please check your tracking code format (e.g. TB-SUB-784912) and try again.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sample Reference Code Helper */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>
          {language === 'bn' 
            ? 'ডেমো পরীক্ষার জন্য নমুনা কোড: TB-SUB-784912' 
            : 'Try sample reference code: TB-SUB-784912'}
        </span>
        <button
          onClick={() => {
            setReferenceCode('TB-SUB-784912');
            handleLookup('TB-SUB-784912');
          }}
          className="text-blue-600 font-semibold hover:underline"
        >
          {language === 'bn' ? 'ব্যবহার করুন' : 'Use Sample'}
        </button>
      </div>

    </div>
  );
};
