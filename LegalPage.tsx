import React from 'react';
import { Shield, ArrowLeft, FileText, Lock, AlertTriangle } from 'lucide-react';
import { useBranding } from '../context/BrandingContext';

interface LegalPageProps {
  type: 'terms' | 'privacy' | 'disclaimer';
  onBack: () => void;
}

export function LegalPage({ type, onBack }: LegalPageProps) {
  const { branding } = useBranding();

  const title =
    type === 'terms'
      ? 'Terms of Service'
      : type === 'privacy'
      ? 'Privacy Policy'
      : 'Direct Payment & Escrow Disclaimer';

  const icon =
    type === 'terms' ? (
      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    ) : type === 'privacy' ? (
      <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    ) : (
      <AlertTriangle className="w-6 h-6 text-amber-500" />
    );

  const content =
    type === 'terms'
      ? branding.termsOfService
      : type === 'privacy'
      ? branding.privacyPolicy
      : branding.escrowDisclaimer;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Directory
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-2xl">{icon}</div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {branding.appName} • {branding.cityRegion}
            </p>
          </div>
        </div>

        <div className="mt-8 prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}
