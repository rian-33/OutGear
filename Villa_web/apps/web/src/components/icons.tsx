import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function base(props: IconProps) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  };
}

export function IconDashboard(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-5.2 6-5.2s6 1.9 6 5.2" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M21 20c0-2.6-1.5-4.4-4-5" />
    </svg>
  );
}

export function IconDoor(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <rect x="6" y="3" width="12" height="18" rx="1.5" />
      <path d="M10 3v18" />
      <circle cx="14.2" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconReceipt(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="M5 3h14v18l-2-1.5L15 21l-3-1.5L9 21l-2-1.5L5 21V3z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}

export function IconCard(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </svg>
  );
}

export function IconSwap(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="M8 3v14M4 8l4-4 4 4M8 21h8M20 16l-4 4-4-4" />
    </svg>
  );
}

export function IconChart(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="M4 20V4M4 20h16" />
      <rect x="7" y="12" width="3.5" height="8" rx="0.75" />
      <rect x="13" y="7" width="3.5" height="13" rx="0.75" />
    </svg>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 7h.01M15 7h.01M9 12h.01M15 12h.01M9 17h.01M15 17h.01" strokeWidth="2" />
    </svg>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconEdit(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconX(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

export function IconUpload(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}

export function IconFilter(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function IconEye(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1v-10.5z" />
    </svg>
  );
}

export function IconLogoCrown(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-5 w-5 ${props.className ?? ''}`} strokeWidth="2">
      <path d="M3 18h18M3 7l4 4 5-6 5 6 4-4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z" />
    </svg>
  );
}

export function IconRefresh(props: IconProps) {
  return (
    <svg {...base(props)} className={`h-4 w-4 ${props.className ?? ''}`}>
      <path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6" />
    </svg>
  );
}
