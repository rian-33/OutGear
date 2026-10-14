'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './utils';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'muted';

const variants: Record<BadgeVariant, string> = {
  success:
    'bg-[var(--color-success)]/15 text-[var(--color-success)] ring-[var(--color-success)]/30',
  warning:
    'bg-[var(--color-warning)]/15 text-[var(--color-warning)] ring-[var(--color-warning)]/30',
  danger: 'bg-[var(--color-danger)]/15 text-[var(--color-danger)] ring-[var(--color-danger)]/30',
  info: 'bg-[var(--color-accent-2)]/15 text-[var(--color-accent-2)] ring-[var(--color-accent-2)]/30',
  accent: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] ring-[var(--color-accent)]/30',
  muted: 'bg-[var(--color-muted)]/15 text-[var(--color-muted)] ring-[var(--color-muted)]/30',
};

interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  variant?: BadgeVariant;
  children: ReactNode;
}

/** Badge status — pill rounded-full (PRD-4 §6.3). */
export function Badge({ variant = 'muted', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        variants[variant],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
