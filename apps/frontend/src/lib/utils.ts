import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export const inr = (n: number | string) =>
  '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const discountedPrice = (price: number | string, discount: number | string) => {
  const p = Number(price); const d = Number(discount) || 0;
  return Math.round(p * (1 - d / 100));
};
