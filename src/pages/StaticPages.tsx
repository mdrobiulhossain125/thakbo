import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Mail, FileText, CheckCircle2, MapPin, Send, HelpCircle } from 'lucide-react';

interface StaticPageProps {
  page: 'about' | 'privacy' | 'terms' | 'listing-policy' | 'contact';
  onNavigate: (view: string) => void;
}

export const StaticPage: React.FC<StaticPageProps> = ({ page, onNavigate }) => {
  const { language, t } = useLanguage();
  const [contactSent, setContactSent] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
  };

  if (page === 'about') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-in fade-in duration-150">
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            {language === 'bn' ? 'আমাদের লক্ষ্য' : 'Our Mission'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {language === 'bn' ? 'উপজেলা পর্যায়ের বাজেট থাকার জায়গা সবার জন্য' : 'Democratizing Budget Accommodation in Bangladesh'}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {language === 'bn'
              ? 'ঘুরতে বের হোন, থাকার চিন্তা কমান — বাংলাদেশের প্রতিটি প্রান্তে সাশ্রয়ী ভ্রমণের স্বপ্ন বাস্তবায়ন।'
              : 'Empowering budget travelers, students, and explorers to discover genuine, affordable stays across all 64 districts.'}
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6">
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'bn' ? 'কেন থাকবো?' : 'Why Thakbo?'}
            </h2>
            <p>
              {language === 'bn'
                ? 'অনলাইন বুকিং পোর্টালগুলো কেবল বড় শহর ও বিলাসবহুল ৫-তারকা হোটেলের ওপর আলোকপাত করে। কিন্তু প্রকৃত বাংলাদেশে ঘুরে বেড়ানো ব্যাকপ্যাকার, শিক্ষার্থী ও মধ্যবিত্ত ভ্রমণকারীদের প্রয়োজন প্রত্যন্ত উপজেলা ও ছোট শহরের সাশ্রয়ী (৳৬০০–৳১৫০০) হোটেল ও গেস্ট হাউসের নির্ভরযোগ্য তথ্য।'
                : 'Commercial travel aggregators focus heavily on luxury metropolitan hotels with steep booking commissions. Thakbo fills the critical gap for domestic backpackers, students, and budget families seeking reliable ৳500–৳1,800/night stays in rural upazilas and smaller towns.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="p-5 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-900 text-base">
                {language === 'bn' ? 'উন্মুক্ত কমিউনিটি মডেল' : 'Community-Powered'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                {language === 'bn'
                  ? 'যেকোনো ভ্রমণকারী বা স্থানীয় গাইড নিজ এলাকার সাশ্রয়ী হোটেল তালিকাভুক্ত করতে পারেন।'
                  : 'Local guides and travelers submit upazila stays directly to help the traveling community.'}
              </p>
            </div>

            <div className="p-5 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-900 text-base">
                {language === 'bn' ? 'মডারেটর কর্তৃক যাচাই' : 'Moderated Accuracy'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                {language === 'bn'
                  ? 'কোনো ভুয়া বা অবাস্তব তথ্য যাতে না আসে, সেজন্য প্রতিটি সাবমিশন অ্যাডমিন দল যাচাই করে।'
                  : 'Every listing undergoes strict administrative inspection before publication to prevent fraud.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'listing-policy') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-150">
        <div className="space-y-2 border-b border-slate-200 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            {language === 'bn' ? 'তালিকাভুক্তি নির্দেশিকা' : 'Listing Quality Standards'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {t('listingPolicy')}
          </h1>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-blue-900">
            <h3 className="font-bold text-base">
              {language === 'bn' ? 'আমাদের মৌলিক নীতিমালা' : 'Core Platform Policy'}
            </h3>
            <p className="text-xs sm:text-sm">
              {language === 'bn'
                ? 'থাকবো প্ল্যাটফর্মে কোনো বিভ্রান্তিকর তথ্য, ভুয়া ছবি বা অসত্য মূল্য বরদাশত করা হয় না।'
                : 'Thakbo enforces a strict zero-tolerance policy against deceptive pricing, unlicensed photos, and fabricated contact information.'}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base">১. নির্ভুল মূল্য প্রদর্শনের শর্ত</h3>
            <p className="text-slate-600">
              হোটেলের রুমের ভাড়া অবশ্যই সাধারণ মৌসুমে কার্যকর প্রকৃত মূল্য হতে হবে। অফ-সিজন বা পিক-সিজনের পরিবর্তন থাকলে তা বিবরণীতে উল্লেখ করা আবশ্যক।
            </p>

            <h3 className="font-bold text-slate-900 text-base">২. ছবির সত্যতা</h3>
            <p className="text-slate-600">
              অনুমোদনহীন ইন্টারনেট থেকে কপি করা ছবি পরিহার করতে হবে। সাবমিটারের অবশ্যই ছবি প্রকাশের বৈধ অধিকার বা প্রপার্টি ম্যানেজমেন্টের অনুমতি থাকতে হবে।
            </p>

            <h3 className="font-bold text-slate-900 text-base">৩. মডারেশনের অধিকার</h3>
            <p className="text-slate-600">
              থাকবো কর্তৃপক্ষ যেকোনো সন্দেহজনক, অসম্পূর্ণ বা বিভ্রান্তিকর লিস্টিং তাৎক্ষণিকভাবে বাতিল বা প্রত্যাহার করার পূর্ণ অধিকার সংরক্ষণ করে।
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'privacy') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-in fade-in duration-150">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 border-b pb-4">
          {t('privacyPolicy')}
        </h1>
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            {language === 'bn'
              ? 'থাকবো প্ল্যাটফর্ম ব্যবহারকারীদের গোপনীয়তাকে সর্বোচ্চ অগ্রাধিকার দেয়। সাবমিশন করার সময় প্রদত্ত আপনার ব্যক্তিগত ইমেইল কেবল স্ট্যাটাস আপডেট ও মডারেশন যোগাযোগের জন্য ব্যবহৃত হয় এবং তা কখনই জনসাধারণের জন্য প্রকাশ করা হয় না।'
              : 'Thakbo respects your privacy. Private contact emails submitted during accommodation submissions are never published publicly and are used solely for verification.'}
          </p>
          <p>
            {language === 'bn'
              ? 'হোটেল বা কটেজের যে ফোন নম্বর ও ঠিকানা পাবলিক ফিল্ডে দেওয়া হয়, তা ভ্রমণকারীদের সরাসরি বুকিং ও যোগাযোগের স্বার্থে উন্মুক্তভাবে প্রদর্শিত হয়।'
              : 'Public hotel phone numbers and addresses are published transparently so travelers can contact stays directly.'}
          </p>
        </div>
      </div>
    );
  }

  if (page === 'terms') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-in fade-in duration-150">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 border-b pb-4">
          {t('termsOfUse')}
        </h1>
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            {language === 'bn'
              ? 'থাকবো একটি উন্মুক্ত তথ্য নির্দেশিকা। আমরা সরাসরি বুকিং ফি গ্রহণ করি না কিংবা হোটেলের কক্ষের তাৎক্ষণিক প্রাপ্যতা নিশ্চিত করি না। যাত্রার পূর্বে ভ্রমণকারীদের সরাসরি ফোনে রুম ও মূল্য পুনরায় যাচাই করার পরামর্শ দেওয়া হচ্ছে।'
              : 'Thakbo is an open information directory service. Direct online bookings, room guarantees, or payment processing are not handled by Thakbo. Travelers should verify live availability by phone.'}
          </p>
        </div>
      </div>
    );
  }

  // Contact Page
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-150">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('contactUs')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          {language === 'bn'
            ? 'আমাদের সাথে যেকোনো প্রশ্ন, অংশীদারিত্ব বা তথ্য সংক্রান্ত প্রয়োজনে যোগাযোগ করুন।'
            : 'Reach out to the Thakbo team for partnerships, press, or data corrections.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
          <Mail className="w-5 h-5 text-blue-600 mb-2" />
          <span className="font-semibold text-slate-800 block">ইমেইল ঠিকানা</span>
          <span className="font-mono text-slate-600">contact@thakbo.com</span>
        </div>

        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
          <MapPin className="w-5 h-5 text-blue-600 mb-2" />
          <span className="font-semibold text-slate-800 block">ঠিকানা</span>
          <span className="text-slate-600">মতিঝিল, ঢাকা, বাংলাদেশ</span>
        </div>

        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
          <Shield className="w-5 h-5 text-blue-600 mb-2" />
          <span className="font-semibold text-slate-800 block">মডারেশন সাপোর্ট</span>
          <span className="text-slate-600">সকাল ৯টা – রাত ৮টা (ঢাকা)</span>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        {contactSent ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'bn' ? 'বার্তাটি সফলভাবে পাঠানো হয়েছে' : 'Message Sent Successfully'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'bn' ? 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।' : 'We will respond to your inquiry shortly.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'আপনার নাম' : 'Your Name'}
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'আপনার বার্তা' : 'Message'}
              </label>
              <textarea
                rows={4}
                required
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
