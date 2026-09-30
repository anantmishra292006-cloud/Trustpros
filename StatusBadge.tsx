import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertOctagon,
  AlertTriangle,
  CalendarCheck,
  Ban,
} from 'lucide-react';
import { BookingStatus, ProviderStatus, DisputeStatus } from '../../types';

interface StatusBadgeProps {
  status: BookingStatus | ProviderStatus | DisputeStatus | string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const isSm = size === 'sm';
  const padding = isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  switch (status) {
    // Provider Statuses
    case 'approved':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 ${padding}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Approved Pro
        </span>
      );
    case 'pending':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 ${padding}`}>
          <Clock className="w-3 h-3 text-amber-500" />
          Pending Review
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 ${padding}`}>
          <XCircle className="w-3 h-3 text-rose-500" />
          Application Rejected
        </span>
      );
    case 'suspended':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-red-100 text-red-800 border border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800 ${padding}`}>
          <Ban className="w-3 h-3 text-red-600" />
          Suspended
        </span>
      );

    // Booking Statuses
    case 'requested':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 ${padding}`}>
          <Clock className="w-3 h-3 text-blue-500" />
          Requested
        </span>
      );
    case 'confirmed':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 ${padding}`}>
          <CalendarCheck className="w-3 h-3 text-indigo-500" />
          Confirmed
        </span>
      );
    case 'completed':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 ${padding}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Completed
        </span>
      );
    case 'no_show_customer':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 ${padding}`}>
          <AlertOctagon className="w-3 h-3 text-rose-500" />
          Customer No-Show
        </span>
      );
    case 'no_show_provider':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 ${padding}`}>
          <AlertOctagon className="w-3 h-3 text-rose-500" />
          Provider No-Show
        </span>
      );
    case 'cancelled_by_customer':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${padding}`}>
          <XCircle className="w-3 h-3 text-slate-500" />
          Cancelled by Customer
        </span>
      );
    case 'cancelled_by_provider':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${padding}`}>
          <XCircle className="w-3 h-3 text-slate-500" />
          Cancelled by Provider
        </span>
      );
    case 'disputed':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800 ${padding}`}>
          <AlertTriangle className="w-3 h-3 text-purple-500" />
          Disputed
        </span>
      );

    // Dispute Statuses
    case 'open':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 ${padding}`}>
          <AlertTriangle className="w-3 h-3 text-rose-500" />
          Dispute Open
        </span>
      );
    case 'resolved':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 ${padding}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Resolved
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${padding}`}>
          {status}
        </span>
      );
  }
}
