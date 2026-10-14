'use client';

import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from './utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const base =
  'h-10 w-full rounded-lg border bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        base,
        invalid
          ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
          : 'border-[var(--color-border)]',
        className
      )}
      {...rest}
    />
  );
});
