export const metadata = { title: 'Shipping · Kadke Sports' };

export default function ShippingPage() {
  return (
    <div className="container-x py-12 max-w-3xl prose dark:prose-invert">
      <h1 className="font-display text-5xl font-bold mb-6">Shipping Policy</h1>
      <p className="text-ink-500 mb-8">Fast, tracked delivery across India.</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">Delivery time</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Metro cities:</strong> 2–4 business days</li>
        <li><strong>Tier-2 cities:</strong> 3–5 business days</li>
        <li><strong>Other locations:</strong> 5–8 business days</li>
        <li><strong>Custom team kits:</strong> 7–14 business days (production time)</li>
      </ul>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">Shipping charges</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Free shipping</strong> on orders above ₹1,999</li>
        <li>₹99 flat for orders below ₹1,999</li>
        <li>Cash on Delivery available across India</li>
      </ul>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">Tracking</h2>
      <p>Once your order ships, you&apos;ll receive an email and SMS with the tracking number and courier link. You can also check status anytime in <strong>My Orders</strong>.</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">International shipping</h2>
      <p>Currently we ship only within India. International shipping is planned for late 2026.</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">Delivery issues</h2>
      <p>If your order is delayed beyond the estimated window or arrives damaged, email <a href="mailto:support@kadkesports.com" className="text-accent">support@kadkesports.com</a> within 48 hours of delivery.</p>
    </div>
  );
}
