import React, { useState } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  ArrowUpDown,
  X,
  Star,
  CheckCircle,
  SlidersHorizontal,
  DollarSign,
  Clock,
  Sparkles,
} from 'lucide-react';

export interface ProviderFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories: string[];
  areaFilter: string;
  onAreaFilterChange: (area: string) => void;
  minReliability: number;
  onMinReliabilityChange: (score: number) => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (verified: boolean) => void;
  availableOnly: boolean;
  onAvailableOnlyChange: (available: boolean) => void;
  priceRange: string;
  onPriceRangeChange: (range: string) => void;
  sortBy: 'recommended' | 'rating' | 'reviews' | 'newest' | 'reliability';
  onSortByChange: (sort: 'recommended' | 'rating' | 'reviews' | 'newest' | 'reliability') => void;
  onReset: () => void;
  totalResults: number;
}

export function ProviderFilter({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  areaFilter,
  onAreaFilterChange,
  minReliability,
  onMinReliabilityChange,
  minRating,
  onMinRatingChange,
  verifiedOnly,
  onVerifiedOnlyChange,
  availableOnly,
  onAvailableOnlyChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortByChange,
  onReset,
  totalResults,
}: ProviderFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isFiltered =
    Boolean(search) ||
    Boolean(selectedCategory) ||
    Boolean(areaFilter) ||
    minReliability > 0 ||
    minRating > 0 ||
    verifiedOnly ||
    availableOnly ||
    priceRange !== 'all';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
      {/* Primary search row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search input with multi-aspect placeholder */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search business name, service (e.g. water heater), or keyword..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category selector */}
        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full py-2.5 px-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Trade Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sort by dropdown */}
        <div className="sm:col-span-3">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="w-full py-2.5 px-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="recommended">Recommended (Top Reliability)</option>
              <option value="rating">Highest Rated (5.0 Stars)</option>
              <option value="reviews">Most Reviewed</option>
              <option value="newest">Newest Listed</option>
              <option value="reliability">Reliability Score (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Filter Pills Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Availability Toggle */}
          <button
            type="button"
            onClick={() => onAvailableOnlyChange(!availableOnly)}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
              availableOnly
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 font-semibold'
                : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                availableOnly ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>Accepting New Jobs</span>
          </button>

          {/* Verified Only Toggle */}
          <button
            type="button"
            onClick={() => onVerifiedOnlyChange(!verifiedOnly)}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
              verifiedOnly
                ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700 font-semibold'
                : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Verified Credentials Only</span>
          </button>

          {/* Price Range Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px]">
            {[
              { id: 'all', label: 'All Rates' },
              { id: 'under_90', label: '< $90/hr' },
              { id: '90_120', label: '$90-$120' },
              { id: 'above_120', label: '$120+/hr' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPriceRangeChange(p.id)}
                className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  priceRange === p.id
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Toggle More Filters */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
              showAdvanced || minReliability > 0 || minRating > 0 || Boolean(areaFilter)
                ? 'border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Filters</span>
            {(minReliability > 0 || minRating > 0 || Boolean(areaFilter)) && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        </div>

        {/* Results count & Clear */}
        <div className="flex items-center gap-3 text-xs ml-auto">
          <span className="text-slate-500 dark:text-slate-400">
            <strong>{totalResults}</strong> {totalResults === 1 ? 'specialist' : 'specialists'} found
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Reset all
            </button>
          )}
        </div>
      </div>

      {/* Advanced Collapsible Filter Row */}
      {showAdvanced && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in fade-in duration-200">
          {/* Area / Neighborhood Filter */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider block">
              Service Area / Neighborhood
            </label>
            <input
              type="text"
              value={areaFilter}
              onChange={(e) => onAreaFilterChange(e.target.value)}
              placeholder="e.g. Central Austin, Round Rock, Westlake..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Min Reliability Threshold */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider block">
              Minimum Reliability Score
            </label>
            <div className="flex items-center gap-1">
              {[0, 80, 90, 95].map((score) => (
                <button
                  type="button"
                  key={score}
                  onClick={() => onMinReliabilityChange(score)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-center ${
                    minReliability === score
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {score === 0 ? 'Any' : `${score}%+`}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider block">
              Minimum Star Rating
            </label>
            <div className="flex items-center gap-1">
              {[0, 4.0, 4.5, 4.8].map((stars) => (
                <button
                  type="button"
                  key={stars}
                  onClick={() => onMinRatingChange(stars)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-center flex items-center justify-center gap-0.5 ${
                    minRating === stars
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {stars === 0 ? (
                    'Any'
                  ) : (
                    <>
                      <span>{stars}+</span>
                      <Star className="w-3 h-3 fill-current" />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
