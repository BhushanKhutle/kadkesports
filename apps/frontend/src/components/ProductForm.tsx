'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface ProductFormProps {
  initial?: any;
  productId?: string;
}

export function ProductForm({ initial, productId }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!productId;
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    shortDesc: initial?.shortDesc ?? '',
    brand: initial?.brand ?? 'Kadke',
    sku: initial?.sku ?? `KS-${Date.now()}`,
    categoryId: initial?.categoryId ?? initial?.category?.id ?? '',
    price: initial?.price ? Number(initial.price) : 0,
    discount: initial?.discount ? Number(initial.discount) : 0,
    stock: initial?.inventory?.stock ?? 0,
    featured: initial?.featured ?? false,
    metaTitle: initial?.metaTitle ?? '',
    metaDesc: initial?.metaDesc ?? '',
  });

  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? []);
  const [colors, setColors] = useState<string[]>(initial?.colors ?? []);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);

  const [newImage, setNewImage] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  const addToList = (item: string, list: string[], setList: (l: string[]) => void, setNew: (s: string) => void) => {
    const v = item.trim();
    if (!v || list.includes(v)) return;
    setList([...list, v]);
    setNew('');
  };

  const removeFromList = (idx: number, list: string[], setList: (l: string[]) => void) => {
    setList(list.filter((_, i) => i !== idx));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoryId) { toast.error('Pick a category'); return; }
    if (form.price <= 0) { toast.error('Price must be > 0'); return; }
    if (images.length === 0) { toast.error('Add at least one image URL'); return; }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        shortDesc: form.shortDesc || undefined,
        brand: form.brand,
        sku: form.sku,
        categoryId: form.categoryId,
        price: Number(form.price),
        discount: Number(form.discount),
        images, sizes, colors, tags,
        featured: form.featured,
        stock: Number(form.stock),
        metaTitle: form.metaTitle || undefined,
        metaDesc: form.metaDesc || undefined,
      };

      if (isEdit) {
        await api.patch(`/products/${productId}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      router.push('/admin/products');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8 max-w-4xl">
      {/* Basic info */}
      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl font-bold mb-2">Basic info</h2>

        <div>
          <label className="text-xs tracking-widest text-ink-500">NAME *</label>
          <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input mt-1" placeholder="Kadke Pro Cricket Bat" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs tracking-widest text-ink-500">BRAND *</label>
            <input required value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="input mt-1" />
          </div>
          <div>
            <label className="text-xs tracking-widest text-ink-500">SKU *</label>
            <input required value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="input mt-1" />
          </div>
        </div>

        <div>
          <label className="text-xs tracking-widest text-ink-500">CATEGORY *</label>
          <select required value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="input mt-1">
            <option value="">Select a category...</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs tracking-widest text-ink-500">SHORT DESCRIPTION</label>
          <input value={form.shortDesc} onChange={e => setForm({...form, shortDesc: e.target.value})} className="input mt-1" placeholder="One-line teaser" />
        </div>

        <div>
          <label className="text-xs tracking-widest text-ink-500">DESCRIPTION *</label>
          <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input mt-1 min-h-[140px]" placeholder="Full product description..." />
        </div>
      </section>

      {/* Pricing & stock */}
      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl font-bold mb-2">Pricing & stock</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs tracking-widest text-ink-500">PRICE (₹) *</label>
            <input type="number" min="0" step="1" required value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className="input mt-1" />
          </div>
          <div>
            <label className="text-xs tracking-widest text-ink-500">DISCOUNT (%)</label>
            <input type="number" min="0" max="90" step="1" value={form.discount} onChange={e => setForm({...form, discount: Number(e.target.value)})} className="input mt-1" />
          </div>
          <div>
            <label className="text-xs tracking-widest text-ink-500">STOCK</label>
            <input type="number" min="0" step="1" value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} className="input mt-1" />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} />
          <span className="text-sm">Featured on homepage</span>
        </label>
      </section>

      {/* Images */}
      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl font-bold mb-2">Images</h2>
        <p className="text-xs text-ink-500">Paste image URLs. Use Unsplash, Imgur, or your MinIO bucket.</p>
        <div className="flex gap-2">
          <input value={newImage} onChange={e => setNewImage(e.target.value)} className="input" placeholder="https://images.unsplash.com/..." />
          <button type="button" onClick={() => addToList(newImage, images, setImages, setNewImage)} className="btn-outline !py-2"><Plus className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-ink-100 dark:bg-ink-900 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="object-cover w-full h-full" />
              <button type="button" onClick={() => removeFromList(i, images, setImages)} className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Variants */}
      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl font-bold mb-2">Variants</h2>
        <Chips label="SIZES" items={sizes} newVal={newSize} setNewVal={setNewSize} onAdd={() => addToList(newSize, sizes, setSizes, setNewSize)} onRemove={(i) => removeFromList(i, sizes, setSizes)} placeholder="S, M, L, XL or 7, 8, 9..." />
        <Chips label="COLORS" items={colors} newVal={newColor} setNewVal={setNewColor} onAdd={() => addToList(newColor, colors, setColors, setNewColor)} onRemove={(i) => removeFromList(i, colors, setColors)} placeholder="Black, Navy, Red..." />
        <Chips label="TAGS" items={tags} newVal={newTag} setNewVal={setNewTag} onAdd={() => addToList(newTag, tags, setTags, setNewTag)} onRemove={(i) => removeFromList(i, tags, setTags)} placeholder="bestseller, new..." />
      </section>

      {/* SEO */}
      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl font-bold mb-2">SEO</h2>
        <div>
          <label className="text-xs tracking-widest text-ink-500">META TITLE</label>
          <input value={form.metaTitle} onChange={e => setForm({...form, metaTitle: e.target.value})} className="input mt-1" maxLength={60} />
        </div>
        <div>
          <label className="text-xs tracking-widest text-ink-500">META DESCRIPTION</label>
          <textarea value={form.metaDesc} onChange={e => setForm({...form, metaDesc: e.target.value})} className="input mt-1" maxLength={160} />
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3 pb-10">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : isEdit ? 'Update product' : 'Create product'}
        </button>
        <button type="button" onClick={() => router.push('/admin/products')} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}

function Chips({ label, items, newVal, setNewVal, onAdd, onRemove, placeholder }: any) {
  return (
    <div>
      <label className="text-xs tracking-widest text-ink-500">{label}</label>
      <div className="flex gap-2 mt-1">
        <input value={newVal} onChange={e => setNewVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onAdd())} className="input" placeholder={placeholder} />
        <button type="button" onClick={onAdd} className="btn-outline !py-2"><Plus className="w-4 h-4" /></button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((it: string, i: number) => (
          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-ink-100 dark:bg-ink-800 text-sm">
            {it}
            <button type="button" onClick={() => onRemove(i)} className="text-ink-400 hover:text-accent"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
}
