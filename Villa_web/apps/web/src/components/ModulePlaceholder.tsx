import { Badge, Card, CardContent, EmptyState } from '@kost/ui';

interface ModulePlaceholderProps {
  title: string;
  description: string;
  sprint: string;
  planned: string[];
}

/**
 * Kerangka halaman modul yang belum diimplementasi.
 * Menampilkan daftar fitur yang direncanakan (PRD-2) sebagai badge.
 */
export function ModulePlaceholder({ title, description, sprint, planned }: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">{title}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>
      </div>
      <Card>
        <CardContent className="space-y-5">
          <EmptyState
            title="Modul dalam persiapan"
            description={`Kerangka halaman ini sudah disiapkan. Implementasi fitur mengikuti ${sprint} pada PRD-2 §3.`}
          />
          <div className="flex flex-wrap justify-center gap-2">
            {planned.map((feature) => (
              <Badge key={feature} variant="accent">
                {feature}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
