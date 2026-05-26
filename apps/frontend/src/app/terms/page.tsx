export const metadata = { title: 'Terms of Service · Kadke Sports' };

export default function TermsPage() {
  return (
    <div className="container-x py-12 max-w-3xl prose dark:prose-invert">
      <h1 className="font-display text-5xl font-bold mb-6">Terms of Service</h1>
      <p className="text-ink-500 mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">1. Acceptance of terms</h2>
      <p>By using kadkesports.com you agree to be bound by these terms. If you do not agree, please do not use the site.</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">2. Account responsibility</h2>
      <p>You are responsible for keeping your account credentials safe. Kadke Sports is not liable for any loss or damage from unauthorized account access.</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">3. Orders & pricing</h2>
      <p>All prices are in Indian Rupees (INR) and inclusive of applicable GST. We reserve the right to refuse or cancel any order for any reason, including pricing errors, suspected fraud, or stock unavailability.</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">4. Product authenticity</h2>
      <p>All Kadke Sports products are genuine and tested before dispatch. Counterfeit products discovered post-sale will be replaced at no cost.</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">5. Intellectual property</h2>
      <p>All content on this site — including logos, designs, photographs, and product descriptions — is the property of Kadke Sports and may not be reproduced without written permission.</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">6. Limitation of liability</h2>
      <p>Kadke Sports shall not be liable for any indirect, incidental, or consequential damages arising from your use of the site or our products.</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">7. Governing law</h2>
      <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai.</p>

      <h2 className="font-display text-2xl font-bold mt-8 mb-3">8. Contact</h2>
      <p>For any questions about these terms, please email <a href="mailto:legal@kadkesports.com" className="text-accent">legal@kadkesports.com</a>.</p>
    </div>
  );
}
