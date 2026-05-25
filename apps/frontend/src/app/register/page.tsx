'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { setUser, useAppDispatch } from '@/store';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      dispatch(setUser(data.user));
      toast.success('Account created');
      router.push('/');
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="container-x py-20 max-w-md mx-auto">
      <h1 className="font-display text-5xl font-bold mb-2">Join Kadke</h1>
      <p className="text-ink-500 mb-8">Drops, custom kits, and tournament gear.</p>
      <form onSubmit={submit} className="space-y-4">
        <input required placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" />
        <input type="email" required placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" />
        <input placeholder="Phone (optional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" />
        <input type="password" required placeholder="Password (8+ chars with upper, lower, digit)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" />
        <button disabled={loading} className="btn-primary w-full">{loading ? '...' : 'Create account'}</button>
      </form>
      <p className="text-sm text-center text-ink-500 mt-8">
        Already have one? <Link href="/login" className="text-accent hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
