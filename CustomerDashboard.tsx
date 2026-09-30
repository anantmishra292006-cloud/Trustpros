import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Star,
  AlertTriangle,
  History,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../types';
import { getCustomerBookings } from '../services/bookingService';
import { StatusBadge } from '../components/common/StatusBadge';
import { BookingDetailModal } from '../components/booking/BookingDetailModal';
import { ReviewFormModal } from '../components/reviews/ReviewFormModal';
import { DisputeModal } from '../components/disputes/DisputeModal';

interface CustomerDashboardProps {
  onNavigate: (view: string, data?: any) => void;
}

export function CustomerDashboard({ onNavigate }: CustomerDashboardProps) {
  const { userProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [disputeBooking, setDisputeBooking] = useState<Booking | null>(null);

  const loadBookings = async () => {
    if (!userProfile) return;
    try {
      const list = await getCustomerBookings(userProfile.id);
      setBookings(list);
    } catch (err) {
      console.warn('Could not load customer bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [userProfile?.id]);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'active') {
      return b.status === 'requested' || b.status === 'confirmed';
    }
    if (activeTab === 'completed') {
      return b.status === 'completed';
    }
    if (activeTab === 'cancelled') {
      return (
        b.status === 'cancelled_by_customer' ||
        b.status === 'cancelled_by_provider' ||
        b.status === 'no_show_customer' ||
        b.status === 'no_show_provider' ||
        b.status === 'disputed'
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Service Bookings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track appointment progress, verify direct deposits, and submit reviews for completed work.
          </p>
        </div>

        <button
          onClick={() => onNavigate('directory')}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          Book Another Specialist
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold">
        {(['all', 'active', 'completed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition-colors relative cursor-pointer ${
              activeTab === tab
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {tab === 'all'
              ? `All Bookings (${bookings.length})`
              : tab === 'active'
              ? 'Upcoming & Requested'
              : tab === 'completed'
              ? 'Completed Services'
              : 'Past / Cancelled'}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={b.status} />
                  {b.depositPaid ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Deposit Paid
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Deposit Pending
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">#{b.id}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {b.providerBusinessName} • {b.serviceCategory}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    {b.appointmentDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    {b.appointmentTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    {b.serviceAddress}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap self-end md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(b)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  View Details & Audit Log
                </button>

                {/* Review button if completed */}
                {b.status === 'completed' && !b.hasReview && (
                  <button
                    type="button"
                    onClick={() => setReviewBooking(b)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Leave Review
                  </button>
                )}

                {/* Dispute button if applicable */}
                {b.status !== 'cancelled_by_customer' &&
                  b.status !== 'cancelled_by_provider' &&
                  b.status !== 'disputed' && (
                    <button
                      type="button"
                      onClick={() => setDisputeBooking(b)}
                      className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Dispute
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <CalendarCheck className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Bookings Found in This View
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You don't have any appointments matching this category. Need help with a home repair or commercial service?
          </p>
          <button
            onClick={() => onNavigate('directory')}
            className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs"
          >
            Find a Verified Specialist
          </button>
        </div>
      )}

      {/* Modals */}
      {selectedBooking && (
        <BookingDetailModal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          booking={selectedBooking}
          onRefresh={() => {
            loadBookings();
            setSelectedBooking(null);
          }}
          onOpenReviewModal={(b) => {
            setSelectedBooking(null);
            setReviewBooking(b);
          }}
          onOpenDisputeModal={(b) => {
            setSelectedBooking(null);
            setDisputeBooking(b);
          }}
        />
      )}

      {reviewBooking && (
        <ReviewFormModal
          isOpen={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          booking={reviewBooking}
          onSuccess={() => {
            loadBookings();
            setReviewBooking(null);
          }}
        />
      )}

      {disputeBooking && (
        <DisputeModal
          isOpen={!!disputeBooking}
          onClose={() => setDisputeBooking(null)}
          booking={disputeBooking}
          onSuccess={() => {
            loadBookings();
            setDisputeBooking(null);
          }}
        />
      )}
    </div>
  );
}
