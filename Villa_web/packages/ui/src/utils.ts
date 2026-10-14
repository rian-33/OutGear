import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Gabungkan class Tailwind dengan resolusi konflik (mengikuti urutan terakhir menang). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
