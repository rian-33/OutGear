'use client';

import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from './utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

const base =
  'h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, ...rest },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(
        base,
        invalid ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]',
        className
      )}
      {...rest}
    />
  );
});
