'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store';
import toast from 'react-hot-toast';

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const me = useAppSelector(s => s.user.user);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '', role: 'USER', roleId: '', isActive: true });

  useEffect(() => {
    if (!me || me.role !== 'ADMIN') { router.push('/login?next=/admin/users'); return; }
    Promise.all([
      api.get(`/users/admin/all`),
      api.get('/roles'),
    ]).then(([usersRes, rolesRes]) => {
      const all = Array.isArray(usersRes.data) ? usersRes.data : [];
      const found = all.find((u: any) => u.id === id);
      if (!found) { toast.error('User not found'); router.push('/admin/users'); return; }
      setUser(found);
      setForm({
        name: found.name ?? '',
        phone: found.phone ?? '',
        role: found.role ?? 'USER',
        roleId: found.roleId ?? '',
        isActive: found.isActive ?? true,
      });
      setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
      setLoading(false);
    });
  }, [id, me, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        role: form.role,
        isActive: form.isActive,
      };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      payload.roleId = form.roleId || null;
      await api.patch(`/users/admin/${id}`, payload);
      toast.success('User updated');
      router.push('/admin/users');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="container-x py-20 text-center text-ink-500">Loading...</div>;
  if (!user) return null;

  const isSelf = user.id === me?.id;

  return (
    <div className="container-x py-10">
      <Link href="/admin/users" className="text-sm text-ink-500 hover:text-accent inline-flex items-center mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to users
      </Link>
      <h1 className="font-display text-5xl font-bold mb-2">Edit user</h1>
      <p className="text-ink-500 mb-8 font-mono text-sm">{user.email}</p>

      <form onSubmit={submit} className="space-y-6 max-w-2xl">
        <section className="card p-6 space-y-4">
          <h2 className="font-display text-xl font-bold mb-2">Profile</h2>
          <div>
            <label className="text-xs tracking-widest text-ink-500">EMAIL</label>
            <div className="font-medium">{user.email}</div>
            <p className="text-xs text-ink-500 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="text-xs tracking-widest text-ink-500">NAME *</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input mt-1" />
          </div>
          <div>
            <label className="text-xs tracking-widest text-ink-500">PHONE</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input mt-1" />
          </div>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="font-display text-xl font-bold mb-2">Access</h2>
          <div>
            <label className="text-xs tracking-widest text-ink-500">BASE ROLE</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input mt-1" disabled={isSelf}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            {isSelf && <p className="text-xs text-accent mt-1">You cannot change your own role</p>}
          </div>
          <div>
            <label className="text-xs tracking-widest text-ink-500">CUSTOM ROLE</label>
            <select value={form.roleId} onChange={e => setForm({...form, roleId: e.target.value})} className="input mt-1">
              <option value="">None</option>
              {roles.map((r: any) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} disabled={isSelf} />
            <span className="text-sm">Active (can login)</span>
            {isSelf && <span className="text-xs text-accent">(you cannot deactivate yourself)</span>}
          </label>
        </section>

        <div className="flex gap-3 pb-10">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Update user'}</button>
          <button type="button" onClick={() => router.push('/admin/users')} className="btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
}
