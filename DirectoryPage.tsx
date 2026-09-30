import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Search, Users, AlertCircle, RefreshCw, X, Sparkles } from 'lucide-react';
import { useBranding } from '../context/BrandingContext';
import { ProviderProfile } from '../types';
import { getApprovedProviders, seedSampleAustinProviders } from '../services/providerService';
import { ProviderCard } from '../components/directory/ProviderCard';
import { ProviderFilter } from '../components/directory/ProviderFilter';

interface DirectoryPageProps {
  initialCategory?: string;
  initialSearch?: string;
  onSelectProvider: (provider: ProviderProfile) => void;
  onRequestBooking: (provider: ProviderProfile) => void;
}

export function DirectoryPage({
  initialCategory = '',
  initialSearch = '',
  onSelectProvider,
  onRequestBooking,
}: DirectoryPageProps) {
  const { branding } = useBranding();
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [areaFilter, setAreaFilter] = useState('');
  const [minReliability, setMinReliability] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState<
    'recommended' | 'rating' | 'reviews' | 'newest' | 'reliability'
  >('recommended');

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSearch) setSearch(initialSearch);
  }, [initialCategory, initialSearch]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const list = await getApprovedProviders();
      setProviders(list);
    } catch (err) {
      console.warn('Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Multi-aspect filter and sort
  const filteredProviders = useMemo(() => {
    return providers
      .filter((p) => {
        // Search across: Business name, Services offered, Category, Area, Bio
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchName = p.businessName.toLowerCase().includes(q);
          const matchCategory = p.category?.toLowerCase().includes(q);
          const matchArea = p.serviceArea?.toLowerCase().includes(q);
          const matchBio = p.bio?.toLowerCase().includes(q);
          const matchServices = p.services?.some((s) => s.toLowerCase().includes(q));

          if (!matchName && !matchCategory && !matchArea && !matchBio && !matchServices) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory && p.category !== selectedCategory) {
          return false;
        }

        // Area / Neighborhood filter
        if (areaFilter.trim()) {
          const area = areaFilter.toLowerCase().trim();
          if (!p.serviceArea?.toLowerCase().includes(area)) {
            return false;
          }
        }

        // Reliability threshold
        if (minReliability > 0 && (p.reliabilityScore || 0) < minReliability) {
          return false;
        }

        // Star Rating threshold
        if (minRating > 0 && (p.averageRating || 5.0) < minRating) {
          return false;
        }

        // Available only
        if (availableOnly && !p.isAvailable) {
          return false;
        }

        // Verified only (checked by verified document status or strikes == 0)
        if (verifiedOnly && p.status !== 'approved') {
          return false;
        }

        // Price range
        if (priceRange !== 'all') {
          const rate = parseFloat(p.hourlyRate) || 0;
          if (priceRange === 'under_90' && rate >= 90) return false;
          if (priceRange === '90_120' && (rate < 90 || rate > 120)) return false;
          if (priceRange === 'above_120' && rate <= 120) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recommended') {
          // Weighted formula: reliability score * 0.5 + rating * 10 + completed count
          const scoreA =
            (a.reliabilityScore || 100) * 0.5 +
            (a.averageRating || 5) * 10 +
            Math.min(a.completedBookingsCount || 0, 20);
          const scoreB =
            (b.reliabilityScore || 100) * 0.5 +
            (b.averageRating || 5) * 10 +
            Math.min(b.completedBookingsCount || 0, 20);
          return scoreB - scoreA;
        }
        if (sortBy === 'rating') {
          return (b.averageRating || 5) - (a.averageRating || 5);
        }
        if (sortBy === 'reliability') {
          return (b.reliabilityScore || 100) - (a.reliabilityScore || 100);
        }
        if (sortBy === 'reviews') {
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [
    providers,
    search,
    selectedCategory,
    areaFilter,
    minReliability,
    minRating,
    verifiedOnly,
    availableOnly,
    priceRange,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setAreaFilter('');
    setMinReliability(0);
    setMinRating(0);
    setVerifiedOnly(false);
    setAvailableOnly(false);
    setPriceRange('all');
    setSortBy('recommended');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Curated Provider Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Verified Specialists in {branding.cityRegion}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Search trusted trade specialists with verified licenses, background identity checks, and transparent reliability records.
        </p>
      </div>

      {/* Filter component */}
      <ProviderFilter
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={branding.categories}
        areaFilter={areaFilter}
        onAreaFilterChange={setAreaFilter}
        minReliability={minReliability}
        onMinReliabilityChange={setMinReliability}
        minRating={minRating}
        onMinRatingChange={setMinRating}
        verifiedOnly={verifiedOnly}
        onVerifiedOnlyChange={setVerifiedOnly}
        availableOnly={availableOnly}
        onAvailableOnlyChange={setAvailableOnly}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onReset={handleResetFilters}
        totalResults={filteredProviders.length}
      />

      {/* Results grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : filteredProviders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((prov) => (
            <ProviderCard
              key={prov.id}
              provider={prov}
              onSelect={onSelectProvider}
              onRequestBooking={onRequestBooking}
            />
          ))}
        </div>
      ) : (
        /* Empty State with Clear Filters */
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No specialists found for this search.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
              We couldn't find any verified professionals matching your current filters. Try relaxing your search terms or clearing your filters.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
