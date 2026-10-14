'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button, Sidebar, Topbar } from '@kost/ui';
import type { SidebarItem } from '@kost/ui';
import { ADMIN_NAV, PENGHUNI_NAV } from './nav';
import { useAuth } from '@/lib/auth-context';
import { IconLogout } from '@/components/icons';

interface DashShellProps {
  theme: 'admin' | 'penghuni';
  title: string;
  subtitle: string;
  nav: SidebarItem[];
  children: React.ReactNode;
}

export function DashShell({ theme, title, subtitle, nav, children }: DashShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`theme-${theme} relative z-0 flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]`}
    >
      <Sidebar
        title="Savana Villa"
        subtitle={subtitle}
        items={nav}
        activePath={pathname}
        open={open}
        onClose={() => setOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setOpen(true)}
          actions={<ShellActions />}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function ShellActions() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-tight text-[var(--color-text)]">
          {user.nama_lengkap}
        </p>
        <p className="text-xs leading-tight text-[var(--color-muted)]">
          {user.role === 'ADMIN' ? 'Admin' : 'Penghuni'}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<IconLogout className="h-4 w-4" />}
        onClick={() => {
          void logout().then(() => {
            window.location.assign('/login');
          });
        }}
      >
        Keluar
      </Button>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <DashShell theme="admin" title="Reservasi Villa" subtitle="Panel pengelola villa" nav={ADMIN_NAV}>
      {children}
    </DashShell>
  );
}

export function PenghuniShell({ children }: { children: React.ReactNode }) {
  return (
    <DashShell
      theme="penghuni"
      title="Akun Tamu"
      subtitle="Informasi akun villa"
      nav={PENGHUNI_NAV}
    >
      {children}
    </DashShell>
  );
}

