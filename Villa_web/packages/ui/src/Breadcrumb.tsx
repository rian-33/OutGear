'use client';

import { Fragment } from 'react';
import { cn } from './utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex flex-wrap items-center gap-1.5 text-sm', className)}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={item.label}>
            {item.href && !isLast ? (
              <a
                href={item.href}
                className="text-[var(--color-muted)] hover:text-[var(--color-accent)]"
              >
                {item.label}
              </a>
            ) : (
              <span
                className={cn(isLast ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]')}
              >
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-[var(--color-muted)]">/</span>}
          </Fragment>
        );
      })}
    </nav>
  );
}
