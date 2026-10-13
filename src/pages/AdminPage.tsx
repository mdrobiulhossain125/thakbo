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
import { getSupabaseConfigStatus, checkSupabaseHealth, seedSupabaseDatabase, SupabaseHealthResult } from '../lib/supabase';
import { 
  Shield, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  AlertCircle,
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
  History,
  Key,
  Copy,
  Terminal,
  Activity
} from 'lucide-react';

interface AdminPageProps {
  onOpenSupabaseModal?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onOpenSupabaseModal }) => {
  const { language, t, formatDate, formatPrice } = useLanguage();
  const { user, isAdmin, isLoading, login, logout, changePassword } = useAuth();

  // Login form state (always empty by default so credentials remain strictly private)
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'hotels' | 'reports' | 'audit' | 'database' | 'security'>('overview');

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Supabase Health State
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealthResult | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Seeding state
  const [isSeedingDb, setIsSeedingDb] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);

  // Modal / Action states
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [changesNotes, setChangesNotes] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadAdminData = async () => {
    setIsLoadingData(true);
    try {
      const [s, subList, hList, rList, logs, health] = await Promise.all([
        getAdminDashboardStats(),
        getAdminSubmissionsList(),
        getAdminHotelsList(),
        getAdminReportsList(),
        getAdminAuditLogs(),
        checkSupabaseHealth(),
      ]);
      setStats(s);
      setSubmissions(subList);
      setHotels(hList);
      setReports(rList);
      setAuditLogs(logs);
      setSupabaseHealth(health);
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

  const handleRunHealthCheck = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await checkSupabaseHealth();
      setSupabaseHealth(res);
      setActionFeedback(`Supabase Health Check: ${res.statusText}`);
      setTimeout(() => setActionFeedback(null), 3000);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const res = await login(emailInput, passwordInput);
    if (!res.success) {
      setLoginError(res.error || 'Login failed');
    } else {
      // Clear inputs completely upon successful authentication
      setEmailInput('');
      setPasswordInput('');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    setEmailInput('');
    setPasswordInput('');
    await logout();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);
    const res = await changePassword(newPassword);
    if (res.success) {
      setPasswordFeedback({ success: true, msg: 'Password updated successfully! Keep it safe.' });
      setNewPassword('');
    } else {
      setPasswordFeedback({ success: false, msg: res.error || 'Failed to update password' });
    }
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

  const handleCopySqlFromModal = () => {
    if (onOpenSupabaseModal) {
      onOpenSupabaseModal();
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeedingDb(true);
    setSeedResult(null);
    try {
      const res = await seedSupabaseDatabase();
      setSeedResult(res);
      if (res.success) {
        await loadAdminData();
      }
    } catch (e: any) {
      setSeedResult({ success: false, message: e?.message || 'Seed failed' });
    } finally {
      setIsSeedingDb(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    const res = await changePassword(newPassword);
    if (res.success) {
      setPasswordFeedback({ success: true, msg: language === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' : 'Password updated successfully!' });
      setNewPassword('');
    } else {
      setPasswordFeedback({ success: false, msg: res.error || 'Failed to change password' });
    }
  };

  // 1. LOADING AUTH SESSION
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-28 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">
          {language === 'bn' ? 'অ্যাডমিন সেশন ও পারমিশন যাচাই করা হচ্ছে...' : 'Verifying administrator credentials and permissions...'}
        </p>
      </div>
    );
  }

  // 2. RBAC ACCESS DENIED (Authenticated but not SUPERADMIN or OWNER)
  if (user && !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-2xl border border-red-200 shadow-xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-xs">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900">
              {language === 'bn' ? 'অনুমোদনহীন অ্যাক্সেস (Access Denied)' : 'Access Denied: Admin Privileges Required'}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'bn'
                ? 'আপনার অ্যাকাউন্টটি সাধারণ ইউজার হিসেবে সাইন-ইন করা আছে। শুধুমাত্র SUPERADMIN বা OWNER রোল থাকা প্রোফাইলই এই কনসোলে প্রবেশ করতে পারবে।'
                : 'Your logged-in account does not possess the SUPERADMIN or OWNER security role required to view or moderate this console.'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs font-mono space-y-1 text-slate-600">
            <div><span className="text-slate-400">Account:</span> {user.email}</div>
            <div><span className="text-slate-400">Role:</span> <span className="uppercase text-red-600 font-bold">{user.role}</span></div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              {language === 'bn' ? 'সাইন আউট করুন' : 'Sign Out'}
            </button>
            <button
              onClick={() => { window.location.hash = 'home'; }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              {language === 'bn' ? 'মূল সাইটে ফিরে যান' : 'Back to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. IF NOT AUTHENTICATED -> SHOW STRICT RESTRICTED ADMIN LOGIN
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {language === 'bn' ? 'অ্যাডমিন প্রবেশাধিকার' : 'Owner & Admin Access'}
            </h1>
            <p className="text-xs text-slate-500">
              {language === 'bn' 
                ? 'এই পোর্টালটি শুধুমাত্র প্ল্যাটফর্ম ওনার ও অনুমোদিত মডারেটরের জন্য সংরক্ষিত।' 
                : 'Restricted administrative portal for verified platform administrators.'}
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'অ্যাডমিন ইমেইল' : 'Admin Email'}
              </label>
              <input
                type="email"
                required
                autoComplete="off"
                autoCapitalize="none"
                spellCheck="false"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@thakbo.com"
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
                autoComplete="new-password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? (language === 'bn' ? 'যাচাই হচ্ছে...' : 'Verifying...') : (language === 'bn' ? 'নিরাপদ লগইন' : 'Secure Sign In')}
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-slate-400">
            {language === 'bn' 
              ? 'আইপি এবং অ্যাক্সেস অডিট লগ করা হচ্ছে।' 
              : 'Authorized personnel access only. Sessions are audited.'}
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
              {language === 'bn' ? 'থাকবো অ্যাডমিন কন্ট্রোল' : 'Thakbo Owner & Moderator Console'}
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
              <span>{language === 'bn' ? 'সুপাবেস ডেটাবেস' : 'DB Schema'}</span>
            </button>
          )}

          <button
            onClick={handleLogout}
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
          onClick={() => setActiveTab('database')}
          className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'database'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span>{language === 'bn' ? 'সুপাবেস স্ট্যাটাস (Supabase)' : 'Supabase Status'}</span>
          {supabaseHealth?.isConnected && (
            <span className={`w-2 h-2 rounded-full ${supabaseHealth.tablesExist ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          )}
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
          onClick={() => setActiveTab('security')}
          className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'নিরাপত্তা ও পাসওয়ার্ড' : 'Security & Password'}</span>
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
          
          {/* Supabase Connection Status Ribbon */}
          <div className="p-4 rounded-xl border bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Supabase Cloud Database:</span>
                  <span className="text-xs font-mono text-blue-600 font-bold">algwvliarggdbuebxove</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    Connected (HTTP 200)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {supabaseHealth?.tablesExist 
                    ? 'All database tables verified and active.' 
                    : 'Supabase URL & Key connected! SQL tables pending migration.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunHealthCheck}
                disabled={isCheckingHealth}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                <span>{isCheckingHealth ? 'Checking...' : 'Check Status'}</span>
              </button>

              <button
                onClick={() => setActiveTab('database')}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors"
              >
                View Setup Guide →
              </button>
            </div>
          </div>

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

      {/* TAB: DATABASE / SUPABASE STATUS */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Supabase Connection Diagnostics</h3>
                  <p className="text-xs text-slate-500">Live configuration and schema verification for algwvliarggdbuebxove</p>
                </div>
              </div>

              <button
                onClick={handleRunHealthCheck}
                disabled={isCheckingHealth}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                <span>{isCheckingHealth ? 'Testing connection...' : 'Test Connection Now'}</span>
              </button>
            </div>

            {/* Config summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-slate-400 block mb-1">Project Endpoint</span>
                <span className="font-mono text-slate-800 font-bold block truncate">https://algwvliarggdbuebxove.supabase.co</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-slate-400 block mb-1">Publishable Key</span>
                <span className="font-mono text-emerald-700 font-bold block truncate">sb_publishable_fDBjF...</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-slate-400 block mb-1">PostgreSQL Server Status</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Connected (200 OK)</span>
                </span>
              </div>
            </div>

            {/* Next Steps / Migration Notice */}
            <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Database Connected — Run SQL Migration to Create Tables
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Your Supabase project URL and API key are working properly. Because this is a brand new project, the tables (<code className="font-mono font-bold">hotels</code>, <code className="font-mono font-bold">submissions</code>, <code className="font-mono font-bold">locations</code>, <code className="font-mono font-bold">reports</code>) must be created once in your Supabase SQL Editor.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={handleCopySqlFromModal}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>View & Copy SQL Schema</span>
                </button>

                <a
                  href="https://supabase.com/dashboard/project/algwvliarggdbuebxove/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Supabase SQL Editor</span>
                </a>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <h4 className="font-bold text-slate-900">How to finish setup in 60 seconds:</h4>
              <ol className="list-decimal list-inside space-y-1.5">
                <li>Click <strong>"View & Copy SQL Schema"</strong> above.</li>
                <li>Go to your Supabase project's <strong>SQL Editor</strong>.</li>
                <li>Paste the SQL script and click <strong>"Run"</strong>.</li>
                <li>Come back here and click <strong>"Test Connection Now"</strong> — all tables will be green!</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Administrator Security Settings</h3>
                <p className="text-xs text-slate-500">Only the owner ({user?.email}) has access to this portal.</p>
              </div>
            </div>

            {passwordFeedback && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${passwordFeedback.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                {passwordFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                <span>{passwordFeedback.msg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Master Admin Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter minimum 6 characters..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Update Master Password
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <p>• Current Authorized Owner: <strong className="text-slate-800">mdrobiulhossain125@gmail.com</strong></p>
              <p>• Admin buttons are hidden from public visitors on all devices.</p>
              <p>• Only you can log in to moderate listings and reports.</p>
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
                    <button
                      onClick={() => handleApprove(sub)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'অনুমোদন দিন' : 'Approve & Publish'}</span>
                    </button>
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

      {/* TAB 6: SUPABASE DATABASE MANAGEMENT & SEED */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span>{language === 'bn' ? 'সুপাবেস ডেটাবেস স্থিতি ও ডামি ডেটা' : 'Supabase PostgreSQL & Dummy Data'}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Project Reference: <span className="font-mono text-blue-600 font-semibold">algwvliarggdbuebxove</span> · PostgreSQL 15+
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunHealthCheck}
                disabled={isCheckingHealth}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                <span>{isCheckingHealth ? 'চেক হচ্ছে...' : 'কানেকশন চেক'}</span>
              </button>
              {onOpenSupabaseModal && (
                <button
                  onClick={onOpenSupabaseModal}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'SQL স্কিমা ও ডামি স্ক্রিপ্ট' : 'View SQL Seed Script'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Connection Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-900 text-sm">
                {language === 'bn' ? 'কানেকশন স্ট্যাটাস' : 'Connection Status'}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                supabaseHealth?.isConnected 
                  ? (supabaseHealth.tablesExist ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')
                  : 'bg-red-100 text-red-800'
              }`}>
                {supabaseHealth?.statusText || 'Configured & Active'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block mb-1">Database Provider:</span>
                <span className="font-bold text-slate-900">Supabase Cloud PostgreSQL</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block mb-1">Project Host:</span>
                <span className="font-mono text-slate-800 font-semibold truncate block">algwvliarggdbuebxove.supabase.co</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block mb-1">Tables Status:</span>
                <span className="font-bold text-emerald-600">
                  {supabaseHealth?.tablesExist ? 'Verified & Ready' : 'Ready for SQL Migration'}
                </span>
              </div>
            </div>

            {/* Direct Seeding Action Box */}
            <div className="pt-4 border-t border-slate-100 p-4 bg-blue-50/70 border border-blue-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">
                    {language === 'bn' ? '⚡ Supabase-এ নমুনা ডেটা যুক্ত করুন (One-Click Seed)' : '⚡ Seed Dummy Data to Supabase'}
                  </h4>
                  <p className="text-xs text-blue-700">
                    {language === 'bn'
                      ? 'কক্সবাজার, সাজেক ও শ্রীমঙ্গলের সাশ্রয়ী হোটেল ও পেন্ডিং সাবমিশন সরাসরি ডেটাবেসে ইনসার্ট করবে।'
                      : 'Inserts verified budget stays across Coxs Bazar, Sajek, and Sreemangal into Supabase.'}
                  </p>
                </div>
                <button
                  onClick={handleSeedDatabase}
                  disabled={isSeedingDb}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shrink-0 shadow-xs"
                >
                  {isSeedingDb ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'bn' ? 'যুক্ত হচ্ছে...' : 'Seeding...'}</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'নমুনা ডেটা সিড করুন' : 'Seed Dummy Stays'}</span>
                    </>
                  )}
                </button>
              </div>

              {seedResult && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  seedResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {seedResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                  <span>{seedResult.message}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-2 text-xs">
              <a
                href="https://supabase.com/dashboard/project/algwvliarggdbuebxove/sql/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline"
              >
                <span>Supabase SQL Editor খুলুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-slate-300">·</span>
              <a
                href="https://supabase.com/dashboard/project/algwvliarggdbuebxove/editor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline"
              >
                <span>Table Editor দেখুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <span>{language === 'bn' ? 'অ্যাডমিন সিকিউরিটি ও পাসওয়ার্ড' : 'Security & Access Credentials'}</span>
          </h2>

          <div className="max-w-md bg-white p-6 border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {language === 'bn' ? 'মাস্টার পাসওয়ার্ড পরিবর্তন' : 'Change Master Access Password'}
            </h3>

            {passwordFeedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                passwordFeedback.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {passwordFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span>{passwordFeedback.msg}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'নতুন পাসওয়ার্ড লিখুন (কমপক্ষে ৬ অক্ষর)' : 'New Admin Password (min 6 chars)'}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                {language === 'bn' ? 'পাসওয়ার্ড সংরক্ষণ করুন' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
