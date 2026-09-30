import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, FileText, ExternalLink, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { ProviderProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { useToast } from '../../context/ToastContext';
import { createBooking } from '../../services/bookingService';
import { sanitizeText, isValidPhone } from '../../utils/sanitize';
import { checkRateLimit, recordAttempt } from '../../utils/rateLimiter';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ProviderProfile;
  onSuccess: (bookingId: string) => void;
  onOpenAuth: () => void;
}

export function BookingModal({
  isOpen,
  onClose,
  provider,
  onSuccess,
  onOpenAuth,
}: BookingModalProps) {
  const { userProfile, firebaseUser } = useAuth();
  const { branding } = useBranding();
  const { showToast } = useToast();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // If user is not signed in, prompt authentication
  if (!firebaseUser || !userProfile) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
        role="dialog"
      >
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Sign In to Request Appointment
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            To book a verified service appointment with <strong>{provider.businessName}</strong>, please sign in or create your customer account.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Rate limiting check
    const rateCheck = checkRateLimit(`booking_${userProfile.id}`, 6, 300);
    if (!rateCheck.allowed) {
      setError(`Too many requests sent. Please wait ${rateCheck.remainingSeconds}s before booking again.`);
      return;
    }

    setLoading(true);

    try {
      if (!date || !time) {
        throw new Error('Please pick an appointment date and preferred time slot.');
      }

      const cleanAddress = sanitizeText(serviceAddress);
      if (!cleanAddress || cleanAddress.length < 5) {
        throw new Error('Please enter a valid service location address.');
      }

      const cleanNotes = sanitizeText(notes);
      const cleanPhone = sanitizeText(customerPhone);

      recordAttempt(`booking_${userProfile.id}`, 300);

      const booking = await createBooking({
        customerId: userProfile.id,
        customerName: userProfile.displayName || firebaseUser.email || 'Customer',
        customerEmail: userProfile.email,
        customerPhone: cleanPhone,
        providerId: provider.id,
        providerUserId: provider.userId,
        providerBusinessName: provider.businessName,
        serviceCategory: provider.category,
        appointmentDate: date,
        appointmentTime: time,
        serviceAddress: cleanAddress,
        notes: cleanNotes,
        depositPaymentUrl: provider.depositPaymentUrl || '',
      });

      showToast('Booking request submitted! The provider has been notified.', 'success');
      onSuccess(booking.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit booking request.');
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
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="text-xs uppercase font-semibold text-blue-400 tracking-wider">
              Request Service Booking
            </div>
            <h2 className="text-xl font-bold mt-0.5">{provider.businessName}</h2>
            <p className="text-xs text-slate-300 mt-1">
              Category: {provider.category} • {provider.serviceArea}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Deposit Notice Banner */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              Direct Deposit Policy
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
              {branding.globalDepositInstructions}
            </p>
            {provider.depositPaymentUrl && (
              <p className="text-[11px] font-semibold text-blue-900 dark:text-blue-200 pt-1">
                ✓ Provider deposit link is verified and ready. You will be able to mark deposit paid directly after submitting.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Appointment Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Time Slot *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a time window</option>
                  <option value="Morning (8:00 AM - 11:00 AM)">Morning (8:00 AM - 11:00 AM)</option>
                  <option value="Midday (11:00 AM - 2:00 PM)">Midday (11:00 AM - 2:00 PM)</option>
                  <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM - 5:00 PM)</option>
                  <option value="Evening (5:00 PM - 7:00 PM)">Evening (5:00 PM - 7:00 PM)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Phone Number *
            </label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="(512) 555-0199"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Service Location Address *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={serviceAddress}
                onChange={(e) => setServiceAddress(e.target.value)}
                placeholder="1204 Congress Ave, Austin, TX 78701"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Job Description & Problem Details
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the issue, relevant model numbers, access instructions, or specific repairs required..."
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
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Submit Booking Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
