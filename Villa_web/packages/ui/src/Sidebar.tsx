'use client';

import type { ReactNode } from 'react';
import { cn } from './utils';

export interface SidebarItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

interface SidebarProps {
  title: string;
  subtitle?: string;
  items: SidebarItem[];
  activePath?: string;
  footer?: ReactNode;
  open?: boolean;
  onClose?: () => void;
}

/**
 * Sidebar responsif — fixed di desktop (>=1280px), drawer + hamburger di mobile
 * (PRD-4 §7 Responsive).
 */
export function Sidebar({
  title,
  subtitle,
  items,
  activePath,
  footer,
  open,
  onClose,
}: SidebarProps) {
  const isOpen = open ?? false;

  const content = (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-[var(--color-border)] px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)] font-display font-bold text-white">
          K
        </div>
        <div className="min-w-0">
          <p className="truncate font-display font-semibold text-[var(--color-text)]">{title}</p>
          {subtitle && <p className="truncate text-xs text-[var(--color-muted)]">{subtitle}</p>}
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active = item.href === activePath;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge}
            </a>
          );
        })}
      </nav>
      {footer && <div className="border-t border-[var(--color-border)] p-3">{footer}</div>}
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:flex lg:flex-col">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => onClose?.()} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => onClose?.()}
              className="absolute right-3 top-4 rounded p-1 text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <div className="mt-2 flex-1">{content}</div>
          </aside>
        </div>
      )}
    </>
  );
}
