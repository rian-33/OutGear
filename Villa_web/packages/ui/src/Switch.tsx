'use client';

import type { ButtonHTMLAttributes } from 'react';
import { cn } from './utils';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
}

export function Switch({ checked, onChange, label, className, disabled, ...rest }: SwitchProps) {
  const switchEl = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface-2)]',
        className
      )}
      {...rest}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );

  if (!label) return switchEl;
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]">
      {switchEl}
      {label}
    </label>
  );
}
