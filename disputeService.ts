import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Dispute, DisputeStatus } from '../types';
import { getBookingById } from './bookingService';
import { adminIssueStrike } from './providerService';

export async function openDispute(params: {
  bookingId: string;
  openedByUserId: string;
  openedByRole: 'customer' | 'provider';
  reason: string;
  description: string;
}): Promise<Dispute> {
  if (!db) throw new Error('Database is not initialized');

  const booking = await getBookingById(params.bookingId);
  if (!booking) throw new Error('Booking not found');

  const disputeId = `disp_${params.bookingId}_${Date.now()}`;
  const now = new Date().toISOString();

  const dispute: Dispute = {
    id: disputeId,
    bookingId: params.bookingId,
    openedByUserId: params.openedByUserId,
    openedByRole: params.openedByRole,
    providerId: booking.providerId,
    providerUserId: booking.providerUserId,
    customerId: booking.customerId,
    reason: params.reason.trim(),
    description: params.description.trim(),
    status: 'open',
    createdAt: now,
    updatedAt: now,
  };

  const path = `disputes/${disputeId}`;
  try {
    await setDoc(doc(db, 'disputes', disputeId), dispute);

    // Update booking status to disputed and append timeline event
    await updateDoc(doc(db, 'bookings', params.bookingId), {
      status: 'disputed',
      timeline: [
        ...booking.timeline,
        {
          timestamp: now,
          actor: params.openedByRole,
          action: 'Dispute Opened',
          note: `Reason: ${params.reason}. "${params.description.slice(0, 100)}..."`,
        },
      ],
      updatedAt: now,
    });

    return dispute;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function adminResolveDispute(params: {
  disputeId: string;
  adminUserId: string;
  resolutionNotes: string;
  issueStrikeToProvider: boolean;
  strikeReason?: string;
  newBookingStatus?: 'completed' | 'cancelled_by_provider' | 'cancelled_by_customer';
}): Promise<void> {
  if (!db) throw new Error('Database is not initialized');

  const dispSnap = await getDoc(doc(db, 'disputes', params.disputeId));
  if (!dispSnap.exists()) throw new Error('Dispute document not found');
  const dispute = dispSnap.data() as Dispute;

  const now = new Date().toISOString();
  const path = `disputes/${params.disputeId}`;

  try {
    // 1. If strike requested, issue strike to provider
    if (params.issueStrikeToProvider) {
      await adminIssueStrike(
        dispute.providerId,
        params.strikeReason || `Dispute resolution penalty: ${params.resolutionNotes}`
      );
    }

    // 2. Update dispute document
    await updateDoc(doc(db, 'disputes', params.disputeId), {
      status: 'resolved' as DisputeStatus,
      resolutionNotes: params.resolutionNotes.trim(),
      strikeIssuedToProvider: params.issueStrikeToProvider,
      resolvedAt: now,
      resolvedByUserId: params.adminUserId,
      updatedAt: now,
    });

    // 3. Update booking status and timeline
    const booking = await getBookingById(dispute.bookingId);
    if (booking) {
      const finalStatus = params.newBookingStatus || booking.status;
      await updateDoc(doc(db, 'bookings', dispute.bookingId), {
        status: finalStatus,
        timeline: [
          ...booking.timeline,
          {
            timestamp: now,
            actor: 'admin',
            action: 'Dispute Resolved by Admin',
            note: `Resolution: ${params.resolutionNotes}${
              params.issueStrikeToProvider ? ' (Administrative Strike issued to provider)' : ''
            }`,
          },
        ],
        updatedAt: now,
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function getAllDisputes(): Promise<Dispute[]> {
  if (!db) return [];
  const path = 'disputes';
  try {
    const snap = await getDocs(collection(db, 'disputes'));
    const list = snap.docs.map((d) => d.data() as Dispute);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}
