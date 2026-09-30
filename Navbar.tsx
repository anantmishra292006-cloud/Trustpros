import React, { useState } from 'react';
import {
  ShieldCheck,
  MapPin,
  User,
  LogOut,
  Briefcase,
  Calendar,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
  onOpenAuth: (mode?: 'signin' | 'signup', role?: any) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Navbar({
  currentView,
  onNavigate,
  onOpenAuth,
  darkMode,
  onToggleDarkMode,
}: NavbarProps) {
  const { userProfile, isAdmin, isProvider, isCustomer, logout } = useAuth();
  const { branding } = useBranding();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    onNavigate('directory');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & City branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.appName}
                  className="h-9 w-auto max-w-[140px] object-contain rounded"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                  {branding.appName || 'LocalVerity'}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-xs">{branding.cityRegion}</span>
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation links */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onNavigate('directory')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentView === 'directory'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Browse Directory
            </button>

            {/* Role Dashboards */}
            {isCustomer && (
              <button
                onClick={() => onNavigate('customer_dashboard')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'customer_dashboard'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/50'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                My Bookings
              </button>
            )}

            {isProvider && (
              <button
                onClick={() => onNavigate('provider_dashboard')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'provider_dashboard'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/50'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Provider Portal
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin_dashboard')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'admin_dashboard'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/50'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Operator Admin
              </button>
            )}
          </div>

          {/* Right Actions: Dark Mode, Join, User Menu */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Provider Signup CTA if not provider */}
            {!isProvider && !isAdmin && (
              <button
                onClick={() => onNavigate('provider_signup')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                List Your Business
              </button>
            )}

            {/* User Account / Sign In */}
            {userProfile ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                    {userProfile.displayName?.slice(0, 1) || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{userProfile.displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 text-xs z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {userProfile.displayName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {userProfile.email}
                      </div>
                      <div className="mt-1">
                        <span className="inline-block uppercase text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                          {userProfile.role}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('customer_dashboard');
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4 text-slate-400" />
                      My Bookings
                    </button>

                    {isProvider && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('provider_dashboard');
                        }}
                        className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        Provider Dashboard
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('admin_dashboard');
                        }}
                        className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Admin Center
                      </button>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('directory');
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Browse Directory
          </button>

          {isCustomer && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('customer_dashboard');
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              My Bookings
            </button>
          )}

          {isProvider && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('provider_dashboard');
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Provider Dashboard
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('admin_dashboard');
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Admin Center
            </button>
          )}

          {!isProvider && !isAdmin && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('provider_signup');
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              List Your Business (Provider Signup)
            </button>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            {userProfile ? (
              <div className="space-y-2">
                <div className="px-3 text-xs text-slate-500">
                  Signed in as <strong>{userProfile.email}</strong> ({userProfile.role})
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signin');
                  }}
                  className="flex-1 py-2 text-center text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="flex-1 py-2 text-center text-xs font-semibold rounded-xl bg-blue-600 text-white"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
