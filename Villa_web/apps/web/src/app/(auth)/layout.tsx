import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Login' };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-admin flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-10">
      {children}
    </div>
  );
}
