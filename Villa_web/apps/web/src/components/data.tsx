'use client';

import type { ReactNode } from 'react';
import { Alert, Badge, Button, Field, Modal, Skeleton, Textarea } from '@kost/ui';
import type { BadgeVariant } from '@kost/ui';
import {
  KAMAR_VARIANT,
  METODE_VARIANT,
  PEMBAYARAN_VARIANT,
  PENGAJUAN_VARIANT,
  TAGIHAN_VARIANT,
} from '@kost/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import type {
  MetodeBayar,
  StatusKamar,
  StatusPembayaran,
  StatusPengajuan,
  StatusTagihan,
} from '@kost/types';
import {
  METODE_BAYAR_LABEL,
  STATUS_KAMAR_LABEL,
  STATUS_PEMBAYARAN_LABEL,
  STATUS_PENGAJUAN_LABEL,
  STATUS_TAGIHAN_LABEL,
} from '@kost/types';
import { useEffect, useState } from 'react';
import { IconChevronLeft } from '@/components/icons';

/** Wrapper standar untuk hasil React Query: loading → skeleton, error → alert. */
export function QueryState<T>({
  query,
  children,
  skeletonRows = 4,
}: {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
  skeletonRows?: number;
}) {
  if (query.isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }
  if (query.isError) {
    return (
      <Alert variant="danger" title="Gagal memuat data.">
        {query.error instanceof Error ? query.error.message : 'Terjadi kesalahan tak diketahui.'}
      </Alert>
    );
  }
  if (!query.data) return null;
  return <>{children(query.data)}</>;
}

/** Badge warna sesuai status/entitas — mapping dari packages/ui/src/status.ts. */
const VARIANT_MAP: Record<
  'tagihan' | 'pembayaran' | 'pengajuan' | 'kamar' | 'metode',
  {
    variant: Record<string, BadgeVariant>;
    label: Record<string, string>;
  }
> = {
  tagihan: { variant: TAGIHAN_VARIANT, label: STATUS_TAGIHAN_LABEL },
  pembayaran: { variant: PEMBAYARAN_VARIANT, label: STATUS_PEMBAYARAN_LABEL },
  pengajuan: { variant: PENGAJUAN_VARIANT, label: STATUS_PENGAJUAN_LABEL },
  kamar: { variant: KAMAR_VARIANT, label: STATUS_KAMAR_LABEL },
  metode: { variant: METODE_VARIANT, label: METODE_BAYAR_LABEL },
};

type StatusKind = keyof typeof VARIANT_MAP;

export function StatusBadge({
  kind,
  value,
}: {
  kind: StatusKind;
  value: StatusKamar | StatusPembayaran | StatusPengajuan | StatusTagihan | MetodeBayar;
}) {
  const map = VARIANT_MAP[kind];
  const variant = map.variant[value];
  return <Badge variant={variant ?? 'muted'}>{map.label[value] ?? value}</Badge>;
}

/** Kontrol pindah halaman untuk seluruh list yang dipaginasi. */
export function Pagination({
  page,
  totalPage,
  onChange,
}: {
  page: number;
  totalPage: number;
  onChange: (page: number) => void;
}) {
  if (totalPage <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      <p className="text-sm text-[var(--color-muted)]">
        Halaman {page} dari {totalPage}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          leftIcon={<IconChevronLeft />}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPage}
          onClick={() => onChange(page + 1)}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  );
}

/** Modal dengan kolom alasan/catatan — dipakai "tolak pembayaran" & "tolak pengajuan". */
export function ReasonModal({
  open,
  title,
  description,
  label,
  placeholder,
  minLength = 5,
  maxLength = 500,
  confirmLabel = 'Simpan',
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description?: string;
  label: string;
  placeholder: string;
  minLength?: number;
  maxLength?: number;
  confirmLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setValue('');
      setTouched(false);
    }
  }, [open]);

  const valid = value.trim().length >= minLength;
  const error = touched && !valid ? `Wajib diisi minimal ${minLength} karakter.` : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant="danger"
            isLoading={loading}
            disabled={!valid}
            onClick={() => onSubmit(value.trim())}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Field label={label} required error={error}>
        <Textarea
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={4}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setTouched(true)}
        />
      </Field>
    </Modal>
  );
}
