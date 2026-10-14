'use client';

import type { HTMLAttributes } from 'react';
import { cn } from './utils';

type Cols = 1 | 2 | 3 | 4;

const colsMap: Record<Cols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: Cols;
}

export function Grid({ className, cols = 4, children, ...rest }: GridProps) {
  return (
    <div className={cn('grid gap-4', colsMap[cols], className)} {...rest}>
      {children}
    </div>
  );
}
