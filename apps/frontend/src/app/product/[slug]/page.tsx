import { api } from '@/lib/api';
import type { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { PdpInteractive } from './PdpInteractive';
import { notFound } from 'next/navigation';
import { inr, discountedPrice } from '@/lib/utils';
import Image from 'next/image';
import { Star, Truck, Shield, RefreshCcw } from 'lucide-react';

export const revalidate = 60;

async function getProduct(slug: string) {
  try {
    const [p, related] = await Promise.all([
      api.get<Product>(`/products/${slug}`),
      api.get<Product[]>(`/products/${slug}/related`),
    ]);
    return { product: p.data, related: related.data };
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) return {};
  return {
    title: data.product.name,
    description: data.product.shortDesc ?? data.product.description?.slice(0, 160),
    openGraph: { images: data.product.images?.slice(0, 1) ?? [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) return notFound();
  const { product, related } = data;
  const final = discountedPrice(product.price, product.discount);
  const hasDisc = Number(product.discount) > 0;

  return (
    <div className="container-x py-10">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-ink-100 dark:bg-ink-900">
            {product.images[0] && (
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" priority />
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(0, 4).map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-900">
                <Image src={img} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="text-xs tracking-widest text-ink-500 uppercase">{product.category?.name} · {product.brand}</div>
          <h1 className="font-display text-4xl font-bold mt-2 mb-3">{product.name}</h1>

          <div className="flex items-center gap-2 mb-5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-accent stroke-accent' : 'stroke-ink-300'}`} />
              ))}
            </div>
            <span className="text-sm text-ink-500">{product.rating.toFixed(1)} · {product.reviewCount} reviews</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold">{inr(final)}</span>
            {hasDisc && (
              <>
                <span className="text-lg line-through text-ink-400">{inr(product.price)}</span>
                <span className="text-sm text-accent font-bold">{Number(product.discount)}% OFF</span>
              </>
            )}
          </div>

          <p className="text-ink-600 dark:text-ink-300 mb-8">{product.description}</p>

          <PdpInteractive product={product} />

          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-ink-200 dark:border-ink-800 text-xs">
            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-accent" /> Free ship ₹1999+</div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-accent" /> 1yr warranty</div>
            <div className="flex items-center gap-2"><RefreshCcw className="w-4 h-4 text-accent" /> 7-day return</div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-3xl font-bold mb-8">You might also like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
            {related.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
