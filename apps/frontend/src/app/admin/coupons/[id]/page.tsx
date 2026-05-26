'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { CouponForm } from '@/components/CouponForm';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store';

export default function EditCouponPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAppSelector(s => s.user.user);
  const router = useRouter();
  const [coupon, setCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/login?next=/admin/coupons'); return; }
    api.get(`/coupons/${id}`).then(({ data }) => {
      setCoupon(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, user, router]);

  if (loading) return <div className="container-x py-20 text-center text-ink-500">Loading...</div>;
  if (!coupon) return <div className="container-x py-20 text-center">Not found. <Link href="/admin/coupons" className="text-accent">Back</Link></div>;

  return (
    <div className="container-x py-10">
      <Link href="/admin/coupons" className="text-sm text-ink-500 hover:text-accent inline-flex items-center mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to coupons
      </Link>
      <h1 className="font-display text-5xl font-bold mb-2">Edit coupon</h1>
      <p className="text-ink-500 mb-8 font-mono text-sm">{coupon.code}</p>
      <CouponForm initial={coupon} couponId={coupon.id} />
    </div>
  );
}
