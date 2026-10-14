'use client';

import type { HTMLAttributes } from 'react';
import { cn } from './utils';

type Gap = 0 | 1 | 2 | 3 | 4 | 6 | 8;

const gapMap: Record<Gap, string> = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8',
};

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: Gap;
}

export function Stack({ className, gap = 4, children, ...rest }: StackProps) {
  return (
    <div className={cn('flex flex-col', gapMap[gap], className)} {...rest}>
      {children}
    </div>
  );
}
