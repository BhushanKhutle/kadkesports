import { api } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import type { Product, Category } from '@/types';
import Link from 'next/link';

export const revalidate = 60;

async function getShop(searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) if (v) params.set(k, v);
  try {
    const [list, cats] = await Promise.all([
      api.get<{ items: Product[]; total: number; page: number; totalPages: number }>(`/products?${params}`),
      api.get<Category[]>('/categories'),
    ]);
    return { ...list.data, categories: cats.data };
  } catch {
    return { items: [], total: 0, page: 1, totalPages: 0, categories: [] as Category[] };
  }
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const { items, total, categories } = await getShop(sp);
  const activeCat = sp.category;

  return (
    <div className="container-x py-10">
      <header className="mb-10">
        <h1 className="font-display text-5xl font-bold">{activeCat ? categories.find(c => c.slug === activeCat)?.name ?? 'Shop' : 'All products'}</h1>
        <p className="text-ink-500 mt-2">{total} products</p>
      </header>

      <div className="grid lg:grid-cols-[240px_1fr] gap-10">
        {/* Filters */}
        <aside className="space-y-6 lg:sticky lg:top-28 self-start">
          <div>
            <div className="text-xs tracking-widest font-bold text-ink-500 mb-3">CATEGORIES</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className={!activeCat ? 'text-accent font-semibold' : 'hover:text-accent'}>All</Link></li>
              {categories.map(c => (
                <li key={c.id}>
                  <Link
                    href={`/shop?category=${c.slug}`}
                    className={activeCat === c.slug ? 'text-accent font-semibold' : 'hover:text-accent'}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs tracking-widest font-bold text-ink-500 mb-3">SORT</div>
            <ul className="space-y-2 text-sm">
              {[
                { v: 'newest', l: 'Newest' },
                { v: 'price-asc', l: 'Price: Low to High' },
                { v: 'price-desc', l: 'Price: High to Low' },
                { v: 'rating', l: 'Top Rated' },
              ].map((s) => (
                <li key={s.v}>
                  <Link
                    href={`/shop?${new URLSearchParams({ ...sp, sort: s.v }).toString()}`}
                    className={sp.sort === s.v ? 'text-accent font-semibold' : 'hover:text-accent'}
                  >
                    {s.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Grid */}
        <div>
          {items.length === 0 ? (
            <div className="text-center py-20 text-ink-500">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
              {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
