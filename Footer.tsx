import React from 'react';
import { ShieldCheck, MapPin, ExternalLink } from 'lucide-react';
import { useBranding } from '../../context/BrandingContext';

interface FooterProps {
  onNavigate: (view: string, data?: any) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { branding } = useBranding();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>{branding.appName}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {branding.tagline}
            </p>
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{branding.cityRegion}</span>
            </div>
          </div>

          {/* Directory Niche Categories */}
          <div className="space-y-2 md:col-span-1">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-200">
              Verified Categories
            </h4>
            <ul className="space-y-1.5">
              {branding.categories.slice(0, 6).map((c) => (
                <li key={c}>
                  <button
                    onClick={() => onNavigate('directory', { category: c })}
                    className="hover:text-white transition-colors text-left"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Operator & Pros */}
          <div className="space-y-2 md:col-span-1">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-200">
              For Professionals
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigate('provider_signup')}
                  className="hover:text-white transition-colors text-left"
                >
                  Apply as a Trade Specialist
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('directory')}
                  className="hover:text-white transition-colors text-left"
                >
                  Directory Standards & Vetting
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('disclaimer')}
                  className="hover:text-white transition-colors text-left"
                >
                  Independent Contractor Notice
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Pages & Escrow Disclaimer */}
          <div className="space-y-2 md:col-span-1">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-200">
              Legal & Disclaimers
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('disclaimer')}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors text-left flex items-center gap-1"
                >
                  <span>Escrow & Direct Payment Disclaimer</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {branding.appName || 'LocalVerity'}. All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Curated for {branding.cityRegion}
            </span>
            <span className="text-slate-700">•</span>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px]">
              <span className="text-slate-500">Powered by</span>
              <span className="font-extrabold text-blue-400 tracking-tight">LocalVerity</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
