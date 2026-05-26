'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RoleForm } from '@/components/RoleForm';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store';

export default function EditRolePage() {
  const { id } = useParams<{ id: string }>();
  const me = useAppSelector(s => s.user.user);
  const router = useRouter();
  const [role, setRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!me || me.role !== 'ADMIN') { router.push('/login?next=/admin/roles'); return; }
    api.get(`/roles/${id}`).then(({ data }) => { setRole(data); setLoading(false); }).catch(() => setLoading(false));
  }, [id, me, router]);

  if (loading) return <div className="container-x py-20 text-center text-ink-500">Loading...</div>;
  if (!role) return <div className="container-x py-20 text-center">Not found</div>;

  return (
    <div className="container-x py-10">
      <Link href="/admin/roles" className="text-sm text-ink-500 hover:text-accent inline-flex items-center mb-4"><ChevronLeft className="w-4 h-4" /> Back to roles</Link>
      <h1 className="font-display text-5xl font-bold mb-2">Edit role</h1>
      <p className="text-ink-500 mb-8 font-mono">{role.name}</p>
      <RoleForm initial={role} roleId={role.id} />
    </div>
  );
}
