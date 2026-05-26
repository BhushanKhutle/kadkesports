'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RoleForm } from '@/components/RoleForm';
import { useAppSelector } from '@/store';

export default function NewRolePage() {
  const me = useAppSelector(s => s.user.user);
  const router = useRouter();
  useEffect(() => { if (!me || me.role !== 'ADMIN') { router.push('/login?next=/admin/roles'); return; } }, [me, router]);
  return (
    <div className="container-x py-10">
      <Link href="/admin/roles" className="text-sm text-ink-500 hover:text-accent inline-flex items-center mb-4"><ChevronLeft className="w-4 h-4" /> Back to roles</Link>
      <h1 className="font-display text-5xl font-bold mb-8">New role</h1>
      <RoleForm />
    </div>
  );
}
