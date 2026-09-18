const steps = ["Create your profile", "Complete verification", "Publish approved media", "Build your audience", "Track earnings"];

export default function CreatorsPage() {
  return (
    <main className="shell page">
      <nav className="nav"><a className="brand" href="/">◉ LOLLIPOP</a><div className="nav-links"><a href="/discover">Discover</a><a href="/creators">Creators</a><a href="/account">Account</a></div><button className="ghost-button">Sign in</button></nav>
      <header className="page-header"><p className="eyebrow">CREATOR MODE</p><h1>Build your<br /><span>dimension.</span></h1><p>A creator workspace designed for publishing, audience growth and transparent monetization.</p><button className="primary-button">Start creator application</button></header>
      <section className="step-list">{steps.map((step, i) => <div className="step" key={step}><strong>0{i+1}</strong><span>{step}</span><b>↗</b></div>)}</section>
    </main>
  );
}
