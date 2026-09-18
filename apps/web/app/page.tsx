const experiences = [
  { title: "Afterglow", creator: "Maya V.", meta: "4K • 12:48", tone: "violet" },
  { title: "Neon Nights", creator: "Luna K.", meta: "4K • 08:21", tone: "cyan" },
  { title: "Private Signal", creator: "Aria R.", meta: "1080p • 16:04", tone: "rose" }
];

export default function Home() {
  return (
    <main className="shell">
      <nav className="nav">
        <div className="brand"><span className="brand-mark">●</span> LOLLIPOP</div>
        <div className="nav-links"><a href="#discover">Discover</a><a href="#creators">Creators</a><a href="#membership">Membership</a></div>
        <button className="ghost-button">Sign in</button>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">THE CREATOR DIMENSION</p>
          <h1>Enter a <span>different</span> dimension.</h1>
          <p className="hero-text">A cinematic home for creators, communities and premium video experiences.</p>
          <div className="actions"><button className="primary-button">Explore experiences</button><button className="secondary-button">Become a creator</button></div>
          <div className="signal"><i /> Platform status <b>ONLINE</b><em>•</em> Privacy-first</div>
        </div>
        <div className="orb" aria-hidden="true"><div className="orb-core" /><div className="orb-ring ring-a" /><div className="orb-ring ring-b" /><div className="orb-ring ring-c" /></div>
      </section>
      <section id="discover" className="section">
        <div className="section-heading"><div><p className="eyebrow">DISCOVER</p><h2>Trending experiences</h2></div><button className="filter">For you ↗</button></div>
        <div className="cards">
          {experiences.map((item) => (
            <article className={"experience " + item.tone} key={item.title}>
              <div className="video-surface"><span className="play">▶</span><span className="duration">{item.meta}</span><span className="demo">DEMO MEDIA</span></div>
              <div className="card-copy"><div><h3>{item.title}</h3><p>{item.creator}</p></div><span className="arrow">↗</span></div>
            </article>
          ))}
        </div>
      </section>
      <section id="creators" className="creator-strip"><div><p className="eyebrow">BUILT FOR CREATORS</p><h2>Your audience. Your rules.</h2></div><p>Subscriptions, premium drops, private messages and transparent earnings — designed around the people making the work.</p></section>
      <footer><span>LOLLIPOP © 2026</span><span>18+ • Verified adults only • Safety & privacy by design</span></footer>
    </main>
  );
}
