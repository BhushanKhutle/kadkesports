'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, UserX, Search, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const me = useAppSelector(s => s.user.user);
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!me || me.role !== 'ADMIN') { router.push('/login?next=/admin/users'); return; }
    load();
  }, [me, router]);

  async function load(search = '') {
    setLoading(true);
    try {
      const url = search ? `/users/admin/all?search=${encodeURIComponent(search)}` : '/users/admin/all';
      const { data } = await api.get(url);
      setUsers(Array.isArray(data) ? data : (data.items ?? []));
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function deactivate(id: string, email: string) {
    if (!confirm(`Deactivate ${email}? They won't be able to login.`)) return;
    try {
      await api.delete(`/users/admin/${id}`);
      toast.success('User deactivated');
      load(q);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed');
    }
  }

  if (loading) return <div className="container-x py-20 text-center text-ink-500">Loading users...</div>;

  return (
    <div className="container-x py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-5xl font-bold">Users</h1>
          <p className="text-ink-500 mt-1">{users.length} users · {users.filter(u => u.isActive).length} active</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/roles" className="btn-outline"><ShieldCheck className="w-4 h-4" /> Manage roles</Link>
          <Link href="/admin/users/new" className="btn-primary"><Plus className="w-4 h-4" /> New user</Link>
        </div>
      </div>

      <div className="flex items-center bg-ink-100 dark:bg-ink-900 rounded-full px-4 py-2 mb-6 max-w-md">
        <Search className="w-4 h-4 text-ink-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(q)}
          placeholder="Search by email or name..."
          className="bg-transparent ml-2 text-sm w-full outline-none"
        />
        <button onClick={() => load(q)} className="text-xs text-accent ml-2 font-semibold">Search</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 dark:bg-ink-900 text-ink-500 text-xs tracking-widest uppercase">
            <tr>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Phone</th>
              <th className="text-center p-4">Role</th>
              <th className="text-center p-4">Custom role</th>
              <th className="text-right p-4">Orders</th>
              <th className="text-center p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-ink-100 dark:border-ink-800 hover:bg-ink-50 dark:hover:bg-ink-900/50">
                <td className="p-4 font-medium">{u.email} {u.id === me?.id && <span className="text-xs text-accent">(you)</span>}</td>
                <td className="p-4">{u.name}</td>
                <td className="p-4 text-ink-500">{u.phone ?? '—'}</td>
                <td className="p-4 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'ADMIN' ? 'bg-accent text-white' : 'bg-ink-100 dark:bg-ink-800'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-center text-xs">{u.customRole?.name ?? '—'}</td>
                <td className="p-4 text-right text-ink-500">{u._count?.orders ?? 0}</td>
                <td className="p-4 text-center">
                  {u.isActive ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">ACTIVE</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-ink-200 text-ink-500">DISABLED</span>
                  )}
                </td>
                <td className="p-4 text-right space-x-1">
                  <Link href={`/admin/users/${u.id}`} className="inline-flex p-2 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800">
                    <Edit className="w-4 h-4" />
                  </Link>
                  {u.isActive && u.id !== me?.id && (
                    <button onClick={() => deactivate(u.id, u.email)} className="inline-flex p-2 rounded-full hover:bg-accent hover:text-white">
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={8} className="p-12 text-center text-ink-500">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
