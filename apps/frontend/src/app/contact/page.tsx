export default function ContactPage() {
  return (
    <div className="container-x py-20 max-w-2xl">
      <h1 className="font-display text-5xl font-bold mb-2">Get in touch</h1>
      <p className="text-ink-500 mb-10">Team kits, bulk orders, or just hi.</p>
      <form className="space-y-4">
        <input className="input" placeholder="Name" />
        <input type="email" className="input" placeholder="Email" />
        <input className="input" placeholder="Subject" />
        <textarea className="input min-h-[140px]" placeholder="Message" />
        <button className="btn-primary">Send message</button>
      </form>
      <div className="mt-12 grid sm:grid-cols-2 gap-6 text-sm">
        <div>
          <div className="text-xs tracking-widest text-ink-500 mb-1">EMAIL</div>
          <a href="mailto:hello@kadkesports.com" className="hover:text-accent">hello@kadkesports.com</a>
        </div>
        <div>
          <div className="text-xs tracking-widest text-ink-500 mb-1">PHONE</div>
          <a href="tel:+918000000000" className="hover:text-accent">+91 80000 00000</a>
        </div>
      </div>
    </div>
  );
}
