'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input, useToast } from '@kost/ui';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

export function RegisterForm() {
  const { toast } = useToast();
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const no_hp = String(form.get('no_hp') ?? '').trim();

    setLoading(true);
    try {
      const pengguna = await register({
        username: String(form.get('username') ?? ''),
        nama_lengkap: String(form.get('nama_lengkap') ?? ''),
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
        ...(no_hp ? { no_hp } : {}),
      });
      toast({
        title: 'Akun dibuat',
        description: `Selamat datang, ${pengguna.nama_lengkap}!`,
        variant: 'success',
      });
      router.replace(pengguna.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Registrasi gagal',
        description:
          error instanceof ApiError ? error.message : 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Nama lengkap" htmlFor="reg-nama" required>
        <Input
          id="reg-nama"
          name="nama_lengkap"
          placeholder="Nama lengkap"
          minLength={3}
          required
        />
      </Field>
      <Field
        label="Username"
        htmlFor="reg-username"
        required
        hint="3–30 karakter: huruf kecil, angka, titik, strip, garis bawah"
      >
        <Input
          id="reg-username"
          name="username"
          placeholder="username.kamu"
          pattern="[a-zA-Z0-9._-]{3,30}"
          title="3–30 karakter: huruf kecil, angka, titik, strip, atau garis bawah"
          required
        />
      </Field>
      <Field label="Email" htmlFor="reg-email" required>
        <Input id="reg-email" name="email" type="email" placeholder="email@contoh.com" required />
      </Field>
      <Field label="No. HP" htmlFor="reg-hp">
        <Input
          id="reg-hp"
          name="no_hp"
          placeholder="08xxxxxxxxxx"
          pattern="\+?\d{8,15}"
          title="8–15 digit, boleh diawali tanda +"
        />
      </Field>
      <Field
        label="Password"
        htmlFor="reg-password"
        required
        hint="Minimal 8 karakter, berisi huruf dan angka"
      >
        <Input
          id="reg-password"
          name="password"
          type="password"
          placeholder="Minimal 8 karakter"
          minLength={8}
          required
        />
      </Field>
      <Button type="submit" size="lg" isLoading={loading} className="w-full">
        Daftar
      </Button>
    </form>
  );
}
