import Link from 'next/link';
import { Instagram, Twitter, Youtube, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-100 mt-24">
      <div className="container-x py-16 grid gap-12 md:grid-cols-4">
        <div>
          <div className="font-display text-3xl font-black mb-3">KADKE<span className="text-accent">.</span></div>
          <p className="text-sm text-ink-400 leading-relaxed">
            Premium sports gear, engineered for Indian athletes.
            From street cricket to international tournaments.
          </p>
          <div className="flex gap-3 mt-6">
            {[Instagram, Twitter, Youtube, Facebook].map((Icon, i) => (
              <a key={i} href="#" className="p-2 rounded-full bg-ink-900 hover:bg-accent transition" aria-label="social">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-bold tracking-widest text-ink-500 mb-4">SHOP</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop?category=cricket" className="hover:text-accent">Cricket</Link></li>
            <li><Link href="/shop?category=football" className="hover:text-accent">Football</Link></li>
            <li><Link href="/shop?category=jerseys" className="hover:text-accent">Jerseys</Link></li>
            <li><Link href="/shop?category=sports-shoes" className="hover:text-accent">Shoes</Link></li>
            <li><Link href="/shop?category=custom-jerseys" className="hover:text-accent">Custom Jerseys</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold tracking-widest text-ink-500 mb-4">COMPANY</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-accent">About</Link></li>
            <li><Link href="/contact" className="hover:text-accent">Contact</Link></li>
            <li><Link href="/shipping" className="hover:text-accent">Shipping</Link></li>
            <li><Link href="/returns" className="hover:text-accent">Returns</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold tracking-widest text-ink-500 mb-4">NEWSLETTER</div>
          <p className="text-sm text-ink-400 mb-3">Get first dibs on drops, restocks & team kit launches.</p>
          <form className="flex gap-2">
            <input className="input bg-ink-900 border-ink-800 text-white" placeholder="you@email.com" />
            <button className="btn-primary !py-2 !px-4 text-sm">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-ink-900">
        <div className="container-x py-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-ink-500">
          <span>© {new Date().getFullYear()} Kadke Sports Pvt Ltd. Made in India.</span>
          <div className="flex gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
