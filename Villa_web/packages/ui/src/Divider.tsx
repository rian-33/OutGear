'use client';

import type { HTMLAttributes } from 'react';
import { cn } from './utils';

export function Divider({ className, ...rest }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn('my-4 border-[var(--color-border)]', className)} {...rest} />;
}
