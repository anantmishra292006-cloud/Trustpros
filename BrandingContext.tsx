import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrandingSettings } from '../types';
import { getBrandingSettings, updateBrandingSettings, DEFAULT_BRANDING } from '../services/brandingService';
import { isConfigured } from '../services/firebase';

interface BrandingContextType {
  branding: BrandingSettings;
  loading: boolean;
  updateBranding: (newSettings: Partial<BrandingSettings>) => Promise<void>;
  reloadBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const data = await getBrandingSettings();
      setBranding(data);
      applyBrandingToDOM(data);
    } catch (err) {
      console.warn('Failed to load branding:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyBrandingToDOM = (settings: BrandingSettings) => {
    // Dynamic page title
    if (settings.appName) {
      document.title = `${settings.appName} | ${settings.cityRegion || 'Local Verified Pros'}`;
    }

    // Dynamic primary color variable
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [isConfigured]);

  const handleUpdate = async (newSettings: Partial<BrandingSettings>) => {
    await updateBrandingSettings(newSettings);
    const updated = { ...branding, ...newSettings };
    setBranding(updated);
    applyBrandingToDOM(updated);
  };

  return (
    <BrandingContext.Provider
      value={{
        branding,
        loading,
        updateBranding: handleUpdate,
        reloadBranding: loadSettings,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}
