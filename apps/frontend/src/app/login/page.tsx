'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, API_URL } from '@/lib/api';
import { setUser, useAppDispatch } from '@/store';
import toast from 'react-hot-toast';

function LoginInner() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      dispatch(setUser(data.user));
      toast.success('Welcome back!');
      router.push(next);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x py-20 max-w-md mx-auto">
      <h1 className="font-display text-5xl font-bold mb-2">Welcome back</h1>
      <p className="text-ink-500 mb-8">Sign in to track orders, save favorites & more.</p>

      <form onSubmit={submit} className="space-y-4">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input" />
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input" />
        <button disabled={loading} className="btn-primary w-full">{loading ? '...' : 'Sign in'}</button>
      </form>

      <div className="flex items-center gap-3 my-6 text-xs text-ink-400">
        <div className="flex-1 h-px bg-ink-200 dark:bg-ink-800" /> OR <div className="flex-1 h-px bg-ink-200 dark:bg-ink-800" />
      </div>

      <a href={`${API_URL}/auth/google`} className="btn-outline w-full">
        Continue with Google
      </a>

      <p className="text-sm text-center text-ink-500 mt-8">
        New here? <Link href="/register" className="text-accent hover:underline">Create an account</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container-x py-20 text-center text-ink-500">Loading...</div>}>
      <LoginInner />
    </Suspense>
  );
}
