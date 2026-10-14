'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Field, Input, useToast } from '@kost/ui';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

export function LoginForm() {
  const { toast } = useToast();
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get('username') ?? '');
    const password = String(form.get('password') ?? '');

    setLoading(true);
    try {
      const pengguna = await login({ username, password });
      toast({
        title: 'Berhasil masuk',
        description: `Selamat datang, ${pengguna.nama_lengkap}.`,
        variant: 'success',
      });
      const tujuan = searchParams.get('next');
      const target =
        tujuan && tujuan.startsWith('/')
          ? tujuan
          : pengguna.role === 'ADMIN'
            ? '/admin/dashboard'
            : '/dashboard';
      router.replace(target);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Login gagal',
        description:
          error instanceof ApiError && (error.status === 401 || error.status === 429)
            ? error.message
            : 'Username atau password salah.',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Username" htmlFor="login-username" required>
        <Input
          id="login-username"
          name="username"
          placeholder="username"
          autoComplete="username"
          required
        />
      </Field>
      <Field label="Password" htmlFor="login-password" required>
        <Input
          id="login-password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </Field>
      <Button type="submit" size="lg" isLoading={loading} className="w-full">
        Masuk
      </Button>
      {process.env.NODE_ENV !== 'production' && (
        <p className="text-center text-xs text-[var(--color-muted)]">
          Akun admin seed (setelah menjalankan prisma:seed):{' '}
          <span className="font-mono">admin</span> / <span className="font-mono">Admin123!</span>
        </p>
      )}
    </form>
  );
}
