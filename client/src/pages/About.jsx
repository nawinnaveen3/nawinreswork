import ownerPhoto from '../assets/owner-photo.jpeg';

export default function About() {
  const features = ['Freshly prepared dishes', 'Elegant dining room', 'Home delivery', 'Attentive service'];
  return (
    <div className="page container">
      <div className="page-head">
        <h1 style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)' }}>About Nawin's Restaurant</h1>
        <p>Our story, our promise and the people behind the kitchen.</p>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
        <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=70"
          alt="Restaurant dining room" style={{ borderRadius: 'var(--radius)', width: '100%', height: '100%', objectFit: 'cover', minHeight: 260 }} />
        <div className="card">
          <h2>Our story</h2>
          <p className="muted" style={{ marginTop: '.8rem' }}>
            Nawin's Restaurant was built around one idea: a meal should feel like an occasion. We cook with care,
            serve with warmth and keep our menu focused on dishes we are proud of.
          </p>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card"><h3>Mission</h3><p className="muted">To serve honest, beautifully prepared food in a welcoming setting.</p></div>
        <div className="card"><h3>Vision</h3><p className="muted">To be the first place our guests think of for a memorable meal.</p></div>
        <div className="card"><h3>Quality</h3><p className="muted">Fresh ingredients, careful preparation and consistent standards on every order.</p></div>
      </div>

      <section className="section" style={{ paddingBottom: 0 }}>
        <h2 style={{ marginBottom: '1.2rem' }}>Meet the chef</h2>
        <div className="card row" style={{ gap: '1.5rem' }}>
          <img src={ownerPhoto} alt="Nawin, founder of Nawin's Restaurant"
            style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <h3>Nawin &middot; Founder &amp; Head Chef</h3>
            <p className="muted">Dubai's Famous and Popular chef.</p>
          </div>
        </div>
        <div className="chips" style={{ marginTop: '1.5rem' }}>
          {features.map((f) => <span key={f} className="chip on">{f}</span>)}
        </div>
      </section>
    </div>
  );
}
