'use client';

import { FormEvent, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { formatPeriode, formatRupiah, formatTanggal } from '@kost/ui';
import type { TagihanView } from '@/lib/api';
import { useAdminTagihan, useCreateTagihan, useDeleteTagihan, useUsers } from '@/lib/queries';
import { Pagination, QueryState, StatusBadge } from '@/components/data';
import { IconPlus, IconReceipt, IconTrash } from '@/components/icons';

export default function AdminTagihanPage() {
  const [status, setStatus] = useState('');
  const [periode, setPeriode] = useState('');
  const [page, setPage] = useState(1);
  const tagihan = useAdminTagihan({ status, periode, page });

  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<TagihanView | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">Tagihan</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Tagihan bulanan (otomatis) dan tagihan manual (F-13 – F-16).
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Field label="Periode">
            <Input
              type="month"
              value={periode}
              onChange={(e) => {
                setPeriode(e.target.value);
                setPage(1);
              }}
            />
          </Field>
          <Field label="Status">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua</option>
              <option value="BELUM_BAYAR">Belum Bayar</option>
              <option value="PENDING">Pending</option>
              <option value="LUNAS">Lunas</option>
              <option value="OVERDUE">Overdue</option>
            </Select>
          </Field>
          <Button leftIcon={<IconPlus />} onClick={() => setCreateOpen(true)}>
            Tagihan Manual
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar tagihan</CardTitle>
          <CardDescription>Tagihan terjadwal dibuat otomatis tiap awal bulan.</CardDescription>
        </CardHeader>
        <CardContent>
          <QueryState query={tagihan}>
            {(data) => (
              <div className="space-y-4">
                {data.data.length === 0 ? (
                  <EmptyState
                    icon={<IconReceipt />}
                    title="Tidak ada tagihan"
                    description="Tagihan otomatis muncul tiap bulan; atau buat manual."
                  />
                ) : (
                  <Table>
                    <THead>
                      <TR>
                        <TH>Periode</TH>
                        <TH>Penghuni</TH>
                        <TH>Kamar</TH>
                        <TH align="right">Jumlah</TH>
                        <TH>Jatuh tempo</TH>
                        <TH>Status</TH>
                        <TH>Catatan</TH>
                        <TH align="right">Aksi</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {data.data.map((t) => (
                        <TR key={t.id_tagihan}>
                          <TD className="font-medium">{formatPeriode(t.periode)}</TD>
                          <TD>
                            {t.penghuni?.nama_lengkap ?? '—'}
                            {t.penghuni && (
                              <span className="block text-xs text-[var(--color-muted)]">
                                @{t.penghuni.username}
                              </span>
                            )}
                          </TD>
                          <TD>{t.kamar?.no_kamar ?? '—'}</TD>
                          <TD align="right" numeric>
                            {formatRupiah(t.jumlah)}
                          </TD>
                          <TD>{formatTanggal(t.jatuh_tempo)}</TD>
                          <TD>
                            <StatusBadge kind="tagihan" value={t.status} />
                          </TD>
                          <TD className="max-w-[12rem] truncate">{t.catatan ?? '—'}</TD>
                          <TD align="right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[var(--color-danger)]"
                              leftIcon={<IconTrash />}
                              onClick={() => setDeleting(t)}
                            >
                              Hapus
                            </Button>
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

      {createOpen && <CreateTagihanModal onClose={() => setCreateOpen(false)} />}
      {deleting && <DeleteTagihanDialog tagihan={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}

function CreateTagihanModal({ onClose }: { onClose: () => void }) {
  const create = useCreateTagihan();
  const penghuni = useUsers({ role: 'PENGHUNI', perPage: 100 });
  const [form, setForm] = useState({
    id_user: '',
    jumlah: '',
    periode: '',
    jatuh_tempo: '',
    catatan: '',
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    await create.mutateAsync(
      {
        id_user: form.id_user,
        ...(form.jumlah ? { jumlah: Number(form.jumlah.replace(/\D/g, '')) } : {}),
        ...(form.periode ? { periode: form.periode } : {}),
        ...(form.jatuh_tempo ? { jatuh_tempo: form.jatuh_tempo } : {}),
        ...(form.catatan.trim() ? { catatan: form.catatan.trim() } : {}),
      },
      { onSuccess: onClose }
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Buat tagihan manual"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={create.isPending}>
            Batal
          </Button>
          <Button
            type="submit"
            form="form-tagihan"
            isLoading={create.isPending}
            disabled={!form.id_user}
          >
            Simpan
          </Button>
        </div>
      }
    >
      <form id="form-tagihan" onSubmit={submit} className="space-y-4">
        <Field label="Penghuni" required>
          <Select
            value={form.id_user}
            onChange={(e) => setForm({ ...form, id_user: e.target.value })}
            required
          >
            <option value="">— Pilih penghuni —</option>
            {(penghuni.data?.data ?? []).map((u) => (
              <option key={u.id_user} value={u.id_user}>
                {u.nama_lengkap} ({u.kamar?.no_kamar ?? 'tanpa kamar'})
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Jumlah" hint="Default = harga kamar penghuni.">
            <Input
              value={form.jumlah}
              onChange={(e) => setForm({ ...form, jumlah: e.target.value.replace(/\D/g, '') })}
              placeholder="750000"
              inputMode="numeric"
            />
          </Field>
          <Field label="Periode" hint="Default = bulan berjalan.">
            <Input
              type="month"
              value={form.periode}
              onChange={(e) => setForm({ ...form, periode: e.target.value })}
            />
          </Field>
          <Field label="Jatuh tempo" hint="Default = tanggal 10 bulan berjalan.">
            <Input
              type="date"
              value={form.jatuh_tempo}
              onChange={(e) => setForm({ ...form, jatuh_tempo: e.target.value })}
            />
          </Field>
          <Field label="Catatan">
            <Input
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              placeholder="mis. biaya denda keterlambatan"
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}

function DeleteTagihanDialog({ tagihan, onClose }: { tagihan: TagihanView; onClose: () => void }) {
  const del = useDeleteTagihan();
  return (
    <ConfirmDialog
      open
      danger
      title={`Hapus tagihan ${formatPeriode(tagihan.periode)}?`}
      description="Tagihan yang sudah memiliki pembayaran tidak dapat dihapus."
      confirmLabel={del.isPending ? 'Menghapus…' : 'Hapus'}
      onConfirm={() => del.mutate(tagihan.id_tagihan, { onSuccess: onClose })}
      onCancel={onClose}
    />
  );
}
