import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  CheckCircle,
  FileCheck,
  Shield,
  Calendar,
  Star,
  ExternalLink,
  DollarSign,
  Phone,
  Mail,
  ShieldCheck,
  Clock,
  Award,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react';
import { ProviderProfile, Review, VerificationDocument } from '../types';
import { RatingStars } from '../components/common/RatingStars';
import { ReliabilityBadge } from '../components/common/ReliabilityBadge';
import { getProviderReviews } from '../services/reviewService';
import { getVerificationDocument } from '../services/providerService';
import { useBranding } from '../context/BrandingContext';

interface ProviderDetailPageProps {
  provider: ProviderProfile;
  onBack: () => void;
  onRequestBooking: (provider: ProviderProfile) => void;
}

export function ProviderDetailPage({
  provider,
  onBack,
  onRequestBooking,
}: ProviderDetailPageProps) {
  const { branding } = useBranding();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [vDoc, setVDoc] = useState<VerificationDocument | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [reviewsList, doc] = await Promise.all([
          getProviderReviews(provider.id),
          getVerificationDocument(provider.id),
        ]);
        setReviews(reviewsList);
        setVDoc(doc);
      } catch (err) {
        console.warn('Could not load provider details supplementary data:', err);
      } finally {
        setLoadingReviews(false);
      }
    }
    loadData();
  }, [provider.id]);

  const servicesList = provider.services || [provider.category];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Specialist Directory</span>
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              {provider.photoUrl ? (
                <img
                  src={provider.photoUrl}
                  alt={provider.businessName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-3xl font-black flex items-center justify-center shadow-xs uppercase">
                  {provider.businessName.slice(0, 2)}
                </div>
              )}
              {/* Availability Indicator */}
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 shadow-2xs ${
                  provider.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
                title={provider.isAvailable ? 'Available & accepting bookings' : 'Currently paused'}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  {provider.category}
                </span>
                {provider.isAvailable ? (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Accepting New Bookings
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    Currently Unavailable
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {provider.businessName}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Coverage: {provider.serviceArea || branding.cityRegion}</span>
                </div>
                {provider.yearsInBusiness && (
                  <div className="flex items-center gap-1 font-medium">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{provider.yearsInBusiness} Years Experience</span>
                  </div>
                )}
                {provider.responseTime && (
                  <div className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Responds {provider.responseTime}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking CTA button */}
          <button
            onClick={() => onRequestBooking(provider)}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Calendar className="w-4 h-4" />
            <span>Request Appointment</span>
          </button>
        </div>

        {/* Ratings, Reliability, and Direct Contact Bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <RatingStars
              rating={provider.averageRating || 5.0}
              showCount
              count={provider.reviewCount || 0}
              size="md"
            />
            <ReliabilityBadge
              score={provider.reliabilityScore}
              completedCount={provider.completedBookingsCount}
              strikes={provider.strikes}
              size="md"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            {provider.phone && (
              <span className="flex items-center gap-1 font-medium">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                {provider.phone}
              </span>
            )}
            {provider.email && (
              <span className="flex items-center gap-1 font-medium">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                {provider.email}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Details, Verification, and Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: About & Services Offered */}
        <div className="md:col-span-2 space-y-6">
          {/* About */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              About This Trade Specialist
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {provider.bio ||
                'Vetted local specialist dedicated to punctuality, clean workmanship, and fair transparent pricing across our service area.'}
            </p>
          </div>

          {/* Services Offered List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Services Offered
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {servicesList.map((service, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium"
                >
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Pillar Verification Status Details */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Credential Verification Breakdown
              </h2>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Fully Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Identity Verified */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Identity Verified</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  Government photo ID & principal identity matched against directory records.
                </p>
              </div>

              {/* License Verified */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>License Verified</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  {vDoc?.licenseNumber ? (
                    <>Reg #: <strong>{vDoc.licenseNumber}</strong></>
                  ) : (
                    'State trade contractor license inspected for active standing.'
                  )}
                </p>
              </div>

              {/* Insurance Verified */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Insured</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  {vDoc?.insuranceProvider ? (
                    <>Carrier: <strong>{vDoc.insuranceProvider}</strong></>
                  ) : (
                    'Commercial general liability policy certificate verified.'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Verified Customer Reviews ({reviews.length})
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Only customers with completed appointments can publish reviews.
                </p>
              </div>
              <RatingStars rating={provider.averageRating || 5.0} size="sm" />
            </div>

            {loadingReviews ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {rev.customerName}
                        </span>
                        <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                          Verified Completed Service
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <RatingStars rating={rev.rating} size="sm" />

                    {rev.title && (
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {rev.title}
                      </div>
                    )}
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                No customer reviews posted yet. Be the first to book and review this verified specialist!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Deposit instructions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pricing & Rate Structure
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Standard Hourly Rate
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {provider.hourlyRate ? `$${provider.hourlyRate}/hr` : 'Custom Quote'}
              </div>
            </div>

            {provider.flatRateDescription && (
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Diagnostic & Flat-Rate Policy:
                </span>
                <p className="leading-relaxed">{provider.flatRateDescription}</p>
              </div>
            )}

            <button
              onClick={() => onRequestBooking(provider)}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Request Appointment Slot</span>
            </button>
          </div>

          {/* Deposit policy card */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 rounded-3xl p-6 border border-blue-200 dark:border-blue-900 shadow-xs space-y-3 text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Commitment Deposit Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
              {branding.globalDepositInstructions}
            </p>
            {provider.depositPaymentUrl && (
              <div className="pt-1">
                <a
                  href={provider.depositPaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>Preview Provider's Direct Payment Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
