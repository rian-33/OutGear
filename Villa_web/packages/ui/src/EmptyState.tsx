'use client';

import type { ReactNode } from 'react';
import { cn } from './utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="font-display text-base font-semibold text-[var(--color-text)]">{title}</p>
        {description && (
          <p className="mx-auto max-w-md text-sm text-[var(--color-muted)]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
