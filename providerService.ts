import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { ProviderProfile, VerificationDocument } from '../types';
import { updateUserRole } from './authService';

export async function registerProviderProfile(
  userId: string,
  data: {
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    category: string;
    services?: string[];
    bio: string;
    serviceArea: string;
    hourlyRate: string;
    flatRateDescription: string;
    photoUrl: string;
    coverImageUrl?: string;
    yearsInBusiness?: number;
    responseTime?: string;
    depositPaymentUrl: string;
  },
  docs: {
    idDocumentUrl: string;
    licenseDocumentUrl: string;
    insuranceDocumentUrl: string;
    licenseNumber?: string;
    insuranceProvider?: string;
    notes?: string;
  }
): Promise<{ provider: ProviderProfile; verification: VerificationDocument }> {
  if (!db) throw new Error('Database is not initialized');

  const providerId = `prov_${userId}`;
  const now = new Date().toISOString();

  const provider: ProviderProfile = {
    id: providerId,
    userId,
    businessName: data.businessName.trim(),
    contactName: data.contactName.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    category: data.category.trim(),
    services: data.services && data.services.length > 0 ? data.services : [data.category],
    bio: data.bio.trim(),
    serviceArea: data.serviceArea.trim(),
    hourlyRate: data.hourlyRate.trim(),
    flatRateDescription: data.flatRateDescription.trim(),
    photoUrl: data.photoUrl.trim(),
    coverImageUrl: data.coverImageUrl?.trim() || '',
    yearsInBusiness: data.yearsInBusiness || 5,
    responseTime: data.responseTime?.trim() || '< 2 hours',
    depositPaymentUrl: data.depositPaymentUrl.trim(),
    status: 'pending',
    strikes: 0,
    reliabilityScore: 100,
    completedBookingsCount: 0,
    totalEndedBookingsCount: 0,
    averageRating: 5.0,
    reviewCount: 0,
    isAvailable: true,
    createdAt: now,
    updatedAt: now,
  };

  const verificationDocId = `vdoc_${userId}`;
  const verification: VerificationDocument = {
    id: verificationDocId,
    providerId,
    userId,
    idDocumentUrl: docs.idDocumentUrl,
    licenseDocumentUrl: docs.licenseDocumentUrl,
    insuranceDocumentUrl: docs.insuranceDocumentUrl,
    idVerified: false,
    licenseVerified: false,
    insuranceVerified: false,
    licenseNumber: docs.licenseNumber?.trim() || '',
    insuranceProvider: docs.insuranceProvider?.trim() || '',
    notes: docs.notes?.trim() || '',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'providers', providerId), provider);
    await setDoc(doc(db, 'verification_documents', verificationDocId), verification);
    // Ensure user's profile role is set to provider
    await updateUserRole(userId, 'provider');
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `providers/${providerId}`);
  }

  return { provider, verification };
}

export async function getApprovedProviders(): Promise<ProviderProfile[]> {
  if (!db) return [];
  const path = 'providers';
  try {
    const q = query(collection(db, 'providers'), where('status', '==', 'approved'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ProviderProfile);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function getAllProviders(): Promise<ProviderProfile[]> {
  if (!db) return [];
  const path = 'providers';
  try {
    const snap = await getDocs(collection(db, 'providers'));
    return snap.docs.map((d) => d.data() as ProviderProfile);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function getProviderById(providerId: string): Promise<ProviderProfile | null> {
  if (!db) return null;
  const path = `providers/${providerId}`;
  try {
    const snap = await getDoc(doc(db, 'providers', providerId));
    if (snap.exists()) {
      return snap.data() as ProviderProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function getProviderByUserId(userId: string): Promise<ProviderProfile | null> {
  if (!db) return null;
  const path = 'providers';
  try {
    const q = query(collection(db, 'providers'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as ProviderProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function getVerificationDocument(providerId: string): Promise<VerificationDocument | null> {
  if (!db) return null;
  const path = 'verification_documents';
  try {
    const q = query(collection(db, 'verification_documents'), where('providerId', '==', providerId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as VerificationDocument;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function updateProviderProfile(
  providerId: string,
  updates: Partial<ProviderProfile>
): Promise<void> {
  if (!db) return;
  const path = `providers/${providerId}`;
  try {
    await updateDoc(doc(db, 'providers', providerId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function adminApproveProvider(providerId: string): Promise<void> {
  if (!db) return;
  const path = `providers/${providerId}`;
  try {
    await updateDoc(doc(db, 'providers', providerId), {
      status: 'approved',
      rejectionReason: '',
      updatedAt: new Date().toISOString(),
    });
    // Also mark verification documents as verified
    const vDoc = await getVerificationDocument(providerId);
    if (vDoc) {
      await updateDoc(doc(db, 'verification_documents', vDoc.id), {
        status: 'verified',
        idVerified: true,
        licenseVerified: true,
        insuranceVerified: true,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function adminRejectProvider(providerId: string, reason: string): Promise<void> {
  if (!db) return;
  const path = `providers/${providerId}`;
  try {
    await updateDoc(doc(db, 'providers', providerId), {
      status: 'rejected',
      rejectionReason: reason.trim(),
      updatedAt: new Date().toISOString(),
    });
    const vDoc = await getVerificationDocument(providerId);
    if (vDoc) {
      await updateDoc(doc(db, 'verification_documents', vDoc.id), {
        status: 'rejected',
        notes: reason.trim(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function adminSuspendProvider(providerId: string, reason?: string): Promise<void> {
  if (!db) return;
  const path = `providers/${providerId}`;
  try {
    await updateDoc(doc(db, 'providers', providerId), {
      status: 'suspended',
      rejectionReason: reason ? reason.trim() : 'Suspended by administration',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function adminIssueStrike(providerId: string, reason: string): Promise<{ newStrikes: number; suspended: boolean }> {
  if (!db) throw new Error('Database is not initialized');
  const provider = await getProviderById(providerId);
  if (!provider) throw new Error('Provider not found');

  const currentStrikes = provider.strikes || 0;
  const newStrikes = currentStrikes + 1;
  const shouldSuspend = newStrikes >= 3;

  const path = `providers/${providerId}`;
  try {
    const updates: Partial<ProviderProfile> = {
      strikes: newStrikes,
      updatedAt: new Date().toISOString(),
    };

    if (shouldSuspend) {
      updates.status = 'suspended';
      updates.rejectionReason = `Auto-suspended: Reached 3 platform strikes. Latest reason: ${reason}`;
    }

    await updateDoc(doc(db, 'providers', providerId), updates);

    // Recalculate reliability score
    await recalculateReliabilityScore(providerId);

    return { newStrikes, suspended: shouldSuspend };
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function recalculateReliabilityScore(providerId: string): Promise<number> {
  if (!db) return 100;
  const provider = await getProviderById(providerId);
  if (!provider) return 100;

  try {
    // Get all completed, no-show, and cancelled bookings for this provider
    const bQuery = query(collection(db, 'bookings'), where('providerId', '==', providerId));
    const snap = await getDocs(bQuery);

    let completed = 0;
    let endedJobs = 0;

    snap.forEach((d) => {
      const b = d.data();
      if (b.status === 'completed') {
        completed++;
        endedJobs++;
      } else if (
        b.status === 'no_show_provider' ||
        b.status === 'cancelled_by_provider'
      ) {
        endedJobs++;
      }
    });

    let score = 100;
    if (endedJobs > 0) {
      score = Math.round((completed / endedJobs) * 100);
    }

    // Strike penalty: Deduct 15% per active strike
    const strikes = provider.strikes || 0;
    score = Math.max(0, score - strikes * 15);

    await updateDoc(doc(db, 'providers', providerId), {
      reliabilityScore: score,
      completedBookingsCount: completed,
      totalEndedBookingsCount: endedJobs,
      updatedAt: new Date().toISOString(),
    });

    return score;
  } catch (err) {
    console.warn('Could not recalculate reliability score:', err);
    return provider.reliabilityScore || 100;
  }
}

/**
 * Fixed IDs for clearly labeled demo providers so they can be loaded and removed with one click.
 */
export const DEMO_PROVIDER_IDS = [
  'prov_demo_apex_plumbing',
  'prov_demo_lonestar_electric',
  'prov_demo_hillcountry_hvac',
  'prov_demo_capitol_craft',
];

/**
 * Loads clearly labeled [DEMO] providers into Firestore.
 */
export async function loadSampleDemoProviders(): Promise<number> {
  if (!db) throw new Error('Database is not initialized');

  const now = new Date().toISOString();
  const sampleProviders: ProviderProfile[] = [
    {
      id: 'prov_demo_apex_plumbing',
      userId: 'usr_demo_plumbing',
      businessName: '[DEMO] Apex Master Plumbing Co.',
      contactName: 'Marcus Vance, RMP #41092',
      email: 'demo-plumber@localverity.local',
      phone: '(512) 555-0182',
      category: 'Plumbing',
      services: ['Water Heater Replacement', 'Drain Snaking & Camera', 'Emergency Slab Leak Repair', 'Whole-Home Repipe', 'Garbage Disposal'],
      bio: 'Third-generation Master Plumber specializing in residential plumbing emergencies, tankless water heater retrofits, and non-destructive acoustic slab leak locating. Fully insured and bonded. (Sample Demo Listing)',
      serviceArea: 'Austin, Round Rock, Westlake Hills, Pflugerville, Lake Travis',
      hourlyRate: '125',
      flatRateDescription: '$69 trip & diagnostic fee, applied 100% toward any completed repair or fixture installation.',
      photoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      yearsInBusiness: 14,
      responseTime: '< 1 hour',
      depositPaymentUrl: 'https://buy.stripe.com/demo_deposit_apex_plumbing',
      status: 'approved',
      strikes: 0,
      reliabilityScore: 98,
      completedBookingsCount: 84,
      totalEndedBookingsCount: 86,
      averageRating: 4.9,
      reviewCount: 38,
      isAvailable: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prov_demo_lonestar_electric',
      userId: 'usr_demo_electric',
      businessName: '[DEMO] Lone Star Precision Electrical',
      contactName: 'Elena Rostova, Master Electrician',
      email: 'demo-electrician@localverity.local',
      phone: '(512) 555-0249',
      category: 'Electrical',
      services: ['200A Breaker Panel Upgrade', 'Tesla & EV Charger Install', 'Whole-Home Surge Protection', 'Recessed LED Retrofit', 'Code Compliance & Inspection'],
      bio: 'Texas TECL licensed contractor specializing in modern electrical service upgrades, Level 2 EV charging circuits, smart subpanels, and architectural lighting installations. (Sample Demo Listing)',
      serviceArea: 'Austin, Cedar Park, Lakeway, Buda, Oak Hill',
      hourlyRate: '110',
      flatRateDescription: 'Free upfront phone estimates. Flat-rate $450 EV charger standard installation package.',
      photoUrl: 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&w=400&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80',
      yearsInBusiness: 9,
      responseTime: '< 2 hours',
      depositPaymentUrl: 'https://buy.stripe.com/demo_deposit_lonestar_electric',
      status: 'approved',
      strikes: 0,
      reliabilityScore: 96,
      completedBookingsCount: 62,
      totalEndedBookingsCount: 64,
      averageRating: 4.8,
      reviewCount: 29,
      isAvailable: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prov_demo_hillcountry_hvac',
      userId: 'usr_demo_hvac',
      businessName: '[DEMO] Hill Country Climate & HVAC',
      contactName: 'Derrick Holbrook, TACLA #88319',
      email: 'demo-hvac@localverity.local',
      phone: '(512) 555-0371',
      category: 'HVAC',
      services: ['AC Emergency Repair', 'High-Efficiency Heat Pumps', 'Seasonal 24-Point Tune Up', 'Air Duct Sanitation', 'Smart Thermostat Setup'],
      bio: 'Trusted heating and air conditioning professionals with EPA universal certifications. Transparent pricing, same-day dispatch, and guaranteed 10-year parts warranties. (Sample Demo Listing)',
      serviceArea: 'Austin, Round Rock, Georgetown, Kyle, Dripping Springs',
      hourlyRate: '95',
      flatRateDescription: '$79 complete 24-point AC safety & freon diagnostic. Zero overtime weekend fees.',
      photoUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80',
      yearsInBusiness: 12,
      responseTime: '< 30 mins',
      depositPaymentUrl: 'https://buy.stripe.com/demo_deposit_hillcountry_hvac',
      status: 'approved',
      strikes: 0,
      reliabilityScore: 100,
      completedBookingsCount: 112,
      totalEndedBookingsCount: 112,
      averageRating: 5.0,
      reviewCount: 52,
      isAvailable: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prov_demo_capitol_craft',
      userId: 'usr_demo_craft',
      businessName: '[DEMO] Capitol City Craft Handyman & Tile',
      contactName: 'Julian Ramirez',
      email: 'demo-handyman@localverity.local',
      phone: '(512) 555-0492',
      category: 'Handyman',
      services: ['Bathroom Tile & Regrouting', 'Drywall Patch & Texture Match', 'Door & Lock Hardware Repair', 'Cabinet Hardware & Carpentry', 'Ceiling Fan Installation'],
      bio: 'Detail-obsessed finishes craftsman with 16 years of residential remodeling experience. Known for clean job sites, surgical drywall patching, and precision tile work. (Sample Demo Listing)',
      serviceArea: 'Central Austin, Tarrytown, Hyde Park, South Congress, Travis Heights',
      hourlyRate: '85',
      flatRateDescription: 'Half-day (4hr) flat rate $320 or full-day punchlist rate $600 with all basic fasteners included.',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
      yearsInBusiness: 16,
      responseTime: '< 2 hours',
      depositPaymentUrl: 'https://buy.stripe.com/demo_deposit_capitol_craft',
      status: 'approved',
      strikes: 0,
      reliabilityScore: 95,
      completedBookingsCount: 45,
      totalEndedBookingsCount: 47,
      averageRating: 4.9,
      reviewCount: 22,
      isAvailable: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const prov of sampleProviders) {
    await setDoc(doc(db, 'providers', prov.id), prov);

    // Create verified credentials doc
    const vDoc: VerificationDocument = {
      id: `vdoc_${prov.userId}`,
      providerId: prov.id,
      userId: prov.userId,
      idDocumentUrl: prov.photoUrl,
      licenseDocumentUrl: 'https://localverity.storage.local/licenses/sample_verified_state_license.pdf',
      insuranceDocumentUrl: 'https://localverity.storage.local/insurance/sample_coi_policy.pdf',
      idVerified: true,
      licenseVerified: true,
      insuranceVerified: true,
      licenseNumber: `TX-${prov.category.toUpperCase().slice(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`,
      insuranceProvider: 'Travelers Commercial Casualty ($1M / $2M Aggregate)',
      notes: 'Credentials verified by platform compliance operator. [DEMO SAMPLE]',
      status: 'verified',
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'verification_documents', vDoc.id), vDoc);

    // Create a real initial verified review for each
    const sampleReview = {
      id: `rev_${prov.id}_sample`,
      bookingId: `bkg_seed_${prov.id}`,
      providerId: prov.id,
      customerId: 'usr_customer_demo_local',
      customerName: 'Rachel Henderson (Central Austin)',
      rating: 5,
      title: 'Prompt, extremely professional, and upfront pricing',
      comment: `Showed up right on schedule, diagnosed the issue within 15 minutes, and explained the exact repair cost before starting. Cleaned up everything spotless before leaving. Will absolutely hire again through ${prov.businessName}!`,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    };
    await setDoc(doc(db, 'reviews', sampleReview.id), sampleReview);
  }

  return sampleProviders.length;
}

/**
 * Removes all clearly labeled demo providers with one click.
 */
export async function removeSampleDemoProviders(): Promise<number> {
  if (!db) throw new Error('Database is not initialized');

  let removedCount = 0;
  for (const id of DEMO_PROVIDER_IDS) {
    try {
      await deleteDoc(doc(db, 'providers', id));
      const vdocId = `vdoc_usr_demo_${id.replace('prov_demo_', '')}`;
      await deleteDoc(doc(db, 'verification_documents', vdocId));
      await deleteDoc(doc(db, 'reviews', `rev_${id}_sample`));
      removedCount++;
    } catch (e) {
      console.warn(`Could not remove demo provider ${id}:`, e);
    }
  }

  return removedCount;
}

/**
 * Checks if demo providers currently exist in Firestore.
 */
export async function hasSampleDemoProviders(): Promise<boolean> {
  if (!db) return false;
  try {
    const snap = await getDoc(doc(db, 'providers', DEMO_PROVIDER_IDS[0]));
    return snap.exists();
  } catch {
    return false;
  }
}

export const seedSampleAustinProviders = loadSampleDemoProviders;
