export const metadata = { title: 'Returns & Refunds · Kadke Sports' };

export default function ReturnsPage() {
  return (
    <div className="container-x py-12 max-w-3xl prose dark:prose-invert">
      <h1 className="font-display text-5xl font-bold mb-6">Returns & Refunds</h1>
      <p className="text-ink-500 mb-8">Easy 7-day returns on most products.</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">Return window</h2>
      <p>You have <strong>7 days from delivery</strong> to return unworn, unwashed products in original packaging with all tags attached.</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">What can be returned</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Cricket bats, helmets, gloves (unused, in original condition)</li>
        <li>Football boots, sneakers (unworn, with original box)</li>
        <li>Jerseys and apparel (unworn, unwashed, tags intact)</li>
        <li>Fitness gear (unused)</li>
      </ul>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">What cannot be returned</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Custom team kits</strong> — made-to-order and non-returnable</li>
        <li>Personalized jerseys (name/number printed)</li>
        <li>Innerwear, mouthguards, and other hygiene-sensitive items</li>
        <li>Items damaged by misuse or normal wear</li>
      </ul>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">How to return</h2>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Go to <strong>My Orders</strong> and click <strong>Request return</strong> on the item</li>
        <li>Select a reason and submit</li>
        <li>Our team approves within 24 hours and schedules a free pickup</li>
        <li>Pack the item in original packaging</li>
        <li>Hand it to our courier when they arrive (1–3 business days)</li>
      </ol>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">Refund timeline</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Prepaid orders:</strong> 5–7 business days after we receive the item, back to original payment method</li>
        <li><strong>Cash on Delivery:</strong> 7–10 business days, refunded to your bank account (we&apos;ll ask for IFSC + account number)</li>
      </ul>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">Exchanges</h2>
      <p>For size or color exchange, raise a return then place a fresh order. We don&apos;t reserve stock during the return window.</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">Questions</h2>
      <p>Email <a href="mailto:returns@kadkesports.com" className="text-accent">returns@kadkesports.com</a> with your order number.</p>
    </div>
  );
}
