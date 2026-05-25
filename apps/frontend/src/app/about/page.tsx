export default function AboutPage() {
  return (
    <div className="container-x py-20 max-w-3xl">
      <h1 className="font-display text-6xl font-bold mb-6">Built for the grind.</h1>
      <p className="text-lg text-ink-500 leading-relaxed mb-6">
        Kadke Sports started in a garage in Pune in 2018, with three friends
        who couldn't find quality cricket gear at a fair price. We make
        professional-grade equipment, jerseys & training gear for Indian athletes —
        from gully cricket to international tournaments.
      </p>
      <p className="text-lg text-ink-500 leading-relaxed mb-12">
        Today we serve 50,000+ athletes and 200+ teams across India, with a 4.9-star rating and a promise: tournament-tested gear, delivered honestly.
      </p>
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { n: '50K+', l: 'Athletes' },
          { n: '200+', l: 'Teams' },
          { n: '4.9★', l: 'Rating' },
        ].map((s, i) => (
          <div key={i} className="card p-6 text-center">
            <div className="font-display text-4xl font-bold">{s.n}</div>
            <div className="text-xs tracking-widest text-ink-500 mt-2">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
