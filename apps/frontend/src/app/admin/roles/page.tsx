'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store';
import toast from 'react-hot-toast';

export default function AdminRolesPage() {
  const me = useAppSelector(s => s.user.user);
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [perms, setPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!me || me.role !== 'ADMIN') { router.push('/login?next=/admin/roles'); return; }
    Promise.all([api.get('/roles'), api.get('/roles/permissions')])
      .then(([r, p]) => {
        setRoles(Array.isArray(r.data) ? r.data : []);
        setPerms(Array.isArray(p.data) ? p.data : []);
      })
      .catch(e => toast.error(e.response?.data?.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, [me, router]);

  async function deleteRole(id: string, name: string) {
    if (!confirm(`Delete role ${name}?`)) return;
    try {
      await api.delete(`/roles/${id}`);
      toast.success('Role deleted');
      setRoles(roles.filter(r => r.id !== id));
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Delete failed');
    }
  }

  if (loading) return <div className="container-x py-20 text-center text-ink-500">Loading...</div>;

  return (
    <div className="container-x py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-5xl font-bold">Roles</h1>
          <p className="text-ink-500 mt-1">{roles.length} roles · {perms.length} permissions total</p>
        </div>
        <Link href="/admin/roles/new" className="btn-primary"><Plus className="w-4 h-4" /> New role</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {roles.map((r) => (
          <div key={r.id} className="card p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-accent" /> {r.name}
                  {r.isSystem && <span className="text-xs bg-ink-100 dark:bg-ink-800 px-2 py-0.5 rounded-full">SYSTEM</span>}
                </h3>
                <p className="text-sm text-ink-500 mt-1">{r.description ?? '—'}</p>
              </div>
              <div className="flex gap-1">
                <Link href={`/admin/roles/${r.id}`} className="p-2 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800">
                  <Edit className="w-4 h-4" />
                </Link>
                {!r.isSystem && (
                  <button onClick={() => deleteRole(r.id, r.name)} className="p-2 rounded-full hover:bg-accent hover:text-white">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="text-sm text-ink-500 mt-3">
              <strong>{r.permissions?.length ?? 0}</strong> of {perms.length} permissions · <strong>{r._count?.users ?? 0}</strong> users
            </div>
          </div>
        ))}
        {roles.length === 0 && <p className="text-ink-500 text-center col-span-2 py-12">No roles yet</p>}
      </div>
    </div>
  );
}
