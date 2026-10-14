import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kost/ui';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Login' };

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Masuk ke Savana Villa</CardTitle>
        <CardDescription>Panel masuk khusus pengelola villa.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Memuat…</p>}>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
