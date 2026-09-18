"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type Plan = { price_cents: number; currency: string };
type Creator = {
  id: number;
  display_name: string;
  handle: string;
  bio?: string | null;
  subscription_plan?: Plan | null;
};

export default function DiscoverPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API + "/api/v1/creators")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail ?? "Could not load creators.");
        setCreators(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load creators."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="shell page">
      <nav className="nav">
        <a className="brand" href="/">◉ LOLLIPOP</a>
        <div className="nav-links">
          <a href="/discover">Discover</a>
          <a href="/creators">Creators</a>
          <a href="/account">Account</a>
        </div>
        <a className="ghost-button" href="/login">Sign in</a>
      </nav>

      <header className="page-header">
        <p className="eyebrow">DISCOVER</p>
        <h1>Find your next<br /><span>experience.</span></h1>
        <p>Explore verified creator profiles and published experiences through a private, cinematic interface.</p>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="creator-grid">
        {loading ? (
          <div className="auth-card"><p className="eyebrow">DISCOVER</p><h2>Loading creators…</h2></div>
        ) : creators.length === 0 ? (
          <div className="auth-card"><p className="eyebrow">DISCOVER</p><h2>No creators are published yet.</h2><p>Verified creator profiles will appear here when they are ready.</p></div>
        ) : (
          creators.map((creator, index) => (
            <article className={"creator-card " + ["violet", "cyan", "rose"][index % 3]} key={creator.id}>
              <div className="avatar">{creator.display_name.slice(0, 1).toUpperCase()}</div>
              <div>
                <h2>{creator.display_name}</h2>
                <p>@{creator.handle}</p>
                {creator.bio && <p>{creator.bio}</p>}
                {creator.subscription_plan && (
                  <p>{creator.subscription_plan.currency} {(creator.subscription_plan.price_cents / 100).toFixed(2)} / month</p>
                )}
              </div>
              <a className="secondary-button" href={"/creators/" + creator.id}>View</a>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
