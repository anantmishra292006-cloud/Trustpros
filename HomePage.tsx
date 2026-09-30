import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  MapPin,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileCheck,
  Award,
  Zap,
  Calendar,
  Clock,
  ThumbsUp,
  UserCheck,
} from 'lucide-react';
import { useBranding } from '../context/BrandingContext';
import { ProviderProfile } from '../types';
import { getApprovedProviders } from '../services/providerService';
import { ProviderCard } from '../components/directory/ProviderCard';

interface HomePageProps {
  onNavigate: (view: string, data?: any) => void;
  onSelectProvider: (provider: ProviderProfile) => void;
  onRequestBooking: (provider: ProviderProfile) => void;
}

export function HomePage({
  onNavigate,
  onSelectProvider,
  onRequestBooking,
}: HomePageProps) {
  const { branding } = useBranding();
  const [searchQuery, setSearchQuery] = useState('');
  const [topProviders, setTopProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await getApprovedProviders();
        // Sort by reliability & rating
        const sorted = [...list].sort(
          (a, b) =>
            (b.reliabilityScore || 0) * 0.5 +
            (b.averageRating || 0) * 10 -
            ((a.reliabilityScore || 0) * 0.5 + (a.averageRating || 0) * 10)
        );
        setTopProviders(sorted.slice(0, 6));
      } catch (err) {
        console.warn('Failed to load top providers:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('directory', { search: searchQuery });
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION & 2. SEARCH & 3. POPULAR CATEGORIES */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-16 sm:py-24 border-b border-slate-800">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50 text-xs font-semibold mb-6 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>Curated Directory for {branding.cityRegion}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Vetted Local Specialists{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              You Can Truly Rely On.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {branding.tagline ||
              'A curated local-services directory where every provider is vetted for government ID, trade license, and commercial liability insurance.'}
          </p>

          {/* 2. REAL SEARCH SYSTEM */}
          <form
            onSubmit={handleHeroSearch}
            className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 bg-slate-800/90 p-2 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-md"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plumbing, water heater, electrical, HVAC, handyman..."
                className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-transparent focus:outline-hidden text-white placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Search Specialists</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 3. POPULAR CATEGORIES */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-2 max-w-3xl mx-auto">
            <span className="text-xs font-semibold text-slate-400 mr-1">Popular:</span>
            {branding.categories.slice(0, 7).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onNavigate('directory', { category: cat })}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-800/90 border border-slate-700 hover:border-blue-400 text-slate-200 hover:text-white shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PROVIDERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col min-[400px]:flex-row items-start min-[400px]:items-center justify-between gap-3 sm:gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Highest Rated in {branding.cityRegion}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured Verified Specialists
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Independent professionals with verified credentials, high reliability scores, and active availability.
            </p>
          </div>
          <button
            onClick={() => onNavigate('directory')}
            style={{ whiteSpace: 'nowrap' }}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap mt-2 min-[400px]:mt-0 self-start min-[400px]:self-auto"
          >
            <span style={{ whiteSpace: 'nowrap' }}>View All Specialists ({topProviders.length})</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-800"
              />
            ))}
          </div>
        ) : topProviders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProviders.map((prov) => (
              <ProviderCard
                key={prov.id}
                provider={prov}
                onSelect={onSelectProvider}
                onRequestBooking={onRequestBooking}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Directory Launching in {branding.cityRegion}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Our operator is currently reviewing credential submissions. Be among the first approved pros!
            </p>
            <button
              onClick={() => onNavigate('provider_signup')}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs"
            >
              Apply as Founding Specialist
            </button>
          </div>
        )}
      </section>

      {/* 5. TRUST / VERIFICATION EXPLANATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs uppercase font-extrabold tracking-widest text-blue-600 dark:text-blue-400 mb-1">
            Verification Protocol
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How Provider Verification Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            No unverified lead auctions or arbitrary rankings. Every listed professional undergoes documented review by directory management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. Documented Verification
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every applicant uploads government photo ID, active master trade license credentials, and proof of general liability insurance reviewed by the operator before approval.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Real Reliability Scoring
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Our automated score calculates completed jobs versus provider cancellations and no-shows. An automated 3-strike rule auto-suspends unreliable contractors immediately.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              3. Direct Transparent Deposits
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Customers reserve appointments via the specialist's direct Stripe payment link. No middlemen commissions, lead fees, or hidden processing markups.
            </p>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="bg-slate-900 text-white py-16 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-400 mb-1 block">
              Seamless Local Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              How It Works for Customers & Pros
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Three straightforward steps to high-trust home and commercial service appointments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                1
              </div>
              <h3 className="text-base font-bold text-white">Find Your Verified Specialist</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Filter by trade, neighborhood, price range, and minimum reliability percentage. Inspect verified license numbers and real past customer reviews.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                2
              </div>
              <h3 className="text-base font-bold text-white">Request Appointment & Deposit</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose your preferred date, time, and service notes. Secure the booking using the specialist's direct Stripe link with clear deposit terms.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                3
              </div>
              <h3 className="text-base font-bold text-white">Quality Service & Verified Review</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The trade specialist confirms and completes the job. Upon completion, verified customers leave genuine reviews that update the provider's score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PROVIDER CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-blue-800/40">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/60 text-blue-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Independent Trade Specialist Network</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Are you a licensed trade specialist in {branding.cityRegion}?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Stop paying lead fees to giant tech conglomerates. List your business, establish a transparent reliability score, and collect direct client deposits.
            </p>
          </div>

          <button
            onClick={() => onNavigate('provider_signup')}
            className="px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span>Apply For Verified Listing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
