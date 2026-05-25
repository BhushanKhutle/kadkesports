'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store';
import { inr } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const user = useAppSelector(s => s.user.user);
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (user && user.role !== 'ADMIN') { router.push('/'); return; }
    load();
  }, [user, router]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?limit=60${q ? `&q=${encodeURIComponent(q)}` : ''}`);
      setProducts(data.items ?? []);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This deactivates the product.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deactivated');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Delete failed');
    }
  }

  if (loading) return <div className="container-x py-20 text-center text-ink-500">Loading...</div>;

  return (
    <div className="container-x py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-5xl font-bold">Products</h1>
          <p className="text-ink-500 mt-1">{products.length} products</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Add product
        </Link>
      </div>

      <div className="flex items-center bg-ink-100 dark:bg-ink-900 rounded-full px-4 py-2 mb-6 max-w-md">
        <Search className="w-4 h-4 text-ink-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          placeholder="Search products..."
          className="bg-transparent ml-2 text-sm w-full outline-none"
        />
        <button onClick={load} className="text-xs text-accent ml-2">Search</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 dark:bg-ink-900 text-ink-500 text-xs tracking-widest uppercase">
            <tr>
              <th className="text-left p-4">Image</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">SKU</th>
              <th className="text-left p-4">Brand</th>
              <th className="text-right p-4">Price</th>
              <th className="text-right p-4">Stock</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-ink-100 dark:border-ink-800 hover:bg-ink-50 dark:hover:bg-ink-900/50">
                <td className="p-4">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-ink-100 dark:bg-ink-900">
                    {p.images?.[0] && (
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="48px" />
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 font-mono text-xs text-ink-500">{p.sku}</td>
                <td className="p-4 text-ink-500">{p.brand}</td>
                <td className="p-4 text-right">{inr(p.price)}</td>
                <td className="p-4 text-right">
                  <span className={p.inventory?.stock < 5 ? 'text-accent font-bold' : ''}>
                    {p.inventory?.stock ?? 0}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Link href={`/admin/products/${p.id}`} className="inline-flex p-2 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800">
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button onClick={() => deleteProduct(p.id, p.name)} className="inline-flex p-2 rounded-full hover:bg-accent hover:text-white">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={7} className="p-12 text-center text-ink-500">No products. <Link href="/admin/products/new" className="text-accent">Add one →</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
