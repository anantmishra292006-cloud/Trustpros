import React from 'react';
import { ShieldCheck, Award, AlertTriangle } from 'lucide-react';

interface ReliabilityBadgeProps {
  score: number;
  completedCount?: number;
  strikes?: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function ReliabilityBadge({
  score,
  completedCount = 0,
  strikes = 0,
  size = 'md',
  showDetails = true,
}: ReliabilityBadgeProps) {
  // Determine color badge based on score
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
  let iconColor = 'text-emerald-600 dark:text-emerald-400';

  if (score < 75 || strikes >= 2) {
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    iconColor = 'text-rose-600 dark:text-rose-400';
  } else if (score < 90 || strikes === 1) {
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    iconColor = 'text-amber-600 dark:text-amber-400';
  }

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <div
        className={`inline-flex items-center gap-1.5 border rounded-full font-semibold transition-colors ${badgeColor} ${
          isSmall ? 'px-2 py-0.5 text-xs' : isLarge ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
        }`}
        title={`Reliability Score: ${score}% based on completed appointments vs cancellations/no-shows`}
      >
        <ShieldCheck className={`${isSmall ? 'w-3 h-3' : isLarge ? 'w-4 h-4' : 'w-3.5 h-3.5'} ${iconColor}`} />
        <span>{score}% Reliable</span>
        {showDetails && (
          <span className="opacity-75 font-normal">
            • {completedCount} {completedCount === 1 ? 'job' : 'jobs'}
          </span>
        )}
      </div>

      {strikes > 0 && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          title={`${strikes} active administrative strike${strikes > 1 ? 's' : ''} on record`}
        >
          <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          {strikes} {strikes === 1 ? 'Strike' : 'Strikes'}
        </span>
      )}
    </div>
  );
}
