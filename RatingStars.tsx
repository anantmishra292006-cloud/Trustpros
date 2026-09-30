import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
}

export function RatingStars({
  rating,
  max = 5,
  size = 'md',
  showCount = false,
  count,
  interactive = false,
  onChange,
}: RatingStarsProps) {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = rating >= starValue;
          return (
            <button
              type="button"
              key={index}
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform p-0.5' : 'cursor-default'}`}
              aria-label={`${starValue} star`}
            >
              <Star
                className={`${iconSize} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-200 dark:fill-slate-700 text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          );
        })}
      </div>
      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
        {rating.toFixed(1)}
      </span>
      {showCount && typeof count === 'number' && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}
