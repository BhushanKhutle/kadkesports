import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import type { Product, Category } from '@/types';

export const revalidate = 60;

async function getHome() {
  try {
    const [featured, newArrivals, cats] = await Promise.all([
      api.get<{ items: Product[] }>('/products?featured=true&limit=8'),
      api.get<Product[]>('/products/new-arrivals'),
      api.get<Category[]>('/categories'),
    ]);
    return {
      featured: featured.data.items ?? [],
      newArrivals: newArrivals.data ?? [],
      categories: cats.data ?? [],
    };
  } catch {
    return { featured: [], newArrivals: [], categories: [] };
  }
}

const CATEGORY_IMG: Record<string, string> = {
  cricket: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
  football: 'https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=800',
  jerseys: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
  'sports-shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  tracksuits: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800',
  fitness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
  accessories: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
  'custom-jerseys': 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
};

export default async function HomePage() {
  const { featured, newArrivals, categories } = await getHome();

  return (
    <>
      {/* ─── HERO ──────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="container-x grid lg:grid-cols-2 gap-10 items-center py-16 lg:py-24">
          <div className="space-y-7">
            <span className="inline-block text-xs tracking-widest font-bold text-accent border border-accent/30 rounded-full px-3 py-1">
              NEW SEASON · SS '26
            </span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95]">
              Built for the<br />
              <span className="italic text-accent">grind.</span>
            </h1>
            <p className="text-lg text-ink-500 max-w-md">
              Premium cricket, football, jerseys & gear engineered for Indian athletes.
              Field-tested. Tournament-proven.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/shop" className="btn-primary group">
                Shop the drop
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link href="/shop?category=custom-jerseys" className="btn-outline">
                Customize jerseys
              </Link>
            </div>
            <div className="flex gap-8 pt-4 text-sm">
              <div><div className="font-display text-2xl font-bold">50K+</div><div className="text-ink-500">Athletes</div></div>
              <div><div className="font-display text-2xl font-bold">200+</div><div className="text-ink-500">Teams</div></div>
              <div><div className="font-display text-2xl font-bold">4.9★</div><div className="text-ink-500">Rating</div></div>
            </div>
          </div>

          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200"
              alt="Cricket hero" fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-ink-950/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="text-xs tracking-widest opacity-80">FEATURED</div>
              <div className="font-display text-2xl font-bold mt-1">Kadke Pro Series</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─────────────────────────────── */}
      <section className="container-x py-16">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-4xl font-bold">Shop by sport</h2>
          <Link href="/shop" className="text-sm hover:text-accent">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((c) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="group">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-ink-100 dark:bg-ink-900">
                <Image
                  src={CATEGORY_IMG[c.slug] ?? '/categories/default.jpg'}
                  alt={c.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white font-display text-xl font-bold">
                  {c.name}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── FEATURED ───────────────────────────────── */}
      {featured.length > 0 && (
        <section className="container-x py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs tracking-widest text-accent font-bold mb-2">BEST SELLERS</div>
              <h2 className="font-display text-4xl font-bold">Tournament-tested</h2>
            </div>
            <Link href="/shop?featured=true" className="text-sm hover:text-accent">View all →</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
            {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* ─── PROMO BANNER ───────────────────────────── */}
      <section className="container-x py-12">
        <div className="relative rounded-3xl bg-gradient-to-r from-ink-950 to-accent overflow-hidden p-10 lg:p-16">
          <div className="relative z-10 max-w-xl text-white">
            <div className="text-xs tracking-widest font-bold opacity-80 mb-3">CUSTOM JERSEYS</div>
            <h3 className="font-display text-4xl lg:text-5xl font-black mb-4 leading-tight">
              Your team. <br />Your colors. <br />Your name.
            </h3>
            <p className="opacity-90 mb-6">
              Bulk team kits with custom logos, names & numbers. Minimum 11 jerseys. Delivered in 10 days.
            </p>
            <Link href="/shop?category=custom-jerseys" className="btn bg-white text-ink-950 hover:bg-ink-100">
              Customize now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
      </section>

      {/* ─── NEW ARRIVALS ───────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="container-x py-16">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display text-4xl font-bold">Just landed</h2>
            <Link href="/shop" className="text-sm hover:text-accent">View all →</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
            {newArrivals.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* ─── TESTIMONIALS ───────────────────────────── */}
      <section className="container-x py-20">
        <h2 className="font-display text-4xl font-bold text-center mb-12">From the field</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { q: 'Pickup is unreal. Sweet spot like a Magnum.', n: 'Rohit M.', r: 'Club opener, Mumbai' },
            { q: 'Custom team kit arrived in 8 days. Quality is top.', n: 'Captain, FC Bandra', r: '11 players, 1 happy squad' },
            { q: 'Better than international brands at half the price.', n: 'Priya S.', r: 'Marathon runner, Pune' },
          ].map((t, i) => (
            <div key={i} className="card p-8">
              <div className="text-accent text-3xl mb-3">"</div>
              <p className="text-lg font-display mb-6">{t.q}</p>
              <div className="text-sm font-medium">{t.n}</div>
              <div className="text-xs text-ink-500">{t.r}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
