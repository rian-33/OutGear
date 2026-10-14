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
import { formatRupiah } from '@kost/ui';
import type { KamarView } from '@/lib/api';
import {
  useCreateKamar,
  useDeleteKamar,
  useKamarList,
  useSetKamarStatus,
  useUpdateKamar,
} from '@/lib/queries';
import { Pagination, QueryState, StatusBadge } from '@/components/data';
import { IconDoor, IconEdit, IconPlus, IconSearch, IconTrash } from '@/components/icons';

type StatusFilter = '' | 'KOSONG' | 'MAINTENANCE';

export default function AdminKamarPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');
  const [page, setPage] = useState(1);
  const kamar = useKamarList({ search, status, page });

  const [modal, setModal] = useState<'create' | null>(null);
  const [editing, setEditing] = useState<KamarView | null>(null);
  const [statusTarget, setStatusTarget] = useState<KamarView | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KamarView | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">Kamar</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Kelola unit villa, harga per malam, kapasitas tamu, fasilitas, dan perawatan.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Field label="Cari">
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
              <Input
                className="pl-9"
                placeholder="Cari nama unit villa…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
              <option value="">Semua</option>
              <option value="KOSONG">Tersedia</option>
              <option value="MAINTENANCE">Perawatan</option>
            </Select>
          </Field>
          <Button leftIcon={<IconPlus />} onClick={() => setModal('create')}>
            Tambah Unit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar unit villa</CardTitle>
          <CardDescription>
            Harga per malam dan fasilitas untuk setiap unit villa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QueryState query={kamar}>
            {(data) => (
              <div className="space-y-4">
                {data.data.length === 0 ? (
                  <EmptyState
                    icon={<IconDoor />}
                    title="Belum ada unit villa"
                    description="Tambahkan unit pertama untuk mulai menerima reservasi."
                  />
                ) : (
                  <Table>
                    <THead>
                      <TR>
                        <TH>Unit villa</TH>
                        <TH align="right">Harga / malam</TH>
                        <TH align="right">Kapasitas</TH>
                        <TH>Status</TH>
                        <TH>Fasilitas</TH>
                        <TH align="right">Aksi</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {data.data.map((k) => (
                        <TR key={k.id_kamar}>
                          <TD className="font-medium">{k.no_kamar}</TD>
                          <TD align="right" numeric>
                            {formatRupiah(k.harga)}
                          </TD>
                          <TD align="right">{k.kapasitas} tamu</TD>
                          <TD>
                            <StatusBadge kind="kamar" value={k.status} />
                          </TD>
                          <TD className="max-w-[16rem] truncate">{k.fasilitas ?? '—'}</TD>
                          <TD align="right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<IconEdit />}
                                onClick={() => setEditing(k)}
                              >
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setStatusTarget(k)}>
                                Ubah Status
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[var(--color-danger)]"
                                leftIcon={<IconTrash />}
                                onClick={() => setDeleteTarget(k)}
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

      {modal === 'create' && (
        <CreateKamarModal onClose={() => setModal(null)} onSaved={() => setModal(null)} />
      )}
      {editing && <EditKamarModal kamar={editing} onClose={() => setEditing(null)} />}
      {statusTarget && <StatusModal kamar={statusTarget} onClose={() => setStatusTarget(null)} />}
      {deleteTarget && (
        <DeleteKamarDialog kamar={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}

function CreateKamarModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const create = useCreateKamar();
  const [angka, setAngka] = useState('');
  const [harga, setHarga] = useState('');
  const [kapasitas, setKapasitas] = useState('2');
  const [fasilitas, setFasilitas] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    const jumlah = Number(harga.replace(/\D/g, ''));
    if (!Number.isFinite(jumlah) || jumlah <= 0) return;
    setHarga(String(jumlah));
    await create.mutateAsync(
      { no_kamar: angka.trim(), harga: jumlah, kapasitas: Number(kapasitas), fasilitas: fasilitas.trim() || undefined },
      { onSuccess: onSaved }
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Tambah unit villa"
      size="sm"
      footer={<FooterButton isLoading={create.isPending} onCancel={onClose} submitLabel="Simpan" />}
    >
      <form id="form-kamar" onSubmit={submit} className="space-y-4">
        <Field
          label="Nama unit villa"
          required
          hint="Nama unit yang tampil kepada tamu; tidak bisa diubah nanti."
        >
          <Input
            value={angka}
            onChange={(e) => setAngka(e.target.value)}
          placeholder="Garden Suite 1"
          pattern="[A-Za-z0-9][A-Za-z0-9 /-]{0,49}"
            required
          />
        </Field>
        <Field label="Kapasitas tamu" required>
          <Input type="number" min="1" max="20" value={kapasitas} onChange={(e) => setKapasitas(e.target.value)} required />
        </Field>
        <Field label="Harga / malam" required>
          <Input
            value={harga}
            onChange={(e) => setHarga(e.target.value.replace(/\D/g, ''))}
            placeholder="1250000"
            inputMode="numeric"
            required
          />
        </Field>
        <Field label="Fasilitas" hint="Opsional, maks 500 karakter.">
          <Input
            value={fasilitas}
            onChange={(e) => setFasilitas(e.target.value)}
            placeholder="AC, kasur, kamar mandi dalam"
          />
        </Field>
      </form>
    </Modal>
  );
}

function EditKamarModal({ kamar, onClose }: { kamar: KamarView; onClose: () => void }) {
  const update = useUpdateKamar();
  const [harga, setHarga] = useState(String(kamar.harga));
  const [kapasitas, setKapasitas] = useState(String(kamar.kapasitas));
  const [fasilitas, setFasilitas] = useState(kamar.fasilitas ?? '');

  async function submit(e: FormEvent) {
    e.preventDefault();
    const jumlah = Number(harga.replace(/\D/g, ''));
    if (!Number.isFinite(jumlah) || jumlah <= 0) return;
    setHarga(String(jumlah));
    await update.mutateAsync({
      id: kamar.id_kamar,
      harga: jumlah,
      kapasitas: Number(kapasitas),
      fasilitas: fasilitas.trim() || undefined,
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${kamar.no_kamar}`}
      size="sm"
      footer={<FooterButton isLoading={update.isPending} onCancel={onClose} submitLabel="Simpan" />}
    >
      <form id="form-kamar" onSubmit={submit} className="space-y-4">
        <Field label="Harga / malam" required>
          <Input
            value={harga}
            onChange={(e) => setHarga(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            required
          />
        </Field>
        <Field label="Kapasitas tamu" required>
          <Input type="number" min="1" max="20" value={kapasitas} onChange={(e) => setKapasitas(e.target.value)} required />
        </Field>
        <Field label="Fasilitas">
          <Input value={fasilitas} onChange={(e) => setFasilitas(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}

function StatusModal({ kamar, onClose }: { kamar: KamarView; onClose: () => void }) {
  const setStatus = useSetKamarStatus();
  const [status, setStatusState] = useState(
    kamar.status === 'MAINTENANCE' ? 'KOSONG' : 'MAINTENANCE'
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    await setStatus.mutateAsync({ id: kamar.id_kamar, status });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Ubah status ${kamar.no_kamar}`}
      size="sm"
      footer={
        <FooterButton isLoading={setStatus.isPending} onCancel={onClose} submitLabel="Simpan" />
      }
    >
      <form id="form-kamar" onSubmit={submit}>
        <Field label="Status" required>
          <Select value={status} onChange={(e) => setStatusState(e.target.value)}>
            <option value="KOSONG">Tersedia</option>
            <option value="MAINTENANCE">Perawatan</option>
          </Select>
        </Field>
        <p className="mt-2 text-xs text-[var(--color-muted)]">Unit dalam perawatan tidak muncul saat tamu mengecek ketersediaan.</p>
      </form>
    </Modal>
  );
}

function DeleteKamarDialog({ kamar, onClose }: { kamar: KamarView; onClose: () => void }) {
  const del = useDeleteKamar();
  return (
    <ConfirmDialog
      open
      danger
      title={`Arsipkan ${kamar.no_kamar}?`}
      description="Unit yang memiliki reservasi menunggu atau terkonfirmasi tidak dapat diarsipkan."
      confirmLabel={del.isPending ? 'Mengarsipkan…' : 'Arsipkan'}
      onConfirm={() => del.mutate(kamar.id_kamar, { onSuccess: onClose })}
      onCancel={onClose}
    />
  );
}

function FooterButton({
  isLoading,
  onCancel,
  submitLabel,
}: {
  isLoading: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
        Batal
      </Button>
      <Button type="submit" form="form-kamar" isLoading={isLoading}>
        {submitLabel}
      </Button>
    </div>
  );
}
