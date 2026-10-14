import type { SidebarItem } from '@kost/ui';
import { IconDoor, IconDashboard } from '@/components/icons';

export const ADMIN_NAV: SidebarItem[] = [
  { label: 'Reservasi', href: '/admin/reservasi', icon: <IconDashboard /> },
  { label: 'Unit Villa', href: '/admin/kamar', icon: <IconDoor /> },
];

export const PENGHUNI_NAV: SidebarItem[] = [];
