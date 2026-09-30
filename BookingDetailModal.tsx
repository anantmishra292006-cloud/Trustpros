import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  XCircle,
  AlertTriangle,
  Star,
  User,
  Phone,
  Mail,
  History,
  Check,
} from 'lucide-react';
import { Booking } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  customerMarkDepositPaid,
  providerConfirmBooking,
  markBookingCompleted,
  reportNoShow,
  cancelBooking,
} from '../../services/bookingService';
import { ConfirmModal } from '../common/ConfirmModal';

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onRefresh: () => void;
  onOpenReviewModal?: (booking: Booking) => void;
  onOpenDisputeModal?: (booking: Booking) => void;
}

export function BookingDetailModal({
  isOpen,
  onClose,
  booking,
  onRefresh,
  onOpenReviewModal,
  onOpenDisputeModal,
}: BookingDetailModalProps) {
  const { userProfile, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [confirmAction, setConfirmAction] = useState<{
    type: 'complete' | 'no_show_customer' | 'no_show_provider' | 'cancel';
    title: string;
    message: string;
  } | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentUserId = userProfile?.id;
  const isCustomer = currentUserId === booking.customerId;
  const isProvider = currentUserId === booking.providerUserId;
  const hasFullAccess = isCustomer || isProvider || isAdmin;

  // Actions
  const handleDepositPaid = async () => {
    try {
      setLoading(true);
      await customerMarkDepositPaid(booking.id);
      showToast('Deposit marked as paid! The provider has been notified to confirm.', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update deposit status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderConfirm = async () => {
    try {
      setLoading(true);
      await providerConfirmBooking(booking.id);
      showToast('Appointment confirmed! Customer has been notified.', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to confirm booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteConfirmedAction = async () => {
    if (!confirmAction) return;
    try {
      setLoading(true);
      const actor = isCustomer ? 'customer' : isProvider ? 'provider' : 'admin';

      if (confirmAction.type === 'complete') {
        await markBookingCompleted(booking.id, actor);
        showToast('Appointment marked completed!', 'success');
      } else if (confirmAction.type === 'no_show_customer') {
        await reportNoShow(booking.id, actor, 'customer');
        showToast('Reported customer no-show.', 'warning');
      } else if (confirmAction.type === 'no_show_provider') {
        await reportNoShow(booking.id, actor, 'provider');
        showToast('Reported provider no-show.', 'warning');
      } else if (confirmAction.type === 'cancel') {
        await cancelBooking(booking.id, actor, cancelReason || 'Cancelled by user');
        showToast('Booking cancelled.', 'info');
      }

      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to execute action', 'error');
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
        role="dialog"
        aria-modal="true"
      >
        <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge status={booking.status} />
                <span className="text-xs text-slate-400">ID: {booking.id}</span>
              </div>
              <h2 className="text-xl font-bold mt-2">
                {booking.serviceCategory} Appointment
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Provider: <strong>{booking.providerBusinessName}</strong> • Customer: <strong>{booking.customerName}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Quick appointment details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Date:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{booking.appointmentDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Time Slot:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{booking.appointmentTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Service Address:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{booking.serviceAddress}</span>
                </div>
              </div>
            </div>

            {/* Deposit Management Card */}
            <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">
                    Direct Commitment Deposit
                  </h4>
                </div>
                {booking.depositPaid ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Deposit Paid
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                    Deposit Pending
                  </span>
                )}
              </div>

              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                Deposits are handled directly through the provider's verified payment gateway (e.g. Stripe Payment Link). The platform operator never processes, collects, or holds funds.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                {booking.depositPaymentUrl ? (
                  <a
                    href={booking.depositPaymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Open Provider Deposit Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-500 italic">
                    Provider has not configured a direct deposit link yet.
                  </span>
                )}

                {/* Customer can mark paid */}
                {isCustomer && !booking.depositPaid && (
                  <button
                    type="button"
                    onClick={handleDepositPaid}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
                  >
                    I Have Paid the Deposit
                  </button>
                )}

                {/* Provider can confirm */}
                {(isProvider || isAdmin) && booking.status === 'requested' && (
                  <button
                    type="button"
                    onClick={handleProviderConfirm}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm Appointment & Slot
                  </button>
                )}
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Customer Job Notes
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {booking.notes}
                </div>
              </div>
            )}

            {/* Customer & Provider Contact info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Customer Contact
                </span>
                <div className="font-semibold text-slate-900 dark:text-white">{booking.customerName}</div>
                {booking.customerPhone && (
                  <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {booking.customerPhone}
                  </div>
                )}
                <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {booking.customerEmail}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Service Provider
                </span>
                <div className="font-semibold text-slate-900 dark:text-white">{booking.providerBusinessName}</div>
                <div className="text-slate-600 dark:text-slate-400 mt-0.5">Category: {booking.serviceCategory}</div>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            {hasFullAccess && (
              <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Appointment Controls
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Mark Completed: Can be done by customer, provider, or admin if confirmed */}
                  {booking.status === 'confirmed' && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmAction({
                          type: 'complete',
                          title: 'Mark Service Completed',
                          message:
                            'Confirm that the appointment took place and services were fulfilled as agreed?',
                        })
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Completed
                    </button>
                  )}

                  {/* Review: only customer of completed booking */}
                  {isCustomer && booking.status === 'completed' && !booking.hasReview && onOpenReviewModal && (
                    <button
                      type="button"
                      onClick={() => onOpenReviewModal(booking)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Leave Verified Review
                    </button>
                  )}

                  {/* Report No-Show */}
                  {(booking.status === 'requested' || booking.status === 'confirmed') && (
                    <>
                      {isProvider && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({
                              type: 'no_show_customer',
                              title: 'Report Customer No-Show',
                              message:
                                'Are you sure you want to flag that the customer was not present at the appointment location?',
                            })
                          }
                          className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs cursor-pointer"
                        >
                          Report Customer No-Show
                        </button>
                      )}

                      {isCustomer && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({
                              type: 'no_show_provider',
                              title: 'Report Provider No-Show',
                              message:
                                'Confirm that the service provider failed to arrive for the scheduled appointment? This will be recorded on their reliability log.',
                            })
                          }
                          className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950 font-semibold text-xs cursor-pointer"
                        >
                          Report Provider No-Show
                        </button>
                      )}
                    </>
                  )}

                  {/* Cancel Booking */}
                  {(booking.status === 'requested' || booking.status === 'confirmed') && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmAction({
                          type: 'cancel',
                          title: 'Cancel Booking',
                          message:
                            'Are you sure you want to cancel this booking? This action is permanent and will be recorded in the audit log.',
                        })
                      }
                      className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-rose-600 font-semibold text-xs cursor-pointer"
                    >
                      Cancel Appointment
                    </button>
                  )}

                  {/* Dispute: Can be opened by customer or provider if not resolved */}
                  {booking.status !== 'cancelled_by_customer' &&
                    booking.status !== 'cancelled_by_provider' &&
                    booking.status !== 'disputed' &&
                    onOpenDisputeModal && (
                      <button
                        type="button"
                        onClick={() => onOpenDisputeModal(booking)}
                        className="px-3 py-1.5 rounded-lg text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 font-semibold text-xs cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Open Dispute
                      </button>
                    )}
                </div>
              </div>
            )}

            {/* Audit Timeline */}
            <div>
              <div className="flex items-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <History className="w-4 h-4" />
                <span>Audit & Activity Timeline</span>
              </div>

              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {booking.timeline?.map((event, idx) => (
                  <div key={idx} className="relative flex items-start gap-3 pl-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-white dark:border-slate-900 flex items-center justify-center shrink-0 z-10 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                      {idx + 1}
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {event.action}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(event.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Actor: <strong className="capitalize">{event.actor}</strong>
                      </div>
                      {event.note && (
                        <p className="mt-1 text-slate-600 dark:text-slate-300 text-xs italic">
                          "{event.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmAction}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        isDestructive={confirmAction?.type !== 'complete'}
        onConfirm={handleExecuteConfirmedAction}
        onClose={() => setConfirmAction(null)}
      >
        {confirmAction?.type === 'cancel' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cancellation Reason *
            </label>
            <input
              type="text"
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule conflict, project postponed..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </ConfirmModal>
    </>
  );
}
