import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Booking, BookingStatus, BookingTimelineEvent } from '../types';
import { recalculateReliabilityScore } from './providerService';

export async function createBooking(params: {
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
}): Promise<Booking> {
  if (!db) throw new Error('Database is not initialized');

  const bookingId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const initialTimeline: BookingTimelineEvent[] = [
    {
      timestamp: now,
      actor: 'customer',
      action: 'Booking Requested',
      note: 'Customer submitted appointment request.',
    },
  ];

  const booking: Booking = {
    id: bookingId,
    customerId: params.customerId,
    customerName: params.customerName.trim(),
    customerEmail: params.customerEmail.trim(),
    customerPhone: params.customerPhone.trim(),
    providerId: params.providerId,
    providerUserId: params.providerUserId,
    providerBusinessName: params.providerBusinessName,
    serviceCategory: params.serviceCategory,
    appointmentDate: params.appointmentDate,
    appointmentTime: params.appointmentTime,
    serviceAddress: params.serviceAddress.trim(),
    notes: params.notes.trim(),
    depositPaymentUrl: params.depositPaymentUrl || '',
    depositPaid: false,
    depositConfirmedByProvider: false,
    status: 'requested',
    timeline: initialTimeline,
    hasReview: false,
    createdAt: now,
    updatedAt: now,
  };

  const path = `bookings/${bookingId}`;
  try {
    await setDoc(doc(db, 'bookings', bookingId), booking);
    return booking;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function customerMarkDepositPaid(bookingId: string): Promise<void> {
  if (!db) return;
  const booking = await getBookingById(bookingId);
  if (!booking) throw new Error('Booking not found');

  const now = new Date().toISOString();
  const newTimeline: BookingTimelineEvent = {
    timestamp: now,
    actor: 'customer',
    action: 'Deposit Reported Paid',
    note: 'Customer marked the required deposit as completed via payment link.',
  };

  const path = `bookings/${bookingId}`;
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      depositPaid: true,
      depositPaidAt: now,
      timeline: [...booking.timeline, newTimeline],
      updatedAt: now,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function providerConfirmBooking(bookingId: string): Promise<void> {
  if (!db) return;
  const booking = await getBookingById(bookingId);
  if (!booking) throw new Error('Booking not found');

  const now = new Date().toISOString();
  const newTimeline: BookingTimelineEvent = {
    timestamp: now,
    actor: 'provider',
    action: 'Booking Confirmed',
    note: 'Provider verified deposit/slot and confirmed appointment.',
  };

  const path = `bookings/${bookingId}`;
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'confirmed',
      depositConfirmedByProvider: true,
      depositConfirmedAt: now,
      timeline: [...booking.timeline, newTimeline],
      updatedAt: now,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function markBookingCompleted(
  bookingId: string,
  actor: 'customer' | 'provider' | 'admin'
): Promise<void> {
  if (!db) return;
  const booking = await getBookingById(bookingId);
  if (!booking) throw new Error('Booking not found');

  const now = new Date().toISOString();
  const newTimeline: BookingTimelineEvent = {
    timestamp: now,
    actor,
    action: 'Service Marked Completed',
    note: `Work marked completed by ${actor}.`,
  };

  const path = `bookings/${bookingId}`;
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'completed',
      timeline: [...booking.timeline, newTimeline],
      updatedAt: now,
    });

    // Update provider reliability score and job counter
    await recalculateReliabilityScore(booking.providerId);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function reportNoShow(
  bookingId: string,
  actor: 'customer' | 'provider' | 'admin',
  partyWhoDidNotShow: 'customer' | 'provider'
): Promise<void> {
  if (!db) return;
  const booking = await getBookingById(bookingId);
  if (!booking) throw new Error('Booking not found');

  const targetStatus: BookingStatus =
    partyWhoDidNotShow === 'customer' ? 'no_show_customer' : 'no_show_provider';

  const now = new Date().toISOString();
  const newTimeline: BookingTimelineEvent = {
    timestamp: now,
    actor,
    action: `Reported No-Show: ${partyWhoDidNotShow === 'customer' ? 'Customer' : 'Provider'}`,
    note: `${actor.toUpperCase()} reported that the ${partyWhoDidNotShow} failed to attend scheduled slot.`,
  };

  const path = `bookings/${bookingId}`;
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: targetStatus,
      timeline: [...booking.timeline, newTimeline],
      updatedAt: now,
    });

    // Recalculate provider reliability if provider was the one who didn't show
    await recalculateReliabilityScore(booking.providerId);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function cancelBooking(
  bookingId: string,
  actor: 'customer' | 'provider' | 'admin',
  reason: string
): Promise<void> {
  if (!db) return;
  const booking = await getBookingById(bookingId);
  if (!booking) throw new Error('Booking not found');

  const targetStatus: BookingStatus =
    actor === 'customer' ? 'cancelled_by_customer' : 'cancelled_by_provider';

  const now = new Date().toISOString();
  const newTimeline: BookingTimelineEvent = {
    timestamp: now,
    actor,
    action: `Booking Cancelled by ${actor}`,
    note: reason.trim(),
  };

  const path = `bookings/${bookingId}`;
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: targetStatus,
      cancellationReason: reason.trim(),
      timeline: [...booking.timeline, newTimeline],
      updatedAt: now,
    });

    // If cancelled by provider, impacts provider reliability score
    await recalculateReliabilityScore(booking.providerId);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  if (!db) return null;
  const path = `bookings/${bookingId}`;
  try {
    const snap = await getDoc(doc(db, 'bookings', bookingId));
    if (snap.exists()) {
      return snap.data() as Booking;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function getCustomerBookings(customerId: string): Promise<Booking[]> {
  if (!db) return [];
  const path = 'bookings';
  try {
    const q = query(collection(db, 'bookings'), where('customerId', '==', customerId));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => d.data() as Booking);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function getProviderBookings(providerId: string): Promise<Booking[]> {
  if (!db) return [];
  const path = 'bookings';
  try {
    const q = query(collection(db, 'bookings'), where('providerId', '==', providerId));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => d.data() as Booking);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  if (!db) return [];
  const path = 'bookings';
  try {
    const snap = await getDocs(collection(db, 'bookings'));
    const list = snap.docs.map((d) => d.data() as Booking);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}
