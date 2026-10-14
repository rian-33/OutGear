'use client';

import type {
  TdHTMLAttributes,
  ThHTMLAttributes,
  HTMLAttributes,
  TableHTMLAttributes,
} from 'react';
import { cn } from './utils';

type Align = 'left' | 'center' | 'right';

function alignClass(align: Align, numeric: boolean) {
  return cn(
    align === 'center' && 'text-center',
    align === 'right' && 'text-right',
    numeric && 'tabular-nums'
  );
}

export function Table({ className, children, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full text-sm text-[var(--color-text)]', className)} {...rest}>
        {children}
      </table>
    </div>
  );
}

export function THead({ className, children }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-muted)]',
        className
      )}
    >
      {children}
    </thead>
  );
}

export function TBody({ className, children }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('divide-y divide-[var(--color-border)]', className)}>{children}</tbody>
  );
}

export function TR({
  className,
  children,
  onClick,
  hover = true,
}: HTMLAttributes<HTMLTableRowElement> & { hover?: boolean }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        hover && 'transition-colors hover:bg-[var(--color-surface-2)]',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </tr>
  );
}

interface THProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
}

export function TH({ className, children, align = 'left', ...rest }: THProps) {
  return (
    <th
      className={cn('whitespace-nowrap px-4 py-3 font-medium', alignClass(align, true), className)}
      {...rest}
    >
      {children}
    </th>
  );
}

interface TDProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  numeric?: boolean;
}

export function TD({ className, children, align = 'left', numeric = false, ...rest }: TDProps) {
  return (
    <td
      className={cn('whitespace-nowrap px-4 py-3', alignClass(align, numeric), className)}
      {...rest}
    >
      {children}
    </td>
  );
}
