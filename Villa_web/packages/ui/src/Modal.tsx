'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { cn } from './utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl',
          sizeMap[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="space-y-1 border-b border-[var(--color-border)] p-5">
            {title && (
              <h3 className="font-display text-lg font-semibold text-[var(--color-text)]">
                {title}
              </h3>
            )}
            {description && <p className="text-sm text-[var(--color-muted)]">{description}</p>}
          </div>
        )}
        {children && <div className="p-5">{children}</div>}
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--color-border)] p-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
