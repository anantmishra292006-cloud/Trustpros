export type UserRole = 'admin' | 'provider' | 'customer' | 'visitor';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type ProviderStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface ProviderProfile {
  id: string;
  userId: string;
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
  status: ProviderStatus;
  rejectionReason?: string;
  strikes: number;
  reliabilityScore: number;
  completedBookingsCount: number;
  totalEndedBookingsCount: number;
  averageRating: number;
  reviewCount: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationDocument {
  id: string;
  providerId: string;
  userId: string;
  idDocumentUrl: string;
  licenseDocumentUrl: string;
  insuranceDocumentUrl: string;
  idVerified?: boolean;
  licenseVerified?: boolean;
  insuranceVerified?: boolean;
  licenseNumber?: string;
  insuranceProvider?: string;
  notes?: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | 'requested'
  | 'confirmed'
  | 'completed'
  | 'no_show_customer'
  | 'no_show_provider'
  | 'cancelled_by_customer'
  | 'cancelled_by_provider'
  | 'disputed';

export interface BookingTimelineEvent {
  timestamp: string;
  actor: 'customer' | 'provider' | 'admin' | 'system';
  action: string;
  note?: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  providerId: string;
  providerUserId: string;
  providerBusinessName: string;
  serviceCategory: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceAddress: string;
  notes: string;
  depositPaymentUrl?: string;
  depositPaid: boolean;
  depositPaidAt?: string;
  depositConfirmedByProvider: boolean;
  depositConfirmedAt?: string;
  status: BookingStatus;
  timeline: BookingTimelineEvent[];
  cancellationReason?: string;
  hasReview?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  providerId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export type DisputeStatus = 'open' | 'under_review' | 'resolved';

export interface Dispute {
  id: string;
  bookingId: string;
  openedByUserId: string;
  openedByRole: 'customer' | 'provider';
  providerId: string;
  providerUserId: string;
  customerId: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  resolutionNotes?: string;
  strikeIssuedToProvider?: boolean;
  resolvedAt?: string;
  resolvedByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandingSettings {
  appName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string; // hex code or preset identifier
  cityRegion: string;
  categories: string[];
  globalDepositInstructions: string;
  termsOfService: string;
  privacyPolicy: string;
  escrowDisclaimer: string;
  updatedAt?: string;
}
