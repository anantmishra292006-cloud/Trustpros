import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck,
  Upload,
  ArrowRight,
  Loader2,
  AlertCircle,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { useToast } from '../context/ToastContext';
import { uploadFile } from '../services/storageService';
import { registerProviderProfile } from '../services/providerService';

interface ProviderSignupPageProps {
  onSuccess: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup', role?: any) => void;
}

export function ProviderSignupPage({ onSuccess, onOpenAuth }: ProviderSignupPageProps) {
  const { userProfile, firebaseUser, refreshProfile } = useAuth();
  const { branding } = useBranding();
  const { showToast } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState(userProfile?.displayName || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState(branding.categories[0] || 'Plumbing');
  const [serviceArea, setServiceArea] = useState(branding.cityRegion || '');
  const [hourlyRate, setHourlyRate] = useState('95');
  const [flatRateDescription, setFlatRateDescription] = useState('Standard diagnostic fee credited toward repair.');
  const [depositPaymentUrl, setDepositPaymentUrl] = useState('');
  const [bio, setBio] = useState('');
  const [servicesInput, setServicesInput] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState('8');
  const [responseTime, setResponseTime] = useState('< 1 hour');

  // Files
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!firebaseUser || !userProfile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Create Your Account First
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            To submit your trade specialist verification packet and list your business in {branding.cityRegion}, please register or sign in to your user profile.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenAuth('signup', 'provider')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
            >
              Register Trade Specialist Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!businessName.trim()) throw new Error('Please enter your company or trade business name.');
      if (!category) throw new Error('Please choose a trade category.');
      if (!serviceArea.trim()) throw new Error('Please state your service area or neighborhoods.');
      if (!idFile) throw new Error('Government ID verification document is required.');
      if (!licenseFile) throw new Error('Trade / Contractor license verification document is required.');
      if (!insuranceFile) throw new Error('Certificate of general liability insurance is required.');

      // Upload files
      setUploadProgress('Uploading business photo & verification credentials...');

      let photoUrl = '';
      if (photoFile) {
        photoUrl = await uploadFile(photoFile, 'profile_photos');
      }

      const idDocUrl = await uploadFile(idFile, 'verification_docs');
      const licenseDocUrl = await uploadFile(licenseFile, 'verification_docs');
      const insuranceDocUrl = await uploadFile(insuranceFile, 'verification_docs');

      setUploadProgress('Finalizing directory profile...');

      const parsedServices = servicesInput
        ? servicesInput.split(',').map((s) => s.trim()).filter(Boolean)
        : [category];

      await registerProviderProfile(
        userProfile.id,
        {
          businessName,
          contactName: contactName || userProfile.displayName,
          email: email || userProfile.email,
          phone,
          category,
          services: parsedServices,
          bio,
          serviceArea,
          hourlyRate,
          flatRateDescription,
          photoUrl,
          yearsInBusiness: parseInt(yearsInBusiness, 10) || 5,
          responseTime,
          depositPaymentUrl: depositPaymentUrl.trim(),
        },
        {
          idDocumentUrl: idDocUrl,
          licenseDocumentUrl: licenseDocUrl,
          insuranceDocumentUrl: insuranceDocUrl,
          licenseNumber,
          insuranceProvider,
        }
      );

      await refreshProfile();
      showToast('Application submitted! Your profile is pending operator review.', 'success');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit provider onboarding application.');
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Curated Community Directory</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Apply to List Your Trade Business
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
          We maintain strict vetting standards in {branding.cityRegion}. Complete your profile and upload verification documents for operator review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Business Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            1. Business & Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company / Business Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Master Plumbing Co."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Trade Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {branding.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Contact Name *
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Direct Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(512) 555-0144"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Service Area / Coverage *
              </label>
              <input
                type="text"
                required
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="e.g. Austin, Round Rock, Cedar Park, Westlake"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Specific Services Offered (Comma-Separated)
              </label>
              <input
                type="text"
                value={servicesInput}
                onChange={(e) => setServicesInput(e.target.value)}
                placeholder="e.g. Tankless water heaters, Drain snaking, Slab leak repair, Whole-home repiping"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Helps customers find you when searching for specific services in the directory.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Years in Business
              </label>
              <input
                type="number"
                min="0"
                max="80"
                value={yearsInBusiness}
                onChange={(e) => setYearsInBusiness(e.target.value)}
                placeholder="8"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Typical Response Time
              </label>
              <select
                value={responseTime}
                onChange={(e) => setResponseTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="< 30 mins">&lt; 30 minutes</option>
                <option value="< 1 hour">&lt; 1 hour</option>
                <option value="< 2 hours">&lt; 2 hours</option>
                <option value="Same day">Same day</option>
                <option value="Within 24 hours">Within 24 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Standard Hourly Rate ($)
              </label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="95"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Diagnostic / Flat Rate Note
              </label>
              <input
                type="text"
                value={flatRateDescription}
                onChange={(e) => setFlatRateDescription(e.target.value)}
                placeholder="e.g. $89 trip & diagnostic, waived with work"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Direct Deposit Link (Stripe Payment Link URL)
              </label>
              <input
                type="url"
                value={depositPaymentUrl}
                onChange={(e) => setDepositPaymentUrl(e.target.value)}
                placeholder="https://buy.stripe.com/..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Customers will use this link to send direct deposits to reserve appointment slots. (Can be updated anytime)
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Professional Bio & Work Experience *
              </label>
              <textarea
                rows={4}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Highlight your background, certifications, equipment, years in business, and specialties..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Logo or Profile Avatar
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && setPhotoFile(e.target.files[0])}
                className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Verification Documents */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                2. Private Verification Documents
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                These documents are strictly confidential and only accessed by the operator for verification.
              </p>
            </div>
            <FileCheck className="w-5 h-5 text-blue-600 shrink-0" />
          </div>

          <div className="space-y-4">
            {/* Government ID */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Government-Issued Photo ID (Driver's License / Passport) *
              </label>
              <input
                type="file"
                required
                accept="image/*,application/pdf"
                onChange={(e) => e.target.files?.[0] && setIdFile(e.target.files[0])}
                className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* License */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Professional Trade / Master License Document *
              </label>
              <input
                type="file"
                required
                accept="image/*,application/pdf"
                onChange={(e) => e.target.files?.[0] && setLicenseFile(e.target.files[0])}
                className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="License Registration # (optional)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            {/* Insurance */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Certificate of General Liability Insurance (COI) *
              </label>
              <input
                type="file"
                required
                accept="image/*,application/pdf"
                onChange={(e) => e.target.files?.[0] && setInsuranceFile(e.target.files[0])}
                className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <input
                type="text"
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                placeholder="Insurance Carrier / Policy Number (optional)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {uploadProgress && (
            <span className="text-xs text-blue-600 dark:text-blue-400 animate-pulse font-medium">
              {uploadProgress}
            </span>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Submit Verification Packet</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
