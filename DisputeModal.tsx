import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';
import { Booking } from '../../types';
import { openDispute } from '../../services/disputeService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onSuccess: () => void;
}

export function DisputeModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: DisputeModalProps) {
  const { userProfile } = useAuth();
  const { showToast } = useToast();

  const [reason, setReason] = useState('Unsatisfactory Service / Workmanship');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isCustomer = userProfile?.id === booking.customerId;
  const role = isCustomer ? 'customer' : 'provider';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setError(null);
    setLoading(true);

    try {
      if (!description.trim()) {
        throw new Error('Please describe the dispute circumstances and what resolution you request.');
      }

      await openDispute({
        bookingId: booking.id,
        openedByUserId: userProfile.id,
        openedByRole: role,
        reason,
        description: description.trim(),
      });

      showToast('Dispute filed. The directory administrator has been notified for mediation.', 'warning');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to file dispute.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              File Formal Directory Dispute
            </div>
            <h2 className="text-lg font-bold mt-1">Mediation Request</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Booking: {booking.id} • {booking.serviceCategory}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
            Opening a dispute pauses the booking lifecycle and summons the directory operator to review communications, verify deposits, and determine if an administrative strike is warranted.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dispute Category *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="Unsatisfactory Service / Workmanship">Unsatisfactory Service / Workmanship</option>
              <option value="Deposit Disagreement / Refund Dispute">Deposit Disagreement / Refund Dispute</option>
              <option value="No-Show or Extreme Tardiness">No-Show or Extreme Tardiness</option>
              <option value="Scope or Price Change Without Approval">Scope or Price Change Without Approval</option>
              <option value="Unprofessional Conduct / Property Damage">Unprofessional Conduct / Property Damage</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description & Evidence Summary *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State what occurred, timeline of events, and what remedy you are seeking..."
              className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
