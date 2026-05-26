'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store';
import toast from 'react-hot-toast';

export default function NewUserPage() {
  const me = useAppSelector(s => s.user.user);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);

  const [form, setForm] = useState({
    email: '',
    name: '',
    phone: '',
    password: '',
    role: 'USER',
    roleId: '',
  });

  useEffect(() => {
    if (!me || me.role !== 'ADMIN') { router.push('/login?next=/admin/users'); return; }
    api.get('/roles').then(({ data }) => setRoles(Array.isArray(data) ? data : []));
  }, [me, router]);

  function generatePassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
    let pw = '';
    for (let i = 0; i < 12; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    setForm({ ...form, password: pw });
    toast.success('Password generated');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be 8+ chars'); return; }
    setSaving(true);
    try {
      const payload: any = {
        email: form.email.trim(),
        name: form.name.trim(),
        password: form.password,
        role: form.role,
      };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.roleId) payload.roleId = form.roleId;
      await api.post('/users/admin/create', payload);
      toast.success('User created');
      router.push('/admin/users');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to create');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-x py-10">
      <Link href="/admin/users" className="text-sm text-ink-500 hover:text-accent inline-flex items-center mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to users
      </Link>
      <h1 className="font-display text-5xl font-bold mb-8">New user</h1>

      <form onSubmit={submit} className="space-y-6 max-w-2xl">
        <section className="card p-6 space-y-4">
          <h2 className="font-display text-xl font-bold mb-2">Account</h2>
          <div>
            <label className="text-xs tracking-widest text-ink-500">EMAIL *</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input mt-1" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs tracking-widest text-ink-500">NAME *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input mt-1" />
            </div>
            <div>
              <label className="text-xs tracking-widest text-ink-500">PHONE</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input mt-1" placeholder="10 digits" />
            </div>
          </div>
          <div>
            <label className="text-xs tracking-widest text-ink-500">PASSWORD * (min 8 chars)</label>
            <div className="flex gap-2 mt-1">
              <input type="text" required minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input font-mono" />
              <button type="button" onClick={generatePassword} className="btn-outline !px-4"><Sparkles className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-ink-500 mt-1">Share this with the new user. They can change it later.</p>
          </div>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="font-display text-xl font-bold mb-2">Access</h2>
          <div>
            <label className="text-xs tracking-widest text-ink-500">BASE ROLE *</label>
            <select required value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input mt-1">
              <option value="USER">USER (customer)</option>
              <option value="ADMIN">ADMIN (full access)</option>
            </select>
            <p className="text-xs text-ink-500 mt-1">USER customers cannot access admin. ADMIN bypasses all permission checks.</p>
          </div>
          <div>
            <label className="text-xs tracking-widest text-ink-500">CUSTOM ROLE (optional)</label>
            <select value={form.roleId} onChange={e => setForm({...form, roleId: e.target.value})} className="input mt-1">
              <option value="">None</option>
              {roles.map((r: any) => (
                <option key={r.id} value={r.id}>{r.name} — {r.description}</option>
              ))}
            </select>
            <p className="text-xs text-ink-500 mt-1">For staff: pick a role like WAREHOUSE or SUPPORT to grant specific permissions.</p>
          </div>
        </section>

        <div className="flex gap-3 pb-10">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create user'}</button>
          <button type="button" onClick={() => router.push('/admin/users')} className="btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
}
