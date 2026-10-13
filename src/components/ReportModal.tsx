import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ReportType } from '../types';
import { submitHotelReport } from '../services/db';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  hotelId: string;
  hotelName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ hotelId, hotelName, isOpen, onClose }) => {
  const { language, t } = useLanguage();

  const [reportType, setReportType] = useState<ReportType>('incorrect_price');
  const [description, setDescription] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage(language === 'bn' ? 'দয়া করে বিস্তারিত তথ্য লিখুন' : 'Please provide details');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await submitHotelReport({
        hotelId,
        hotelName,
        reportType,
        description,
        reporterContact: reporterContact.trim() || undefined,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error submitting report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setDescription('');
    setReporterContact('');
    setErrorMessage('');
    onClose();
  };

  const reportTypeOptions: { value: ReportType; bn: string; en: string }[] = [
    { value: 'incorrect_price', bn: 'ভুল বা অতিরিক্ত মূল্য', en: 'Incorrect or higher price' },
    { value: 'incorrect_phone', bn: 'ভুল বা অকার্যকর ফোন নম্বর', en: 'Wrong or invalid phone number' },
    { value: 'incorrect_address', bn: 'ভুল অবস্থান বা ঠিকানা', en: 'Incorrect location or address' },
    { value: 'closed_property', bn: 'হোটেলটি বর্তমানে বন্ধ রয়েছে', en: 'Property is currently closed' },
    { value: 'misleading_content', bn: 'ভুল ছবি বা বিভ্রান্তিকর তথ্য', en: 'Misleading photos or info' },
    { value: 'other', bn: 'অন্যান্য সমস্যা', en: 'Other issue' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
        
        {/* Close button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'bn' ? 'রিপোর্ট জমা হয়েছে' : 'Report Submitted'}
            </h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              {language === 'bn' 
                ? 'আপনার তথ্যের জন্য ধন্যবাদ। আমাদের মডারেটর দল দ্রুত তথ্যটি যাচাই করে প্রয়োজনীয় ব্যবস্থা গ্রহণ করবে।' 
                : 'Thank you for your report. Our moderation team will investigate and take appropriate action.'}
            </p>
            <button
              onClick={handleResetAndClose}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">
                {language === 'bn' ? 'ভুল তথ্য রিপোর্ট করুন' : 'Report Issue'}
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              {language === 'bn'
                ? `প্রপার্টি: ${hotelName}`
                : `Property: ${hotelName}`}
            </p>

            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {errorMessage}
              </div>
            )}

            {/* Issue Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {language === 'bn' ? 'সমস্যার ধরন' : 'Issue Category'}
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {reportTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {language === 'bn' ? opt.bn : opt.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {language === 'bn' ? 'বিস্তারিত বিবরণ' : 'Detailed Description'}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'bn' ? 'কী সমস্যা দেখতে পেয়েছেন বিস্তারিত লিখুন...' : 'Please describe the discrepancy or issue...'}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Optional contact */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {language === 'bn' ? 'আপনার যোগাযোগ (ঐচ্ছিক)' : 'Your Contact (Optional)'}
              </label>
              <input
                type="text"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder={language === 'bn' ? 'ইমেইল বা ফোন নম্বর' : 'Email or phone number'}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting 
                  ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...') 
                  : (language === 'bn' ? 'রিপোর্ট পাঠান' : 'Submit Report')}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
