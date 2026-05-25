'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ProductForm } from '@/components/ProductForm';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAppSelector(s => s.user.user);
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/login?next=/admin'); return; }
    // Fetch the product by id — note we need to look it up since the public route uses slug
    api.get(`/products?limit=60`).then(({ data }) => {
      const found = (data.items ?? []).find((p: any) => p.id === id);
      if (found) setProduct(found);
      setLoading(false);
    });
  }, [id, user, router]);

  if (loading) return <div className="container-x py-20 text-center text-ink-500">Loading...</div>;
  if (!product) return <div className="container-x py-20 text-center">Not found. <Link href="/admin/products" className="text-accent">Back</Link></div>;

  return (
    <div className="container-x py-10">
      <Link href="/admin/products" className="text-sm text-ink-500 hover:text-accent inline-flex items-center mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to products
      </Link>
      <h1 className="font-display text-5xl font-bold mb-2">Edit product</h1>
      <p className="text-ink-500 mb-8 font-mono text-sm">{product.sku}</p>
      <ProductForm initial={product} productId={product.id} />
    </div>
  );
}
