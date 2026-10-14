'use client';

import type { InputHTMLAttributes } from 'react';
import { cn } from './utils';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ className, label, id, ...rest }: CheckboxProps) {
  const box = (
    <input
      id={id}
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]',
        className
      )}
      {...rest}
    />
  );

  if (!label) return box;
  return (
    <label
      htmlFor={id}
      className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]"
    >
      {box}
      {label}
    </label>
  );
}
