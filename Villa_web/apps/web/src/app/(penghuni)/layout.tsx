import { redirect } from 'next/navigation';

export default function PenghuniLayout({ children }: { children: React.ReactNode }) {
  void children;
  redirect('/');
}
