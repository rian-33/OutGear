'use client';

import type { HTMLAttributes } from 'react';
import { cn } from './utils';

/** Panel penampung konten — surface + border radius 12px (PRD-4 §6.3). */
export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 p-5 pb-0', className)}>{children}</div>;
}

export function CardTitle({ className, children }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-display text-lg font-semibold text-[var(--color-text)]', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-[var(--color-muted)]', className)}>{children}</p>;
}

export function CardContent({ className, children }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

export function CardFooter({ className, children }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-border)] p-5',
        className
      )}
    >
      {children}
    </div>
  );
}
