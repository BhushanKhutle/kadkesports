'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { logout, setUser, useAppDispatch, useAppSelector } from '@/store';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const user = useAppSelector((s) => s.user.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const fetchedRef = useRef(false);

  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login?next=/profile');
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    api.get('/users/me')
      .then(({ data }) => {
        dispatch(setUser(data));
        setForm({ name: data.name ?? '', phone: data.phone ?? '' });
      })
      .catch((e) => {
        toast.error(e.response?.data?.message ?? 'Failed to load profile');
      })
      .finally(() => setLoading(false));
  }, [user, dispatch, router]);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/users/me', form);
      dispatch(setUser({ ...user!, ...data }));
      setForm({ name: data.name ?? '', phone: data.phone ?? '' });
      toast.success('Profile updated');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    dispatch(logout());
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="container-x py-10 max-w-3xl">
      <h1 className="font-display text-5xl font-bold mb-10">My account</h1>
      <div className="grid sm:grid-cols-[200px_1fr] gap-8">
        <nav className="space-y-2 text-sm">
          <div className="font-semibold">Profile</div>
          {user.role !== 'ADMIN' && (
            <>
              <Link href="/orders" className="block text-ink-500 hover:text-accent">My orders</Link>
              <Link href="/wishlist" className="block text-ink-500 hover:text-accent">Wishlist</Link>
            </>
          )}
          {user.role === 'ADMIN' && <Link href="/admin" className="block text-accent">Admin dashboard</Link>}
          <button onClick={signOut} className="block text-ink-500 hover:text-accent mt-4">Sign out</button>
        </nav>

        <div className="space-y-4 card p-6">
          <div>
            <label className="text-xs tracking-widest text-ink-500">EMAIL</label>
            <div className="font-medium">{user.email}</div>
          </div>
          <div>
            <label className="text-xs tracking-widest text-ink-500">NAME</label>
            <input
              className="input mt-1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={loading}
              placeholder={loading ? 'Loading...' : 'Your name'}
            />
          </div>
          <div>
            <label className="text-xs tracking-widest text-ink-500">PHONE</label>
            <input
              className="input mt-1"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={loading}
              placeholder={loading ? 'Loading...' : '10-digit phone'}
            />
          </div>
          <div className="pt-2">
            <button onClick={save} disabled={saving || loading} className="btn-primary">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
