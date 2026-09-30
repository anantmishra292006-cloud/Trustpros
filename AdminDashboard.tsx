import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Briefcase,
  Calendar,
  AlertTriangle,
  FileCheck,
  Download,
  Settings,
  FileText,
  CheckCircle2,
  XCircle,
  Ban,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { useToast } from '../context/ToastContext';
import {
  ProviderProfile,
  Booking,
  Dispute,
  UserProfile,
  VerificationDocument,
} from '../types';
import {
  getAllProviders,
  adminApproveProvider,
  adminRejectProvider,
  adminSuspendProvider,
  adminIssueStrike,
  getVerificationDocument,
  recalculateReliabilityScore,
  loadSampleDemoProviders,
  removeSampleDemoProviders,
} from '../services/providerService';
import { getAllBookings } from '../services/bookingService';
import { getAllDisputes, adminResolveDispute } from '../services/disputeService';
import { getAllUsers, updateUserRole } from '../services/authService';
import { exportProvidersToCSV, exportBookingsToCSV } from '../services/csvExport';
import { StatusBadge } from '../components/common/StatusBadge';
import { ReliabilityBadge } from '../components/common/ReliabilityBadge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { BookingDetailModal } from '../components/booking/BookingDetailModal';
import { uploadFile } from '../services/storageService';

export function AdminDashboard() {
  const { userProfile } = useAuth();
  const { branding, updateBranding } = useBranding();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'queue' | 'providers' | 'bookings' | 'disputes' | 'users' | 'branding' | 'legal'
  >('overview');

  // Data states
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Verification document viewer modal
  const [viewingDoc, setViewingDoc] = useState<{
    provider: ProviderProfile;
    doc: VerificationDocument | null;
  } | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  // Reject modal
  const [rejectingProvider, setRejectingProvider] = useState<ProviderProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Strike modal
  const [strikingProvider, setStrikingProvider] = useState<ProviderProfile | null>(null);
  const [strikeReason, setStrikeReason] = useState('');

  // Dispute resolution modal
  const [resolvingDispute, setResolvingDispute] = useState<Dispute | null>(null);
  const [disputeNotes, setDisputeNotes] = useState('');
  const [disputeStrike, setDisputeStrike] = useState(false);

  // Selected booking modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Branding form state
  const [appName, setAppName] = useState(branding.appName);
  const [tagline, setTagline] = useState(branding.tagline);
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl);
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor);
  const [cityRegion, setCityRegion] = useState(branding.cityRegion);
  const [categories, setCategories] = useState<string[]>(branding.categories);
  const [newCatInput, setNewCatInput] = useState('');
  const [depositInstructions, setDepositInstructions] = useState(branding.globalDepositInstructions);
  const [savingBranding, setSavingBranding] = useState(false);

  // Legal form state
  const [terms, setTerms] = useState(branding.termsOfService);
  const [privacy, setPrivacy] = useState(branding.privacyPolicy);
  const [disclaimer, setDisclaimer] = useState(branding.escrowDisclaimer);
  const [savingLegal, setSavingLegal] = useState(false);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [provList, bList, dList, uList] = await Promise.all([
        getAllProviders(),
        getAllBookings(),
        getAllDisputes(),
        getAllUsers(),
      ]);
      setProviders(provList);
      setBookings(bList);
      setDisputes(dList);
      setUsers(uList);
    } catch (err) {
      console.warn('Error loading admin dashboard datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    setAppName(branding.appName);
    setTagline(branding.tagline);
    setLogoUrl(branding.logoUrl);
    setPrimaryColor(branding.primaryColor);
    setCityRegion(branding.cityRegion);
    setCategories(branding.categories);
    setDepositInstructions(branding.globalDepositInstructions);
    setTerms(branding.termsOfService);
    setPrivacy(branding.privacyPolicy);
    setDisclaimer(branding.escrowDisclaimer);
  }, [branding]);

  const [seeding, setSeeding] = useState(false);

  const hasDemoData = providers.some(
    (p) => p.businessName.startsWith('[DEMO]') || p.id.startsWith('prov_demo_')
  );

  const handleLoadSampleData = async () => {
    try {
      setSeeding(true);
      const count = await loadSampleDemoProviders();
      showToast(`Loaded ${count} clearly labeled [DEMO] specialists into Firestore!`, 'success');
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to load sample demo providers', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handleRemoveSampleData = async () => {
    try {
      setSeeding(true);
      const count = await removeSampleDemoProviders();
      showToast(`Removed ${count} sample demo listings from Firestore with 1 click.`, 'info');
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove sample demo providers', 'error');
    } finally {
      setSeeding(false);
    }
  };

  // Actions
  const handleApprove = async (providerId: string) => {
    try {
      await adminApproveProvider(providerId);
      showToast('Provider application approved and published!', 'success');
      loadAllData();
      if (viewingDoc) setViewingDoc(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to approve provider', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectingProvider) return;
    try {
      await adminRejectProvider(rejectingProvider.id, rejectionReason || 'Application rejected.');
      showToast('Provider application rejected.', 'info');
      setRejectingProvider(null);
      setRejectionReason('');
      loadAllData();
      if (viewingDoc) setViewingDoc(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to reject provider', 'error');
    }
  };

  const handleSuspend = async (providerId: string) => {
    try {
      await adminSuspendProvider(providerId, 'Suspended by directory administrator.');
      showToast('Provider has been suspended.', 'warning');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to suspend provider', 'error');
    }
  };

  const handleIssueStrike = async () => {
    if (!strikingProvider) return;
    try {
      const res = await adminIssueStrike(
        strikingProvider.id,
        strikeReason || 'Violation of directory reliability standard.'
      );
      if (res.suspended) {
        showToast(
          `Strike issued (3 total). Provider has been automatically suspended!`,
          'warning'
        );
      } else {
        showToast(`Strike issued. Total strikes: ${res.newStrikes}/3.`, 'info');
      }
      setStrikingProvider(null);
      setStrikeReason('');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to issue strike', 'error');
    }
  };

  const handleViewDocs = async (provider: ProviderProfile) => {
    setLoadingDoc(true);
    setViewingDoc({ provider, doc: null });
    try {
      const doc = await getVerificationDocument(provider.id);
      setViewingDoc({ provider, doc });
    } catch (err) {
      console.warn('Error fetching verification document:', err);
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!resolvingDispute || !userProfile) return;
    try {
      await adminResolveDispute({
        disputeId: resolvingDispute.id,
        adminUserId: userProfile.id,
        resolutionNotes: disputeNotes,
        issueStrikeToProvider: disputeStrike,
      });
      showToast('Dispute resolved.', 'success');
      setResolvingDispute(null);
      setDisputeNotes('');
      setDisputeStrike(false);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to resolve dispute', 'error');
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingBranding(true);
      await updateBranding({
        appName,
        tagline,
        logoUrl,
        primaryColor,
        cityRegion,
        categories,
        globalDepositInstructions: depositInstructions,
      });
      showToast('Branding and settings updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update branding settings', 'error');
    } finally {
      setSavingBranding(false);
    }
  };

  const handleSaveLegal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingLegal(true);
      await updateBranding({
        termsOfService: terms,
        privacyPolicy: privacy,
        escrowDisclaimer: disclaimer,
      });
      showToast('Legal pages updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update legal pages', 'error');
    } finally {
      setSavingLegal(false);
    }
  };

  const pendingProviders = providers.filter((p) => p.status === 'pending');
  const activeDisputes = disputes.filter((d) => d.status === 'open');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Community Operator Admin Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Directory Operator Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage provider credential approvals, bookings, disputes, white-label branding, and CSV exports.
          </p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportProvidersToCSV(providers)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Pros CSV
          </button>
          <button
            onClick={() => exportBookingsToCSV(bookings)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Bookings CSV
          </button>
          <button
            onClick={loadAllData}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            title="Refresh datasets"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'queue', label: `Approval Queue (${pendingProviders.length})`, alert: pendingProviders.length > 0 },
          { key: 'providers', label: `Providers (${providers.length})` },
          { key: 'bookings', label: `Bookings (${bookings.length})` },
          { key: 'disputes', label: `Disputes (${activeDisputes.length})`, alert: activeDisputes.length > 0 },
          { key: 'users', label: `Users (${users.length})` },
          { key: 'branding', label: 'Branding & Theme' },
          { key: 'legal', label: 'Legal Pages' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 whitespace-nowrap transition-colors relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <span>{tab.label}</span>
            {tab.alert && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Users</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {users.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Queue</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {pendingProviders.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Approved Pros</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {providers.filter((p) => p.status === 'approved').length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Bookings</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {bookings.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed Jobs</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {bookings.filter((b) => b.status === 'completed').length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Disputes</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {activeDisputes.length}
              </div>
            </div>
          </div>

          {/* Quick Actions & Demo Data Toggle */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-md border border-blue-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-800/80 text-blue-200 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Demo Provider Management</span>
              </div>
              <h3 className="text-base font-bold text-white">
                {hasDemoData ? 'Demo Sample Data Active' : 'Load Demo Provider Roster'}
              </h3>
              <p className="text-xs text-blue-200/80 max-w-xl">
                {hasDemoData
                  ? 'Sample demo specialist listings ([DEMO] Apex Plumbing, Lone Star Electric, etc.) are currently present in your directory database. You can remove them with one click at any time.'
                  : 'Add authentic, clearly labeled demo trade contractor profiles ([DEMO]) into Firestore to test search, directory filtering, bookings, and customer review flows.'}
              </p>
            </div>
            {hasDemoData ? (
              <button
                onClick={handleRemoveSampleData}
                disabled={seeding}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {seeding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Removing from database...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Demo Data (1-Click)</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleLoadSampleData}
                disabled={seeding}
                className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {seeding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Writing to database...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Load Sample Data</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Quick Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending approvals teaser */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pending Provider Verifications ({pendingProviders.length})
                </h3>
                <button
                  onClick={() => setActiveTab('queue')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  View Full Queue
                </button>
              </div>

              {pendingProviders.length > 0 ? (
                <div className="space-y-3">
                  {pendingProviders.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {p.businessName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.category} • {p.contactName}
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDocs(p)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs"
                      >
                        Inspect Docs
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  No pending provider packets to review right now!
                </div>
              )}
            </div>

            {/* Active disputes teaser */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Open Disputes ({activeDisputes.length})
                </h3>
                <button
                  onClick={() => setActiveTab('disputes')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  View All Disputes
                </button>
              </div>

              {activeDisputes.length > 0 ? (
                <div className="space-y-3">
                  {activeDisputes.slice(0, 3).map((d) => (
                    <div
                      key={d.id}
                      className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900 dark:text-rose-200">
                          {d.reason}
                        </span>
                        <span className="text-[10px] text-rose-500 uppercase font-semibold">
                          By {d.openedByRole}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                        "{d.description}"
                      </p>
                      <button
                        onClick={() => setResolvingDispute(d)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold text-[11px] shadow-xs"
                      >
                        Resolve Dispute
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  No active disputes filed. All services running smoothly.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPROVAL QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Provider Document Verification Queue
            </h2>
            <span className="text-xs text-slate-500">
              {pendingProviders.length} pending review
            </span>
          </div>

          {pendingProviders.length > 0 ? (
            <div className="space-y-4">
              {pendingProviders.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.status} />
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {p.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {p.businessName}
                    </h3>
                    <div className="text-xs text-slate-500">
                      Contact: {p.contactName} • {p.email} • {p.phone} • {p.serviceArea}
                    </div>
                    {p.bio && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 pt-1">
                        "{p.bio}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleViewDocs(p)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Inspect Verification Docs
                    </button>
                    <button
                      onClick={() => handleApprove(p.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      Approve & Publish
                    </button>
                    <button
                      onClick={() => setRejectingProvider(p)}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 text-xs font-semibold cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Queue is clear!
              </div>
              <p>No trade specialists are waiting for credentials approval.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALL PROVIDERS */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              All Registered Specialists ({providers.length})
            </h2>
            <button
              onClick={() => exportProvidersToCSV(providers)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Providers CSV
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Reliability</th>
                  <th className="p-3.5">Strikes</th>
                  <th className="p-3.5">Completed Jobs</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {providers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      <div>{p.businessName}</div>
                      <div className="text-[11px] font-normal text-slate-400">{p.email}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{p.category}</td>
                    <td className="p-3.5">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="p-3.5">
                      <ReliabilityBadge
                        score={p.reliabilityScore}
                        completedCount={p.completedBookingsCount}
                        size="sm"
                        showDetails={false}
                      />
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-bold ${
                          p.strikes >= 3
                            ? 'text-rose-600'
                            : p.strikes > 0
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {p.strikes} / 3
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                      {p.completedBookingsCount || 0}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDocs(p)}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                      >
                        Docs
                      </button>
                      {p.status === 'pending' && (
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold"
                        >
                          Approve
                        </button>
                      )}
                      {p.status === 'approved' && (
                        <button
                          onClick={() => handleSuspend(p.id)}
                          className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                        >
                          Suspend
                        </button>
                      )}
                      <button
                        onClick={() => setStrikingProvider(p)}
                        className="px-2.5 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold"
                        title="Issue formal administrative strike"
                      >
                        Strike
                      </button>
                      <button
                        onClick={async () => {
                          await recalculateReliabilityScore(p.id);
                          showToast('Score recomputed!', 'info');
                          loadAllData();
                        }}
                        className="px-2 py-1 text-slate-400 hover:text-slate-600"
                        title="Recalculate reliability score"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Platform Bookings ({bookings.length})
            </h2>
            <button
              onClick={() => exportBookingsToCSV(bookings)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Bookings CSV
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Deposit</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">{b.id}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {b.providerBusinessName}
                    </td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">
                      <div>{b.customerName}</div>
                      <div className="text-[10px] text-slate-400">{b.customerPhone}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      {b.appointmentDate} • {b.appointmentTime}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="p-3.5">
                      {b.depositPaid ? (
                        <span className="text-emerald-600 font-bold">Paid</span>
                      ) : (
                        <span className="text-amber-600 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DISPUTES */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Mediation & Disputes Log ({disputes.length})
          </h2>

          {disputes.length > 0 ? (
            <div className="space-y-4">
              {disputes.map((d) => (
                <div
                  key={d.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={d.status} />
                      <span className="text-xs font-mono text-slate-400">Booking: {d.bookingId}</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Opened: {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Reason: {d.reason}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    "{d.description}"
                  </p>

                  {d.status === 'resolved' && d.resolutionNotes && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs">
                      <strong>Admin Resolution:</strong> {d.resolutionNotes}
                      {d.strikeIssuedToProvider && (
                        <span className="block font-bold text-rose-600 mt-1">
                          • Formal strike issued to provider.
                        </span>
                      )}
                    </div>
                  )}

                  {d.status !== 'resolved' && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setResolvingDispute(d)}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
                      >
                        Resolve Dispute & Issue Findings
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No disputes on file.
            </div>
          )}
        </div>
      )}

      {/* TAB 6: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            User Accounts & Role Permissions ({users.length})
          </h2>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Current Role</th>
                  <th className="p-3.5">Date Joined</th>
                  <th className="p-3.5 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {u.displayName || 'No Name'}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : u.role === 'provider'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <select
                        value={u.role}
                        onChange={async (e) => {
                          const newR = e.target.value as any;
                          await updateUserRole(u.id, newR);
                          showToast(`Role updated to ${newR}`, 'success');
                          loadAllData();
                        }}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value="customer">customer</option>
                        <option value="provider">provider</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: BRANDING & SETTINGS */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSaveBranding} className="space-y-6 max-w-3xl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              White-Label Directory Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Directory App Name *
                </label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target City & Metro Region *
                </label>
                <input
                  type="text"
                  required
                  value={cityRegion}
                  onChange={(e) => setCityRegion(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Homepage Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Theme Color (Hex or CSS)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor.startsWith('#') ? primaryColor : '#2563eb'}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Logo URL (optional)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Global Deposit Instructions
                </label>
                <textarea
                  rows={3}
                  value={depositInstructions}
                  onChange={(e) => setDepositInstructions(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Categories Management */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Curated Trade Categories ({categories.length})
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                placeholder="Add category (e.g. Garage Doors, Solar Panels)..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => {
                  if (newCatInput.trim() && !categories.includes(newCatInput.trim())) {
                    setCategories([...categories, newCatInput.trim()]);
                    setNewCatInput('');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {categories.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <span>{c}</span>
                  <button
                    type="button"
                    onClick={() => setCategories(categories.filter((cat) => cat !== c))}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={savingBranding}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2"
          >
            {savingBranding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Branding Configuration
          </button>
        </form>
      )}

      {/* TAB 8: LEGAL PAGES */}
      {activeTab === 'legal' && (
        <form onSubmit={handleSaveLegal} className="space-y-6 max-w-3xl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Legal Pages & Escrow Disclaimers
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Not An Escrow Service & Independent Contractor Disclaimer *
              </label>
              <textarea
                rows={5}
                required
                value={disclaimer}
                onChange={(e) => setDisclaimer(e.target.value)}
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Terms of Service
              </label>
              <textarea
                rows={6}
                required
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Privacy Policy
              </label>
              <textarea
                rows={6}
                required
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 leading-relaxed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingLegal}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2"
          >
            {savingLegal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Legal Policy Text
          </button>
        </form>
      )}

      {/* Verification Document Viewer Modal */}
      {viewingDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
        >
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Verification Credentials: {viewingDoc.provider.businessName}
                </h3>
                <p className="text-xs text-slate-500">
                  Contact: {viewingDoc.provider.contactName} • {viewingDoc.provider.email}
                </p>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {loadingDoc ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                Fetching private documents...
              </div>
            ) : viewingDoc.doc ? (
              <div className="space-y-4">
                {/* Government ID */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      1. Government-Issued Photo ID
                    </span>
                    <a
                      href={viewingDoc.doc.idDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                    >
                      <span>Open Full Size</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  {viewingDoc.doc.idDocumentUrl.startsWith('data:image') ||
                  viewingDoc.doc.idDocumentUrl.includes('.jpg') ||
                  viewingDoc.doc.idDocumentUrl.includes('.png') ? (
                    <img
                      src={viewingDoc.doc.idDocumentUrl}
                      alt="ID Document"
                      className="max-h-48 rounded-xl border object-contain bg-white"
                    />
                  ) : (
                    <div className="text-xs text-slate-500">
                      Document uploaded (PDF / file link available above).
                    </div>
                  )}
                </div>

                {/* Trade License */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        2. Trade / Contractor License Document
                      </span>
                      {viewingDoc.doc.licenseNumber && (
                        <span className="text-[11px] text-slate-500 font-mono">
                          Registration #: {viewingDoc.doc.licenseNumber}
                        </span>
                      )}
                    </div>
                    <a
                      href={viewingDoc.doc.licenseDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                    >
                      <span>Open Full Size</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Insurance Document */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        3. Certificate of General Liability Insurance
                      </span>
                      {viewingDoc.doc.insuranceProvider && (
                        <span className="text-[11px] text-slate-500 font-mono">
                          Carrier / Policy: {viewingDoc.doc.insuranceProvider}
                        </span>
                      )}
                    </div>
                    <a
                      href={viewingDoc.doc.insuranceDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                    >
                      <span>Open Full Size</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setRejectingProvider(viewingDoc.provider);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold"
                  >
                    Reject Packet
                  </button>
                  <button
                    onClick={() => handleApprove(viewingDoc.provider.id)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                  >
                    Approve & Verify
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-6">
                No verification document on file for this provider.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <ConfirmModal
        isOpen={!!rejectingProvider}
        title="Reject Specialist Application"
        message={`Are you sure you want to reject the application for ${rejectingProvider?.businessName}? Please provide a reason to display to the provider.`}
        confirmText="Confirm Rejection"
        onConfirm={handleReject}
        onClose={() => setRejectingProvider(null)}
      >
        <textarea
          rows={3}
          required
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="e.g. Trade license number could not be verified on state registry..."
          className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
        />
      </ConfirmModal>

      {/* Strike Modal */}
      <ConfirmModal
        isOpen={!!strikingProvider}
        title="Issue Administrative Strike"
        message={`Issue a formal strike against ${strikingProvider?.businessName}? (Current strikes: ${strikingProvider?.strikes}/3). Reaching 3 strikes will automatically suspend the provider.`}
        confirmText="Issue Strike"
        onConfirm={handleIssueStrike}
        onClose={() => setStrikingProvider(null)}
      >
        <textarea
          rows={3}
          required
          value={strikeReason}
          onChange={(e) => setStrikeReason(e.target.value)}
          placeholder="State reason (e.g. Unjustified no-show, improper deposit demand)..."
          className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
        />
      </ConfirmModal>

      {/* Resolve Dispute Modal */}
      {resolvingDispute && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
        >
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Resolve Dispute: #{resolvingDispute.id}
            </h3>
            <p className="text-xs text-slate-500">
              Reason: <strong>{resolvingDispute.reason}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Administrative Findings & Resolution Notes *
              </label>
              <textarea
                rows={4}
                required
                value={disputeNotes}
                onChange={(e) => setDisputeNotes(e.target.value)}
                placeholder="State your findings and outcome for both parties..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200">
              <input
                type="checkbox"
                id="strikeProv"
                checked={disputeStrike}
                onChange={(e) => setDisputeStrike(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="strikeProv" className="font-semibold cursor-pointer">
                Issue a penalty strike to the service provider for this infraction
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResolvingDispute(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveDispute}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white"
              >
                Mark Dispute Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          booking={selectedBooking}
          onRefresh={() => {
            loadAllData();
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}
