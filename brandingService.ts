import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { BrandingSettings } from '../types';

export const DEFAULT_BRANDING: BrandingSettings = {
  appName: 'LocalVerity',
  tagline: 'The curated directory of verified, independent trade professionals in Greater Austin.',
  logoUrl: '',
  primaryColor: '#2563eb', // Royal Blue
  cityRegion: 'Austin, TX & Travis County',
  categories: [
    'Plumbing & Water Heaters',
    'Electrical & Smart Home',
    'HVAC & Heat Pumps',
    'General Handyman & Carpentry',
    'Roofing, Gutters & Flashing',
    'Interior & Exterior Painting',
    'Appliance Repair Specialists',
    'Landscaping, Irrigation & Trees',
  ],
  globalDepositInstructions:
    'All confirmed appointments require a commitment deposit directly to the independent professional via their verified payment link. Your deposit locks your appointment on their schedule and is credited toward your final invoice.',
  termsOfService: `TERMS OF SERVICE - LOCALVERITY DIRECTORY

1. DIRECTORY OPERATOR ROLE
This platform is a local directory operated to introduce verified independent contractors to prospective clients. The operator is not a licensed contractor, employer, partner, or joint venturer with any listed professional.

2. INDEPENDENT CONTRACTOR STATUS
All service professionals listed are independent business entities who set their own prices, policies, and schedules. All contracts for work are strictly between the customer and the provider.

3. DIRECT PAYMENTS & DEPOSITS
Deposits and payments are executed directly between customer and provider using third-party payment links (e.g. Stripe). The directory does not collect, process, or hold customer funds.

4. USER CONDUCT & REVIEWS
Customer reviews must represent actual service experiences from completed bookings. Defamatory, fraudulent, or abusive submissions will result in account termination.

5. DISPUTES & STRIKE POLICY
The directory operator reserves the right to mediate disputes and issue administrative strikes or suspend providers who fail to maintain the directory reliability standard.`,
  privacyPolicy: `PRIVACY POLICY - LOCALVERITY DIRECTORY

1. INFORMATION WE COLLECT
We collect personal information necessary to facilitate bookings and contractor verification, including name, email address, phone number, service address, and professional verification credentials (licenses, proof of insurance, government ID).

2. PRIVATE VERIFICATION DOCUMENTS
Identity and professional insurance documents submitted during provider onboarding are strictly confidential. They are reviewed exclusively by authorized directory administrators and are never made publicly available.

3. COMMUNICATIONS
Contact details provided during a booking request are shared only between the specific customer and the chosen service provider to facilitate job fulfillment.

4. COOKIES & LOCAL STORAGE
We utilize secure local storage to retain your authentication sessions and operator directory preferences.`,
  escrowDisclaimer: `LEGAL NOTICE & ESCROW DISCLAIMER

PLEASE READ CAREFULLY:
LocalVerity and its community operator are NOT an escrow service, escrow agent, payment processor, or guarantor of contractor workmanship. 

• Any deposit or milestone payment you send to a service provider via an external link (e.g., Stripe Payment Link, payment portal, or direct transfer) is a direct transaction between you and that independent professional.
• The directory operator does NOT hold, process, insure, or refund any customer funds.
• While we verify identity, trade licenses, and insurance policies upon onboarding, consumers are encouraged to verify project permits, scope, and written estimates directly with their selected specialist.`,
};

export async function getBrandingSettings(): Promise<BrandingSettings> {
  if (!db) return DEFAULT_BRANDING;
  try {
    const docRef = doc(db, 'branding', 'settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_BRANDING, ...(snap.data() as Partial<BrandingSettings>) };
    }
    return DEFAULT_BRANDING;
  } catch (error) {
    console.warn('Could not fetch branding settings from Firestore; using defaults:', error);
    return DEFAULT_BRANDING;
  }
}

export async function updateBrandingSettings(settings: Partial<BrandingSettings>): Promise<void> {
  if (!db) throw new Error('Database is not initialized');
  const path = 'branding/settings';
  try {
    const docRef = doc(db, 'branding', 'settings');
    const merged = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, merged, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
