export const metadata = { title: 'Privacy Policy · Kadke Sports' };

export default function PrivacyPage() {
  return (
    <div className="container-x py-12 max-w-3xl prose dark:prose-invert">
      <h1 className="font-display text-5xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-ink-500 mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">What we collect</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Account information: name, email, phone, password (hashed)</li>
        <li>Shipping addresses for order delivery</li>
        <li>Order history and payment status (we never store full card numbers)</li>
        <li>Browser and device information for security and analytics</li>
      </ul>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">How we use it</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Process and deliver your orders</li>
        <li>Send order updates, shipping notifications, and customer support</li>
        <li>Improve site features and personalize your shopping experience</li>
        <li>Prevent fraud and protect your account</li>
      </ul>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">Who we share with</h2>
      <p>We share data only with trusted partners necessary to fulfill orders: payment processors (Razorpay), shipping providers, and analytics services. We never sell your data.</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">Your rights</h2>
      <p>You can:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Access and download your personal data</li>
        <li>Update or correct your information from your profile</li>
        <li>Request deletion of your account and associated data</li>
        <li>Unsubscribe from marketing emails at any time</li>
      </ul>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">Cookies</h2>
      <p>We use essential cookies for site functionality (login, cart) and optional analytics cookies. You can disable non-essential cookies in your browser settings.</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">Contact</h2>
      <p>Privacy questions or data requests: <a href="mailto:privacy@kadkesports.com" className="text-accent">privacy@kadkesports.com</a>.</p>
    </div>
  );
}
