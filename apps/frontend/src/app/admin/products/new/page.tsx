'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ProductForm } from '@/components/ProductForm';
import { useAppSelector } from '@/store';

export default function NewProductPage() {
  const user = useAppSelector(s => s.user.user);
  const router = useRouter();
  useEffect(() => { if (!user || user.role !== 'ADMIN') { router.push('/login?next=/admin'); return; } }, [user, router]);

  return (
    <div className="container-x py-10">
      <Link href="/admin/products" className="text-sm text-ink-500 hover:text-accent inline-flex items-center mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to products
      </Link>
      <h1 className="font-display text-5xl font-bold mb-8">New product</h1>
      <ProductForm />
    </div>
  );
}
