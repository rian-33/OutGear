'use client';

import type { ReactNode } from 'react';
import { cn } from './utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

const variants: Record<AlertVariant, { wrap: string; title: string }> = {
  info: {
    wrap: 'border-[var(--color-accent-2)]/40 bg-[var(--color-accent-2)]/10',
    title: 'text-[var(--color-accent-2)]',
  },
  success: {
    wrap: 'border-[var(--color-success)]/40 bg-[var(--color-success)]/10',
    title: 'text-[var(--color-success)]',
  },
  warning: {
    wrap: 'border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10',
    title: 'text-[var(--color-warning)]',
  },
  danger: {
    wrap: 'border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10',
    title: 'text-[var(--color-danger)]',
  },
};

export function Alert({
  variant = 'info',
  title,
  children,
  className,
}: {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const v = variants[variant];
  return (
    <div
      role="alert"
      className={cn('rounded-lg border p-4 text-sm text-[var(--color-text)]', v.wrap, className)}
    >
      {title && <p className={cn('font-display font-semibold', v.title)}>{title}</p>}
      {children && <div className="mt-1">{children}</div>}
    </div>
  );
}
