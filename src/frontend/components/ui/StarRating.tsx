import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  className?: string;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  className,
  interactive = false,
  onRate,
}: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.floor(rating);
        const halfFilled = !filled && i < rating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(i + 1)}
            className={cn(
              'relative',
              interactive && 'cursor-pointer hover:scale-110 transition-transform',
              !interactive && 'cursor-default'
            )}
          >
            <Star
              size={size}
              className={cn(
                filled
                  ? 'fill-accent text-accent'
                  : halfFilled
                  ? 'fill-accent/50 text-accent'
                  : 'fill-gray-200 text-gray-200'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
