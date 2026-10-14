'use client';

import { FormEvent, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  Modal,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@kost/ui';
import { formatRupiah, formatTanggal } from '@kost/ui';
import type { PenghuniView } from '@/lib/api';
import {
  useAssignKamar,
  useCreateUser,
  useDeleteUser,
  useKamarOptions,
  useUpdateUser,
  useUsers,
} from '@/lib/queries';
import { Pagination, QueryState } from '@/components/data';
import { IconEdit, IconHome, IconPlus, IconSearch, IconTrash, IconUsers } from '@/components/icons';

type RoleFilter = '' | 'ADMIN' | 'PENGHUNI';

export default function AdminPenghuniPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<RoleFilter>('PENGHUNI');
  const [tanpaKamar, setTanpaKamar] = useState(false);
  const [page, setPage] = useState(1);
  const users = useUsers({ search, role, tanpa_kamar: tanpaKamar || undefined, page });

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<PenghuniView | null>(null);
  const [assign, setAssign] = useState<PenghuniView | null>(null);
  const [deleting, setDeleting] = useState<PenghuniView | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">Penghuni</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Manajemen data penghuni dan penempatan kamar (F-06 – F-10).
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Field label="Cari">
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
              <Input
                className="pl-9"
                placeholder="Nama, username, email…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </Field>
          <Field label="Peran">
            <Select value={role} onChange={(e) => setRole(e.target.value as RoleFilter)}>
              <option value="PENGHUNI">Penghuni</option>
              <option value="ADMIN">Admin</option>
              <option value="">Semua</option>
            </Select>
          </Field>
          <Checkbox
            label="Tanpa kamar"
            checked={tanpaKamar}
            onChange={(e) => {
              setTanpaKamar(e.target.checked);
              setPage(1);
            }}
          />
          <Button leftIcon={<IconPlus />} onClick={() => setCreateOpen(true)}>
            Tambah Penghuni
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar pengguna</CardTitle>
          <CardDescription>
            Hapus ditolak jika masih ada pembayaran menunggu konfirmasi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QueryState query={users}>
            {(data) => (
              <div className="space-y-4">
                {data.data.length === 0 ? (
                  <EmptyState
                    icon={<IconUsers />}
                    title="Tidak ada pengguna"
                    description="Ubah filter atau tambahkan penghuni baru."
                  />
                ) : (
                  <Table>
                    <THead>
                      <TR>
                        <TH>Nama</TH>
                        <TH>Kontak</TH>
                        <TH>Peran</TH>
                        <TH>Kamar</TH>
                        <TH>Masa sewa</TH>
                        <TH align="right">Aksi</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {data.data.map((u) => (
                        <TR key={u.id_user}>
                          <TD>
                            <span className="font-medium">{u.nama_lengkap}</span>
                            <span className="block text-xs text-[var(--color-muted)]">
                              @{u.username}
                            </span>
                          </TD>
                          <TD>
                            {u.email}
                            {u.no_hp && (
                              <span className="block text-xs text-[var(--color-muted)]">
                                {u.no_hp}
                              </span>
                            )}
                          </TD>
                          <TD>
                            <Badge variant={u.role === 'ADMIN' ? 'accent' : 'info'}>
                              {u.role === 'ADMIN' ? 'Admin' : 'Penghuni'}
                            </Badge>
                          </TD>
                          <TD>
                            {u.kamar ? (
                              <span>
                                {u.kamar.no_kamar}
                                <span className="block text-xs text-[var(--color-muted)]">
                                  {formatRupiah(u.kamar.harga)}/bln
                                </span>
                              </span>
                            ) : (
                              <span className="text-[var(--color-muted)]">—</span>
                            )}
                          </TD>
                          <TD>
                            {u.detail ? (
                              <span>
                                {formatTanggal(u.detail.tgl_masuk)}
                                <span className="block text-xs text-[var(--color-muted)]">
                                  s.d. {formatTanggal(u.detail.jatuh_tempo)}
                                </span>
                              </span>
                            ) : (
                              <span className="text-[var(--color-muted)]">Belum ditempatkan</span>
                            )}
                          </TD>
                          <TD align="right">
                            <div className="flex justify-end gap-1">
                              {u.role === 'PENGHUNI' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  leftIcon={<IconHome />}
                                  onClick={() => setAssign(u)}
                                >
                                  Kamar
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<IconEdit />}
                                onClick={() => setEditing(u)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[var(--color-danger)]"
                                leftIcon={<IconTrash />}
                                onClick={() => setDeleting(u)}
                              >
                                Hapus
                              </Button>
                            </div>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                )}
                <Pagination
                  page={data.meta.page}
                  totalPage={data.meta.totalPage}
                  onChange={setPage}
                />
              </div>
            )}
          </QueryState>
        </CardContent>
      </Card>

      {createOpen && <CreateUserModal onClose={() => setCreateOpen(false)} />}
      {editing && <EditUserModal user={editing} onClose={() => setEditing(null)} />}
      {assign && <AssignKamarModal user={assign} onClose={() => setAssign(null)} />}
      {deleting && <DeleteUserDialog user={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}

function DeleteUserDialog({ user, onClose }: { user: PenghuniView; onClose: () => void }) {
  const del = useDeleteUser();
  return (
    <ConfirmDialog
      open
      danger
      title={`Hapus ${user.nama_lengkap}?`}
      description="Pengguna dihapus permanen dan kamarnya dikosongkan. Ditolak bila masih ada pembayaran menunggu konfirmasi."
      confirmLabel={del.isPending ? 'Menghapus…' : 'Hapus'}
      onConfirm={() => del.mutate(user.id_user, { onSuccess: onClose })}
      onCancel={onClose}
    />
  );
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const create = useCreateUser();
  const kamar = useKamarOptions();
  const kosong = (kamar.data?.data ?? []).filter((k) => k.status === 'KOSONG');
  const [form, setForm] = useState({
    username: '',
    nama_lengkap: '',
    email: '',
    no_hp: '',
    password: '',
    id_kamar: '',
    tgl_masuk: '',
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    await create.mutateAsync(
      {
        username: form.username,
        nama_lengkap: form.nama_lengkap,
        email: form.email,
        password: form.password,
        ...(form.no_hp ? { no_hp: form.no_hp } : {}),
        ...(form.id_kamar ? { id_kamar: form.id_kamar } : {}),
        ...(form.tgl_masuk ? { tgl_masuk: form.tgl_masuk } : {}),
      },
      { onSuccess: onClose }
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Tambah penghuni"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={create.isPending}>
            Batal
          </Button>
          <Button type="submit" form="form-penghuni" isLoading={create.isPending}>
            Simpan
          </Button>
        </div>
      }
    >
      <form id="form-penghuni" onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama lengkap" required>
            <Input
              value={form.nama_lengkap}
              onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
              required
            />
          </Field>
          <Field label="Username" required>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              pattern="[a-zA-Z0-9._-]{3,30}"
              required
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </Field>
          <Field label="No. HP">
            <Input
              value={form.no_hp}
              onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
              placeholder="08xxxxxxxxxx"
            />
          </Field>
          <Field label="Password" required>
            <Input
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </Field>
          <Field label="Kamar (opsional)">
            <Select
              value={form.id_kamar}
              onChange={(e) => setForm({ ...form, id_kamar: e.target.value })}
            >
              <option value="">— Belum ditempatkan —</option>
              {kosong.map((k) => (
                <option key={k.id_kamar} value={k.id_kamar}>
                  {k.no_kamar} · {formatRupiah(k.harga)}/bln
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Tanggal masuk (opsional)" hint="Default hari ini; masa sewa 12 bulan.">
          <Input
            type="date"
            value={form.tgl_masuk}
            onChange={(e) => setForm({ ...form, tgl_masuk: e.target.value })}
          />
        </Field>
      </form>
    </Modal>
  );
}

function EditUserModal({ user, onClose }: { user: PenghuniView; onClose: () => void }) {
  const update = useUpdateUser();
  const [form, setForm] = useState({
    nama_lengkap: user.nama_lengkap,
    email: user.email,
    no_hp: user.no_hp ?? '',
    jatuh_tempo: user.detail?.jatuh_tempo.slice(0, 10) ?? '',
    password: '',
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    await update.mutateAsync(
      {
        id: user.id_user,
        nama_lengkap: form.nama_lengkap,
        email: form.email,
        ...(form.no_hp ? { no_hp: form.no_hp } : {}),
        ...(form.jatuh_tempo ? { jatuh_tempo: form.jatuh_tempo } : {}),
        ...(form.password ? { password: form.password } : {}),
      },
      { onSuccess: onClose }
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${user.nama_lengkap}`}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={update.isPending}>
            Batal
          </Button>
          <Button type="submit" form="form-edit" isLoading={update.isPending}>
            Simpan
          </Button>
        </div>
      }
    >
      <form id="form-edit" onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama lengkap" required>
            <Input
              value={form.nama_lengkap}
              onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
              required
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </Field>
          <Field label="No. HP">
            <Input
              value={form.no_hp}
              onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
            />
          </Field>
          <Field label="Jatuh tempo sewa">
            <Input
              type="date"
              value={form.jatuh_tempo}
              onChange={(e) => setForm({ ...form, jatuh_tempo: e.target.value })}
            />
          </Field>
          <Field label="Password baru" hint="Kosongkan jika tidak ingin mengubah.">
            <Input
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}

function AssignKamarModal({ user, onClose }: { user: PenghuniView; onClose: () => void }) {
  const assign = useAssignKamar();
  const kamar = useKamarOptions();
  const kosong = (kamar.data?.data ?? []).filter((k) => k.status === 'KOSONG');
  const [idKamar, setIdKamar] = useState('');
  const [tglMasuk, setTglMasuk] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    await assign.mutateAsync(
      { id: user.id_user, id_kamar: idKamar, ...(tglMasuk ? { tgl_masuk: tglMasuk } : {}) },
      { onSuccess: onClose }
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Tempatkan ${user.nama_lengkap.split(' ')[0] ?? user.username}`}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={assign.isPending}>
            Batal
          </Button>
          <Button type="submit" form="form-assign" isLoading={assign.isPending} disabled={!idKamar}>
            Tempatkan
          </Button>
        </div>
      }
    >
      <form id="form-assign" onSubmit={submit} className="space-y-4">
        <Field label="Kamar tujuan" required>
          <Select value={idKamar} onChange={(e) => setIdKamar(e.target.value)} required>
            <option value="">— Pilih kamar kosong —</option>
            {kosong.map((k) => (
              <option key={k.id_kamar} value={k.id_kamar}>
                {k.no_kamar} · {formatRupiah(k.harga)}/bln
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tanggal masuk" hint="Default hari ini.">
          <Input type="date" value={tglMasuk} onChange={(e) => setTglMasuk(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}
