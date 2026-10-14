'use client';

import type { ReactNode } from 'react';
import { Avatar } from './Avatar';

interface TopbarProps {
  title: string;
  subtitle?: string;
  user?: { name: string; role?: string };
  actions?: ReactNode;
  onMenuClick?: () => void;
}

export function Topbar({ title, subtitle, user, actions, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 sm:px-6">
      {onMenuClick && (
        <button
          type="button"
          aria-label="Buka menu"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] lg:hidden"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-lg font-semibold text-[var(--color-text)]">
          {title}
        </h1>
        {subtitle && <p className="truncate text-xs text-[var(--color-muted)]">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
      {user && (
        <div className="flex items-center gap-2">
          <Avatar name={user.name} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[var(--color-text)]">{user.name}</p>
            {user.role && <p className="text-xs text-[var(--color-muted)]">{user.role}</p>}
          </div>
        </div>
      )}
    </header>
  );
}
