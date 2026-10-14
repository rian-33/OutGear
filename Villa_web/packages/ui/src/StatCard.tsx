'use client';

import type { ReactNode } from 'react';
import { cn } from './utils';

type Tone = 'default' | 'success' | 'warning' | 'danger' | 'accent';

const toneMap: Record<Tone, string> = {
  default: 'text-[var(--color-text)]',
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  danger: 'text-[var(--color-danger)]',
  accent: 'text-[var(--color-accent)]',
};

const iconBgMap: Record<Tone, string> = {
  default: 'bg-[var(--color-surface-2)] text-[var(--color-text)]',
  success: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]',
  accent: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]',
};

export interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
}

/** Kartu statistik ringkas untuk dashboard (PRD-3 FR-32/33). */
export function StatCard({ label, value, hint, tone = 'default', icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            {label}
          </p>
          <p
            className={cn(
              'mt-1 truncate font-display text-2xl font-semibold tabular-nums',
              toneMap[tone]
            )}
          >
            {value}
          </p>
          {hint && <p className="mt-1 truncate text-xs text-[var(--color-muted)]">{hint}</p>}
        </div>
        {icon && (
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              iconBgMap[tone]
            )}
          >
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
