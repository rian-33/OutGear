'use client';

import { cn } from './utils';

type Shape = 'line' | 'circle' | 'square' | 'rect';

export function Skeleton({ shape = 'line', className }: { shape?: Shape; className?: string }) {
  const base = 'animate-pulse bg-[var(--color-surface-2)]';
  const shapes: Record<Shape, string> = {
    line: 'h-3 rounded',
    circle: 'rounded-full',
    square: 'rounded-lg',
    rect: 'h-20 rounded-lg',
  };
  return <div className={cn(base, shapes[shape], className)} />;
}
