import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  AlertTriangle,
  Star,
  CheckCircle2,
  DollarSign,
  AlertOctagon,
  XCircle,
  Save,
  Loader2,
  Power,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ProviderProfile, Booking } from '../types';
import { getProviderByUserId, updateProviderProfile } from '../services/providerService';
import { getProviderBookings } from '../services/bookingService';
import { ReliabilityBadge } from '../components/common/ReliabilityBadge';
import { RatingStars } from '../components/common/RatingStars';
import { StatusBadge } from '../components/common/StatusBadge';
import { BookingDetailModal } from '../components/booking/BookingDetailModal';
import { DisputeModal } from '../components/disputes/DisputeModal';

interface ProviderDashboardProps {
  onNavigate: (view: string, data?: any) => void;
}

export function ProviderDashboard({ onNavigate }: ProviderDashboardProps) {
  const { userProfile, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Deposit link quick update
  const [depositUrlInput, setDepositUrlInput] = useState('');
  const [savingDepositUrl, setSavingDepositUrl] = useState(false);

  // Selected booking modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [disputeBooking, setDisputeBooking] = useState<Booking | null>(null);

  const loadData = async () => {
    if (!userProfile) return;
    try {
      const p = await getProviderByUserId(userProfile.id);
      setProvider(p);
      if (p) {
        setDepositUrlInput(p.depositPaymentUrl || '');
        const bList = await getProviderBookings(p.id);
        setBookings(bList);
      }
    } catch (err) {
      console.warn('Error loading provider dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userProfile?.id]);

  const handleToggleAvailability = async () => {
    if (!provider) return;
    try {
      const newVal = !provider.isAvailable;
      await updateProviderProfile(provider.id, { isAvailable: newVal });
      setProvider({ ...provider, isAvailable: newVal });
      showToast(
        newVal ? 'Availability turned ON (accepting new jobs)' : 'Availability turned OFF (paused)',
        'info'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update availability', 'error');
    }
  };

  const handleSaveDepositLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    try {
      setSavingDepositUrl(true);
      await updateProviderProfile(provider.id, { depositPaymentUrl: depositUrlInput.trim() });
      setProvider({ ...provider, depositPaymentUrl: depositUrlInput.trim() });
      showToast('Deposit payment link updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update deposit link', 'error');
    } finally {
      setSavingDepositUrl(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-xs text-slate-500">Loading specialist portal...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Provider Profile Not Found
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            You do not have an active trade professional profile attached to this account yet.
          </p>
          <button
            onClick={() => onNavigate('provider_signup')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs"
          >
            Submit Specialist Application
          </button>
        </div>
      </div>
    );
  }

  const requestedBookings = bookings.filter((b) => b.status === 'requested');
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Status Warning Banner */}
      {provider.status === 'pending' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-sm">Application Under Review</div>
            <p className="leading-relaxed">
              Your government ID, trade license, and proof of insurance have been submitted to the operator approval queue. Once verified by directory management, your listing will go live to customers across your service area.
            </p>
          </div>
        </div>
      )}

      {provider.status === 'rejected' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-sm">Application Rejected by Operator</div>
            <p className="leading-relaxed">
              Reason provided: <strong>{provider.rejectionReason || 'Incomplete credentials or invalid documentation.'}</strong>
            </p>
          </div>
        </div>
      )}

      {provider.status === 'suspended' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-sm">Listing Suspended</div>
            <p className="leading-relaxed">
              {provider.rejectionReason || 'This profile has accrued 3 strikes or was suspended by platform administration.'}
            </p>
          </div>
        </div>
      )}

      {/* Header with quick stats */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge status={provider.status} />
              <span className="text-xs text-slate-500">{provider.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              {provider.businessName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Contact: {provider.contactName} • {provider.phone} • {provider.serviceArea}
            </p>
          </div>

          {/* Availability Switch */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={handleToggleAvailability}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                provider.isAvailable
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}
            >
              <Power className="w-4 h-4" />
            </button>
            <div className="text-xs">
              <div className="font-bold text-slate-900 dark:text-white">
                {provider.isAvailable ? 'Accepting Jobs' : 'Paused / Unavailable'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Visible in public directory
              </div>
            </div>
          </div>
        </div>

        {/* Reliability & Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Reliability Score
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {provider.reliabilityScore}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Based on completed vs no-show bookings
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Completed Jobs
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {provider.completedBookingsCount || 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Verified completed work</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Active Strikes
            </span>
            <div
              className={`text-xl font-black mt-1 ${
                provider.strikes > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {provider.strikes} / 3
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {provider.strikes >= 3 ? 'Auto-suspended' : '3 strikes auto-suspends'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Customer Rating
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{provider.averageRating?.toFixed(1) || '5.0'}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {provider.reviewCount || 0} verified reviews
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Payment Link / Deposit Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Direct Commitment Deposit Link
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Provide your Stripe Payment Link (or external payment URL). When customers request an appointment, this link is provided directly to them to submit the required deposit.
        </p>

        <form onSubmit={handleSaveDepositLink} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={depositUrlInput}
            onChange={(e) => setDepositUrlInput(e.target.value)}
            placeholder="https://buy.stripe.com/..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={savingDepositUrl}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {savingDepositUrl ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Link</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Incoming Requests Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Incoming Appointment Requests ({requestedBookings.length})
        </h2>

        {requestedBookings.length > 0 ? (
          <div className="space-y-3">
            {requestedBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-blue-200 dark:border-blue-900 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    {b.depositPaid ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Customer Reported Deposit Paid
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Deposit Unpaid
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {b.customerName} • {b.appointmentDate} ({b.appointmentTime})
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Location: {b.serviceAddress} • Phone: {b.customerPhone}
                  </div>
                  {b.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1">
                      "{b.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
                  >
                    Review & Confirm Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No pending incoming requests at the moment.
          </div>
        )}
      </div>

      {/* Confirmed Schedule Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Confirmed Appointments ({confirmedBookings.length})
        </h2>

        {confirmedBookings.length > 0 ? (
          <div className="space-y-3">
            {confirmedBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    <span className="text-xs text-slate-400">#{b.id}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {b.customerName} • {b.appointmentDate} at {b.appointmentTime}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {b.serviceAddress} • {b.customerPhone}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    View Appointment Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No confirmed appointments scheduled.
          </div>
        )}
      </div>

      {/* Completed History Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Completed Services ({completedBookings.length})
        </h2>

        {completedBookings.length > 0 ? (
          <div className="space-y-3">
            {completedBookings.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {b.customerName} • {b.appointmentDate}
                  </div>
                  <div className="text-slate-500 text-[11px]">{b.serviceAddress}</div>
                </div>
                <button
                  onClick={() => setSelectedBooking(b)}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Audit Log
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No completed services recorded yet.
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedBooking && (
        <BookingDetailModal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          booking={selectedBooking}
          onRefresh={() => {
            loadData();
            setSelectedBooking(null);
          }}
          onOpenDisputeModal={(b) => {
            setSelectedBooking(null);
            setDisputeBooking(b);
          }}
        />
      )}

      {disputeBooking && (
        <DisputeModal
          isOpen={!!disputeBooking}
          onClose={() => setDisputeBooking(null)}
          booking={disputeBooking}
          onSuccess={() => {
            loadData();
            setDisputeBooking(null);
          }}
        />
      )}
    </div>
  );
}
