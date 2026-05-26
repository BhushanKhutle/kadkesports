'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { CouponForm } from '@/components/CouponForm';
import { useAppSelector } from '@/store';

export default function NewCouponPage() {
  const user = useAppSelector(s => s.user.user);
  const router = useRouter();
  useEffect(() => { if (!user || user.role !== 'ADMIN') { router.push('/login?next=/admin/coupons'); return; } }, [user, router]);

  return (
    <div className="container-x py-10">
      <Link href="/admin/coupons" className="text-sm text-ink-500 hover:text-accent inline-flex items-center mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to coupons
      </Link>
      <h1 className="font-display text-5xl font-bold mb-8">New coupon</h1>
      <CouponForm />
    </div>
  );
}
