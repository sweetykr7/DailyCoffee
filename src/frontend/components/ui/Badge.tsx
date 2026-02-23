import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'sale' | 'new' | 'best' | 'soldout';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-coffee text-white',
  sale: 'bg-red-500 text-white',
  new: 'bg-accent text-white',
  best: 'bg-coffee-dark text-white',
  soldout: 'bg-gray-400 text-white',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded px-2 py-0.5 text-xs font-semibold',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
