import React from 'react';
import {
  MapPin,
  CheckCircle,
  FileCheck,
  Shield,
  Clock,
  ArrowRight,
  DollarSign,
  Briefcase,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import { ProviderProfile } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { ReliabilityBadge } from '../common/ReliabilityBadge';

interface ProviderCardProps {
  provider: ProviderProfile;
  onSelect: (provider: ProviderProfile) => void;
  onRequestBooking: (provider: ProviderProfile) => void;
}

export function ProviderCard({
  provider,
  onSelect,
  onRequestBooking,
}: ProviderCardProps) {
  const servicesList = provider.services || [provider.category];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col group overflow-hidden">
      {/* Optional Cover Banner */}
      {provider.coverImageUrl && (
        <div className="h-28 w-full overflow-hidden relative">
          <img
            src={provider.coverImageUrl}
            alt={`${provider.businessName} cover`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-4">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
              {provider.category}
            </span>
          </div>
        </div>
      )}

      {/* Main Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Header: Photo, Name, Category */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            {provider.photoUrl ? (
              <img
                src={provider.photoUrl}
                alt={provider.businessName}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-black uppercase shadow-xs">
                {provider.businessName.slice(0, 2)}
              </div>
            )}

            {/* Availability Dot */}
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-2xs ${
                provider.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
              title={provider.isAvailable ? 'Accepting appointment requests' : 'Currently paused'}
            />
          </div>

          <div className="flex-1 min-w-0">
            {!provider.coverImageUrl && (
              <div className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 mb-1">
                {provider.category}
              </div>
            )}

            <h3
              onClick={() => onSelect(provider)}
              className="text-base font-bold text-slate-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
            >
              {provider.businessName}
            </h3>

            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-500" />
              <span className="truncate">{provider.serviceArea || 'Metro Service Area'}</span>
            </div>

            {/* Quick Meta: Years in business & Response time */}
            <div className="flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex-wrap">
              {provider.yearsInBusiness && (
                <span className="inline-flex items-center gap-1 font-medium">
                  <Award className="w-3 h-3 text-amber-500" />
                  {provider.yearsInBusiness} yrs in business
                </span>
              )}
              {provider.responseTime && (
                <span className="inline-flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-blue-500" />
                  {provider.responseTime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Ratings & Reliability Score Bar */}
        <div className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <RatingStars
            rating={provider.averageRating || 5.0}
            showCount
            count={provider.reviewCount || 0}
            size="sm"
          />
          <ReliabilityBadge
            score={provider.reliabilityScore}
            completedCount={provider.completedBookingsCount}
            strikes={provider.strikes}
            size="sm"
          />
        </div>

        {/* Bio Excerpt */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {provider.bio || 'Curated independent specialist providing vetted, accountable local trade services.'}
        </p>

        {/* Services Offered Chips */}
        {servicesList.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Specialized Services
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-12 overflow-hidden">
              {servicesList.slice(0, 3).map((srv, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 truncate max-w-[140px]"
                >
                  {srv}
                </span>
              ))}
              {servicesList.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800">
                  +{servicesList.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* 3-Pillar Verification Badges */}
        <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-medium border border-emerald-200/60 dark:border-emerald-800/40">
            <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            ID Verified
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-medium border border-emerald-200/60 dark:border-emerald-800/40">
            <FileCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Trade Licensed
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-medium border border-emerald-200/60 dark:border-emerald-800/40">
            <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Insured
          </span>
        </div>

        {/* Card Footer: Pricing & Action Buttons */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Standard Rate</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
              {provider.hourlyRate ? `$${provider.hourlyRate}/hr` : 'Custom Quote'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(provider)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => onRequestBooking(provider)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
