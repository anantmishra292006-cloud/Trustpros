import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Review } from '../types';
import { getBookingById } from './bookingService';
import { getProviderById } from './providerService';

export async function createReview(params: {
  bookingId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
}): Promise<Review> {
  if (!db) throw new Error('Database is not initialized');

  // Verify booking validity & customer ownership
  const booking = await getBookingById(params.bookingId);
  if (!booking) throw new Error('Booking record not found.');
  if (booking.customerId !== params.customerId) {
    throw new Error('You can only submit a review for your own bookings.');
  }
  if (booking.status !== 'completed') {
    throw new Error('Reviews can only be submitted after the service has reached completed status.');
  }
  if (booking.hasReview) {
    throw new Error('A review has already been submitted for this booking.');
  }

  const reviewId = `rev_${params.bookingId}`;
  const now = new Date().toISOString();

  const review: Review = {
    id: reviewId,
    bookingId: params.bookingId,
    providerId: booking.providerId,
    customerId: params.customerId,
    customerName: params.customerName.trim(),
    rating: Math.max(1, Math.min(5, Math.round(params.rating))),
    title: params.title.trim(),
    comment: params.comment.trim(),
    createdAt: now,
  };

  const path = `reviews/${reviewId}`;
  try {
    await setDoc(doc(db, 'reviews', reviewId), review);

    // Update booking flag
    await updateDoc(doc(db, 'bookings', params.bookingId), {
      hasReview: true,
      updatedAt: now,
    });

    // Recompute provider average rating and count
    const q = query(collection(db, 'reviews'), where('providerId', '==', booking.providerId));
    const allReviewsSnap = await getDocs(q);
    const reviews = allReviewsSnap.docs.map((d) => d.data() as Review);

    const totalStars = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = reviews.length > 0 ? parseFloat((totalStars / reviews.length).toFixed(1)) : 5.0;

    await updateDoc(doc(db, 'providers', booking.providerId), {
      averageRating: avg,
      reviewCount: reviews.length,
      updatedAt: now,
    });

    return review;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getProviderReviews(providerId: string): Promise<Review[]> {
  if (!db) return [];
  const path = 'reviews';
  try {
    const q = query(collection(db, 'reviews'), where('providerId', '==', providerId));
    const snap = await getDocs(q);
    const reviews = snap.docs.map((d) => d.data() as Review);
    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}
