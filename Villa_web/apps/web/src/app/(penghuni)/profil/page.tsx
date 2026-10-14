'use client';

import { FormEvent, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
  useToast,
} from '@kost/ui';
import { formatRupiah, formatTanggal } from '@kost/ui';
import type { PenghuniView } from '@/lib/api';
import { useProfil, useUpdateUser } from '@/lib/queries';
import { ApiError } from '@/lib/api';
import { QueryState } from '@/components/data';
import { useAuth } from '@/lib/auth-context';

export default function ProfilPage() {
  const profil = useProfil();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">Profil</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Kelola data diri serta ganti kata sandi (F-04, F-05).
        </p>
      </div>

      <QueryState query={profil} skeletonRows={3}>
        {(u) => (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi akun</CardTitle>
                <CardDescription>Data yang tampil di sistem.</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                  <ProfileItem label="Nama" value={u.nama_lengkap} />
                  <ProfileItem label="Username" value={`@${u.username}`} />
                  <ProfileItem label="Email" value={u.email} />
                  <ProfileItem label="Kamar" value={u.kamar?.no_kamar ?? 'Belum ditempatkan'} />
                  <ProfileItem
                    label="Biaya sewa"
                    value={u.kamar ? formatRupiah(u.kamar.harga) + '/bln' : '—'}
                  />
                  <ProfileItem
                    label="Masa sewa"
                    value={u.detail ? formatTanggal(u.detail.jatuh_tempo) + ' (aktif)' : '—'}
                  />
                </dl>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <EditProfilForm user={u} />
              <ChangePasswordForm />
            </div>
          </div>
        )}
      </QueryState>
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-muted)]">{label}</dt>
      <dd className="mt-0.5 font-medium text-[var(--color-text)]">{value}</dd>
    </div>
  );
}

function EditProfilForm({ user }: { user: PenghuniView }) {
  const update = useUpdateUser();
  const [nama, setNama] = useState(user.nama_lengkap);
  const [hp, setHp] = useState(user.no_hp ?? '');

  async function submit(e: FormEvent) {
    e.preventDefault();
    await update.mutateAsync({
      id: user.id_user,
      nama_lengkap: nama,
      ...(hp.trim() ? { no_hp: hp.trim() } : {}),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubah profil</CardTitle>
        <CardDescription>Nama lengkap dan nomor HP.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-profil" onSubmit={submit} className="space-y-4">
          <Field label="Nama lengkap" required>
            <Input value={nama} onChange={(e) => setNama(e.target.value)} required />
          </Field>
          <Field label="No. HP">
            <Input value={hp} onChange={(e) => setHp(e.target.value)} placeholder="08xxxxxxxxxx" />
          </Field>
          <Button type="submit" form="form-profil" isLoading={update.isPending}>
            Simpan Profil
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const { toast } = useToast();
  const [lama, setLama] = useState('');
  const [baru, setBaru] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (baru !== konfirmasi) {
      toast({
        title: 'Gagal',
        description: 'Konfirmasi kata sandi tidak cocok.',
        variant: 'danger',
      });
      return;
    }
    if (baru.length < 8) {
      toast({
        title: 'Gagal',
        description: 'Kata sandi baru minimal 8 karakter.',
        variant: 'danger',
      });
      return;
    }
    setLoading(true);
    try {
      await changePassword(lama, baru);
      toast({ title: 'Berhasil', description: 'Kata sandi diperbarui.', variant: 'success' });
      setLama('');
      setBaru('');
      setKonfirmasi('');
    } catch (error) {
      toast({
        title: 'Gagal',
        description: error instanceof ApiError ? error.message : 'Kata sandi tidak dapat diubah.',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganti kata sandi</CardTitle>
        <CardDescription>Minimal 8 karakter, berisi huruf dan angka.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-password" onSubmit={submit} className="space-y-4">
          <Field label="Kata sandi lama" required>
            <Input
              type="password"
              value={lama}
              onChange={(e) => setLama(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>
          <Field label="Kata sandi baru" required>
            <Input
              type="password"
              value={baru}
              onChange={(e) => setBaru(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </Field>
          <Field label="Ulangi kata sandi baru" required>
            <Input
              type="password"
              value={konfirmasi}
              onChange={(e) => setKonfirmasi(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </Field>
          <Button type="submit" form="form-password" variant="warning" isLoading={loading}>
            Ganti Kata Sandi
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
