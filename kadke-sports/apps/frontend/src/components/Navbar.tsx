'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, ShoppingBag, Heart, User, Moon, Sun, Menu, X } from 'lucide-react';
import { useAppSelector } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const NAV = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?category=cricket', label: 'Cricket' },
  { href: '/shop?category=football', label: 'Football' },
  { href: '/shop?category=jerseys', label: 'Jerseys' },
  { href: '/shop?category=sports-shoes', label: 'Shoes' },
  { href: '/shop?category=fitness', label: 'Fitness' },
];

export function Navbar() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState('');
  const router = useRouter();
  const cart = useAppSelector((s) => s.cart);
  const user = useAppSelector((s) => s.user.user);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      {/* Promo bar */}
      <div className="bg-ink-950 dark:bg-accent text-white text-xs">
        <div className="container-x py-2 overflow-hidden">
          <div className="marquee">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex gap-12 shrink-0">
                <span>🇮🇳 FREE SHIPPING ABOVE ₹1999</span>
                <span>⚡ NEW SEASON DROP</span>
                <span>🏏 OFFICIAL TEAM INDIA REPLICA</span>
                <span>🎯 CUSTOM JERSEYS — MIN 11 PCS</span>
                <span>🚚 COD AVAILABLE</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <header className={`sticky top-0 z-40 backdrop-blur transition-all ${scrolled ? 'bg-white/80 dark:bg-ink-950/80 border-b border-ink-200 dark:border-ink-800' : 'bg-transparent'}`}>
        <div className="container-x flex items-center justify-between gap-4 py-4">
          <Link href="/" className="font-display text-2xl font-black tracking-tight">
            KADKE<span className="text-accent">.</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {NAV.map((n) => (
              <Link key={n.label} href={n.href} className="text-sm hover:text-accent transition">
                {n.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={onSearch} className="hidden md:flex items-center bg-ink-100 dark:bg-ink-900 rounded-full px-4 py-2 w-72">
            <Search className="w-4 h-4 text-ink-400" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search jerseys, bats, shoes..."
              className="bg-transparent ml-2 text-sm w-full outline-none"
            />
          </form>

          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} aria-label="theme" className="p-2 rounded-full hover:bg-ink-100 dark:hover:bg-ink-900">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/wishlist" className="p-2 rounded-full hover:bg-ink-100 dark:hover:bg-ink-900">
              <Heart className="w-5 h-5" />
            </Link>
            <Link href="/cart" className="relative p-2 rounded-full hover:bg-ink-100 dark:hover:bg-ink-900">
              <ShoppingBag className="w-5 h-5" />
              {cart.count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-[10px] font-bold rounded-full bg-accent text-white grid place-items-center">
                  {cart.count}
                </span>
              )}
            </Link>
            <Link href={user ? '/profile' : '/login'} className="p-2 rounded-full hover:bg-ink-100 dark:hover:bg-ink-900">
              <User className="w-5 h-5" />
            </Link>
            <button onClick={() => setOpen(true)} className="lg:hidden p-2"><Menu className="w-5 h-5" /></button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 250, damping: 28 }}
              className="fixed inset-0 z-50 bg-white dark:bg-ink-950 p-6 lg:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-display text-2xl font-black">KADKE.</span>
                <button onClick={() => setOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              <nav className="flex flex-col gap-4 text-lg">
                {NAV.map((n) => (
                  <Link key={n.label} href={n.href} onClick={() => setOpen(false)} className="hover:text-accent">
                    {n.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
