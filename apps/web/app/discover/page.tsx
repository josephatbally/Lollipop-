const creators = [
  { name: "Maya V.", handle: "@mayav", followers: "24.8K", accent: "violet" },
  { name: "Luna K.", handle: "@lunak", followers: "18.2K", accent: "cyan" },
  { name: "Aria R.", handle: "@ariar", followers: "31.6K", accent: "rose" },
  { name: "Nova S.", handle: "@novas", followers: "12.4K", accent: "violet" }
];

export default function DiscoverPage() {
  return (
    <main className="shell page">
      <nav className="nav"><a className="brand" href="/">◉ LOLLIPOP</a><div className="nav-links"><a href="/discover">Discover</a><a href="/creators">Creators</a><a href="/account">Account</a></div><button className="ghost-button">Sign in</button></nav>
      <header className="page-header"><p className="eyebrow">DISCOVER</p><h1>Find your next<br /><span>experience.</span></h1><p>Explore creator-led video experiences through a private, cinematic interface.</p></header>
      <section className="creator-grid">{creators.map((creator) => <article className={"creator-card " + creator.accent} key={creator.handle}><div className="avatar">{creator.name.slice(0,1)}</div><div><h2>{creator.name}</h2><p>{creator.handle} · {creator.followers} followers</p></div><button className="secondary-button">View</button></article>)}</section>
    </main>
  );
}
