'use client';

import { cn } from './utils';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'accent';

const trackMap: Record<Variant, string> = {
  default: 'bg-[var(--color-surface-2)]',
  success: 'text-[var(--color-success)] bg-[var(--color-success)]/15',
  warning: 'text-[var(--color-warning)] bg-[var(--color-warning)]/15',
  danger: 'text-[var(--color-danger)] bg-[var(--color-danger)]/15',
  accent: 'text-[var(--color-accent)] bg-[var(--color-accent)]/15',
};

const fillMap: Record<Variant, string> = {
  default: 'bg-[var(--color-accent)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]',
  accent: 'bg-[var(--color-accent)]',
};

export function ProgressBar({
  value,
  variant = 'default',
  className,
  showLabel = true,
}: {
  value: number;
  variant?: Variant;
  className?: string;
  showLabel?: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-[var(--color-muted)]">
          <span className="tabular-nums">{clamped}%</span>
        </div>
      )}
      <div className={cn('h-2 w-full overflow-hidden rounded-full', trackMap[variant])}>
        <div
          className={cn('h-full rounded-full transition-all', fillMap[variant])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
