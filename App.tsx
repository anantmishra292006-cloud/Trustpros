/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { isConfigured } from './services/firebase';
import { FirebaseSetupScreen } from './components/setup/FirebaseSetupScreen';
import { ToastProvider, useToast } from './context/ToastContext';
import { BrandingProvider, useBranding } from './context/BrandingContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { DirectoryPage } from './pages/DirectoryPage';
import { ProviderDetailPage } from './pages/ProviderDetailPage';
import { ProviderSignupPage } from './pages/ProviderSignupPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { LegalPage } from './pages/LegalPage';
import { AuthModal } from './components/auth/AuthModal';
import { BookingModal } from './components/booking/BookingModal';
import { ProviderProfile } from './types';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes auto sign-out

function AppContent() {
  const { userProfile, isAdmin, isProvider, logout } = useAuth();
  const { branding } = useBranding();
  const { showToast } = useToast();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewData, setViewData] = useState<any>(null);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('localverity_theme') === 'dark' ||
      localStorage.getItem('trustedpros_theme') === 'dark' ||
      (!('localverity_theme' in localStorage) &&
        !('trustedpros_theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('localverity_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('localverity_theme', 'light');
    }
  }, [darkMode]);

  // Automatic Sign-out After Inactivity (30 minutes)
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!userProfile) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, updateActivity, { passive: true }));

    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed > INACTIVITY_TIMEOUT_MS) {
        logout();
        showToast('You have been securely signed out due to 30 minutes of inactivity.', 'info');
        handleNavigate('directory');
      }
    }, 60000); // Check once per minute

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, updateActivity));
      clearInterval(checkInterval);
    };
  }, [userProfile, logout, showToast]);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [authModalRole, setAuthModalRole] = useState<any>('customer');

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingProvider, setBookingProvider] = useState<ProviderProfile | null>(null);

  const handleNavigate = (view: string, data?: any) => {
    // Route guards
    if (view === 'admin_dashboard' && !isAdmin) {
      showToast('Access restricted to directory administrators.', 'error');
      setCurrentView('home');
      return;
    }

    if (view === 'provider_dashboard' && !isProvider && !isAdmin) {
      showToast('Access restricted to approved service specialists.', 'warning');
      setCurrentView('provider_signup');
      return;
    }

    if (view === 'customer_dashboard' && !userProfile) {
      handleOpenAuth('signin', 'customer');
      return;
    }

    setCurrentView(view);
    setViewData(data || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin', role: any = 'customer') => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    setAuthModalOpen(true);
  };

  const handleSelectProvider = (provider: ProviderProfile) => {
    handleNavigate('provider_detail', { provider });
  };

  const handleRequestBooking = (provider: ProviderProfile) => {
    setBookingProvider(provider);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProvider={handleSelectProvider}
            onRequestBooking={handleRequestBooking}
          />
        )}

        {currentView === 'directory' && (
          <DirectoryPage
            initialCategory={viewData?.category || ''}
            initialSearch={viewData?.search || ''}
            onSelectProvider={handleSelectProvider}
            onRequestBooking={handleRequestBooking}
          />
        )}

        {currentView === 'provider_detail' && viewData?.provider && (
          <ProviderDetailPage
            provider={viewData.provider}
            onBack={() => handleNavigate('directory')}
            onRequestBooking={handleRequestBooking}
          />
        )}

        {currentView === 'provider_signup' && (
          <ProviderSignupPage
            onSuccess={() => handleNavigate('provider_dashboard')}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'customer_dashboard' && (
          <CustomerDashboard onNavigate={handleNavigate} />
        )}

        {currentView === 'provider_dashboard' && (
          <ProviderDashboard onNavigate={handleNavigate} />
        )}

        {currentView === 'admin_dashboard' && (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <div className="p-12 text-center text-xs text-rose-500">
              Access restricted to directory administrators.
            </div>
          )
        )}

        {currentView === 'terms' && (
          <LegalPage type="terms" onBack={() => handleNavigate('directory')} />
        )}

        {currentView === 'privacy' && (
          <LegalPage type="privacy" onBack={() => handleNavigate('directory')} />
        )}

        {currentView === 'disclaimer' && (
          <LegalPage type="disclaimer" onBack={() => handleNavigate('directory')} />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        preferredRole={authModalRole}
        onSuccess={() => {
          if (authModalRole === 'provider') {
            handleNavigate('provider_signup');
          }
        }}
      />

      {bookingProvider && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setBookingProvider(null);
          }}
          provider={bookingProvider}
          onSuccess={(bookingId) => {
            handleNavigate('customer_dashboard');
          }}
          onOpenAuth={() => handleOpenAuth('signin', 'customer')}
        />
      )}
    </div>
  );
}

export default function App() {
  if (!isConfigured) {
    return <FirebaseSetupScreen />;
  }

  return (
    <ToastProvider>
      <BrandingProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrandingProvider>
    </ToastProvider>
  );
}
