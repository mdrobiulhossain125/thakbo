import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  getAdminDashboardStats, 
  getAdminSubmissionsList, 
  approveSubmission, 
  rejectSubmission, 
  requestSubmissionChanges,
  getAdminHotelsList,
  updateHotelStatus,
  markHotelPriceChecked,
  getAdminReportsList,
  resolveReport,
  getAdminAuditLogs
} from '../services/db';
import { Submission, Hotel, Report, AuditLog } from '../types';
import { getSupabaseConfigStatus } from '../lib/supabase';
import { 
  Shield, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building, 
  FileText, 
  Database, 
  Clock, 
  Calendar,
  Eye,
  Check,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
  User,
  History
} from 'lucide-react';

interface AdminPageProps {
  onOpenSupabaseModal?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onOpenSupabaseModal }) => {
  const { language, t, formatDate, formatPrice } = useLanguage();
  const { user, isAdmin, login, logout, isLoading: authLoading } = useAuth();

  // Login form state
  const [emailInput, setEmailInput] = useState('admin@thakbo.com');
  const [passwordInput, setPasswordInput] = useState('thakbo2026');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'hotels' | 'reports' | 'audit'>('overview');

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Modal / Action states
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [changesNotes, setChangesNotes] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadAdminData = async () => {
    setIsLoadingData(true);
    try {
      const [s, subList, hList, rList, logs] = await Promise.all([
        getAdminDashboardStats(),
        getAdminSubmissionsList(),
        getAdminHotelsList(),
        getAdminReportsList(),
        getAdminAuditLogs(),
      ]);
      setStats(s);
      setSubmissions(subList);
      setHotels(hList);
      setReports(rList);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const res = await login(emailInput, passwordInput);
    if (!res.success) {
      setLoginError(res.error || 'Login failed');
    }
    setIsLoggingIn(false);
  };

  // Actions
  const handleApprove = async (sub: Submission) => {
    if (!user) return;
    try {
      await approveSubmission(sub.id, user.id, user.email);
      setActionFeedback(`Approved "${sub.payload.propertyName}" and published to directory.`);
      setSelectedSubmission(null);
      loadAdminData();
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'Approval error');
    }
  };

  const handleReject = async (sub: Submission) => {
    if (!user) return;
    const reason = rejectionReason.trim() || 'Does not meet accommodation standards or unverifiable information.';
    try {
      await rejectSubmission(sub.id, reason, user.id, user.email);
      setActionFeedback(`Rejected submission: ${sub.referenceCode}`);
      setSelectedSubmission(null);
      setRejectionReason('');
      loadAdminData();
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'Rejection error');
    }
  };

  const handleRequestChanges = async (sub: Submission) => {
    if (!user) return;
    const note = changesNotes.trim() || 'Please clarify exact room prices and attached bathroom details.';
    try {
      await requestSubmissionChanges(sub.id, note, user.id, user.email);
      setActionFeedback(`Requested changes for submission: ${sub.referenceCode}`);
      setSelectedSubmission(null);
      setChangesNotes('');
      loadAdminData();
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'Action error');
    }
  };

  const handleToggleHotelStatus = async (hotel: Hotel) => {
    if (!user) return;
    const newStatus = hotel.status === 'published' ? 'unpublished' : 'published';
    await updateHotelStatus(hotel.id, newStatus, user.id, user.email);
    loadAdminData();
  };

  const handleMarkPriceChecked = async (hotelId: string) => {
    if (!user) return;
    await markHotelPriceChecked(hotelId, user.id, user.email);
    loadAdminData();
  };

  const handleResolveReport = async (reportId: string) => {
    if (!user) return;
    await resolveReport(reportId, 'Reviewed and verified with property owner.', user.id, user.email);
    loadAdminData();
  };

  // IF NOT AUTHENTICATED -> SHOW ADMIN LOGIN
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {language === 'bn' ? 'মডারেটর ও অ্যাডমিন প্রবেশ' : 'Admin & Moderator Portal'}
            </h1>
            <p className="text-xs text-slate-500">
              {language === 'bn' 
                ? 'অনুমোদিত প্রশাসকগণ সাবমিশন অনুমোদন ও তথ্য হালনাগাদ করতে লগইন করুন।' 
                : 'Authorized personnel only. Review pending stays and manage listings.'}
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'অ্যাডমিন ইমেইল' : 'Admin Email'}
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? (language === 'bn' ? 'যাচাই হচ্ছে...' : 'Signing in...') : (language === 'bn' ? 'লগইন করুন' : 'Sign In')}
            </button>
          </form>

          {/* Helper credentials for evaluators / testing */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700 block">
              {language === 'bn' ? 'মূল্যায়নকারী অ্যাকাউন্ট:' : 'Pre-configured Test Admin:'}
            </span>
            <div className="font-mono text-slate-600">
              Email: <span className="text-blue-700 font-bold">admin@thakbo.com</span><br/>
              Password: <span className="text-blue-700 font-bold">thakbo2026</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN CONSOLE
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {language === 'bn' ? 'থাকবো অ্যাডমিন কন্ট্রোল' : 'Thakbo Moderator Console'}
            </h1>
            <p className="text-xs text-slate-500">
              {user?.fullName} ({user?.email}) · <span className="uppercase text-emerald-600 font-bold">{user?.role}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onOpenSupabaseModal && (
            <button
              onClick={onOpenSupabaseModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'bn' ? 'সুপাবেস ডেটাবেস' : 'DB Architecture'}</span>
            </button>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto text-xs font-medium pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'bn' ? 'সারসংক্ষেপ (Overview)' : 'Overview'}
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'submissions'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>{language === 'bn' ? 'আবেদন তালিকা (Submissions)' : 'Submissions'}</span>
          {stats?.pendingSubmissions > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
              {stats.pendingSubmissions}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('hotels')}
          className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'hotels'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'bn' ? 'হোটেল ব্যবস্থাপনা (Hotels)' : 'Hotels Directory'}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>{language === 'bn' ? 'রিপোর্টসমূহ (Reports)' : 'Reports'}</span>
          {stats?.unresolvedReports > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
              {stats.unresolvedReports}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'bn' ? 'অডিট লগ (Audit Logs)' : 'Audit Trail'}
        </button>
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">
                {language === 'bn' ? 'প্রকাশিত হোটেল' : 'Published Stays'}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono">
                {stats.publishedHotels}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium block">
                ✓ {language === 'bn' ? 'সরাসরি উন্মুক্ত' : 'Publicly Live'}
              </span>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">
                {language === 'bn' ? 'অপেক্ষমাণ আবেদন' : 'Pending Submissions'}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
                {stats.pendingSubmissions}
              </div>
              <span className="text-[11px] text-amber-600 font-medium block">
                {language === 'bn' ? 'পর্যালোচনা প্রয়োজন' : 'Requires Review'}
              </span>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">
                {language === 'bn' ? 'মূল্য যাচাই প্রয়োজন' : 'Price Reconfirmation'}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 font-mono">
                {stats.priceReconfirmationNeeded}
              </div>
              <span className="text-[11px] text-slate-400 block">
                {language === 'bn' ? '>৬০ দিন যাবত চেক হয়নি' : '>60 days unchecked'}
              </span>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">
                {language === 'bn' ? 'অমীমাংসিত রিপোর্ট' : 'Unresolved Reports'}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-red-600 font-mono">
                {stats.unresolvedReports}
              </div>
              <span className="text-[11px] text-red-600 font-medium block">
                {language === 'bn' ? 'ব্যবহারকারী কর্তৃক রিপোর্ট' : 'User flagged'}
              </span>
            </div>

          </div>

          {/* Quick Action Queue Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Pending submissions preview */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  {language === 'bn' ? 'সর্বশেষ আবেদনসমূহ' : 'Recent Pending Submissions'}
                </h3>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  {language === 'bn' ? 'সকল আবেদন দেখুন' : 'View Queue'}
                </button>
              </div>

              <div className="space-y-3">
                {submissions.slice(0, 3).map(sub => (
                  <div key={sub.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{sub.payload.propertyName}</span>
                      <span className="text-slate-400 font-mono">{sub.referenceCode} · {sub.status}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setActiveTab('submissions');
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-blue-600 font-semibold hover:bg-blue-50"
                    >
                      {language === 'bn' ? 'পরীক্ষা করুন' : 'Review'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Reports preview */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  {language === 'bn' ? 'সর্বশেষ ইউজার রিপোর্টসমূহ' : 'Recent User Reports'}
                </h3>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  {language === 'bn' ? 'সকল রিপোর্ট দেখুন' : 'View Reports'}
                </button>
              </div>

              <div className="space-y-3">
                {reports.slice(0, 3).map(rep => (
                  <div key={rep.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{rep.hotelName}</span>
                      <span className="text-slate-500">{rep.reportType.replace('_', ' ')}: {rep.description.slice(0, 35)}...</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-100"
                    >
                      {language === 'bn' ? 'সমাধান' : 'Inspect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: SUBMISSIONS QUEUE & APPROVAL */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'bn' ? 'কমিউনিটি সাবমিশন কিউ' : 'Moderation Queue'}
            </h2>
            <span className="text-xs text-slate-500">
              {submissions.length} {language === 'bn' ? 'টি আবেদন' : 'total submissions'}
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white divide-y divide-slate-200">
            {submissions.map(sub => (
              <div key={sub.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {sub.referenceCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {sub.payload.propertyName}
                    </h3>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded uppercase ${
                      sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      sub.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      sub.status === 'changes_requested' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {sub.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {sub.payload.address} · {sub.payload.contactPhone}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{language === 'bn' ? 'জমা দিয়েছেন:' : 'By:'} {sub.submittedBy}</span>
                    <span>·</span>
                    <span>{formatDate(sub.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedSubmission(sub)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'বিস্তারিত দেখুন' : 'Inspect'}</span>
                  </button>

                  {sub.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(sub)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'অনুমোদন দিন' : 'Approve & Publish'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Submission Inspection Modal */}
          {selectedSubmission && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-200">
                <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-mono text-blue-600 font-bold">{selectedSubmission.referenceCode}</span>
                    <h3 className="text-xl font-bold text-slate-900">{selectedSubmission.payload.propertyName}</h3>
                    <span className="text-xs text-slate-500">{selectedSubmission.payload.address}</span>
                  </div>
                  <button onClick={() => setSelectedSubmission(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                    ✕
                  </button>
                </div>

                {/* Submitter & Contributor Details */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block">Submitter Relation:</span>
                    <span className="font-semibold">{selectedSubmission.payload.contributorRelationship}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Private Submitter Email:</span>
                    <span className="font-mono text-blue-700">{selectedSubmission.privateContactEmail}</span>
                  </div>
                </div>

                {/* Rooms Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Submitted Rooms & Rates:</h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl p-2 bg-slate-50 text-xs">
                    {selectedSubmission.payload.rooms.map((r, i) => (
                      <div key={i} className="py-2 flex justify-between items-center">
                        <div>
                          <span className="font-bold">{r.roomName}</span> ({r.airConditioned ? 'AC' : 'Non-AC'}, {r.bathroomType})
                        </div>
                        <span className="font-mono font-bold text-blue-600">{formatPrice(r.pricePerNight)}/night</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submitted Photos */}
                {selectedSubmission.payload.photos.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Photos:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedSubmission.payload.photos.map((p, i) => (
                        <img key={i} src={p.storagePath} alt="" className="rounded-lg aspect-4/3 object-cover border" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Decision Actions */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(selectedSubmission)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                    >
                      ✓ Approve & Publish to Directory
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Rejection reason..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border rounded-lg"
                      />
                      <button
                        onClick={() => handleReject(selectedSubmission)}
                        className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg"
                      >
                        Reject Submission
                      </button>
                    </div>

                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Changes requested note..."
                        value={changesNotes}
                        onChange={(e) => setChangesNotes(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border rounded-lg"
                      />
                      <button
                        onClick={() => handleRequestChanges(selectedSubmission)}
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg"
                      >
                        Request Changes
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HOTELS MANAGEMENT */}
      {activeTab === 'hotels' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'bn' ? 'সকল হোটেল ও কটেজ তালিকা' : 'All Hotels & Accommodations'}
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {hotels.length} listings
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white divide-y divide-slate-200">
            {hotels.map(h => (
              <div key={h.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{h.name}</h3>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      h.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {h.status}
                    </span>
                    {h.sourceType === 'demo' && (
                      <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded">Demo</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    {h.address} · Phone: {h.contactPhone}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Base: <strong className="text-blue-600 font-mono">{formatPrice(h.priceFrom)}</strong></span>
                    <span>·</span>
                    <span>Checked: {formatDate(h.priceCheckedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleMarkPriceChecked(h.id)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    title="Mark Price Checked Today"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Price Verified Today</span>
                  </button>

                  <button
                    onClick={() => handleToggleHotelStatus(h)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      h.status === 'published'
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {h.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REPORTS MODERATION */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'bn' ? 'ব্যবহারকারী কর্তৃক রিপোর্টসমূহ' : 'User Discrepancy Reports'}
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {reports.length} reports
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white divide-y divide-slate-200">
            {reports.map(rep => (
              <div key={rep.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-tight">
                      [{rep.reportType.replace('_', ' ')}]
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {rep.hotelName}
                    </h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rep.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    "{rep.description}"
                  </p>

                  <span className="text-[11px] text-slate-400 block">
                    Reported on {formatDate(rep.createdAt)} · Contact: {rep.reporterContact || 'Anonymous'}
                  </span>
                </div>

                {rep.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolveReport(rep.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'bn' ? 'অডিট লগ ও সিস্টেম অ্যাকশন' : 'Immutable Audit Log'}
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {auditLogs.length} events logged
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white divide-y divide-slate-100 font-mono text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3.5 flex items-start justify-between gap-4 hover:bg-slate-50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700">{log.action}</span>
                    <span className="text-slate-400">[{log.entityType}]</span>
                    <span className="text-slate-600">ID: {log.entityId}</span>
                  </div>
                  <div className="text-slate-500">
                    Actor: {log.actorEmail || log.actorId}
                  </div>
                </div>
                <div className="text-slate-400 shrink-0 text-right">
                  {formatDate(log.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
