"use client";

import { useEffect, useState } from "react";

import { API, readJson } from "./api-client";

type Creator = {
  id: number;
  display_name: string;
  handle: string;
  bio?: string | null;
  subscription_plan?: { price_cents: number; currency: string } | null;
};
type Media = {
  id: number;
  creator_id: number;
  title: string;
  description?: string | null;
  content_type: string;
  size_bytes: number;
  access_level: string;
};
type Experience = Media & { creator: Creator };

export default function Home() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const creatorsResponse = await fetch(API + "/api/v1/creators");
        const creators = await readJson(creatorsResponse);
        if (!creatorsResponse.ok) throw new Error(creators.detail ?? "Could not load experiences.");
        const creatorList = creators as Creator[];
        const results = await Promise.all(creatorList.map(async creator => {
          const response = await fetch(API + "/api/v1/creators/" + creator.id + "/media");
          const data = await readJson(response);
          if (!response.ok) throw new Error(data.detail ?? "Could not load creator media.");
          return (data as Media[]).map(media => ({ ...media, creator }));
        }));
        setExperiences(results.flat().slice(0, 6));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load experiences.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="shell">
      <nav className="nav">
        <a className="brand" href="/" aria-label="Lollipop home"><img src="/icons/lollipop.svg" alt="" /><span>LOLLIPOP</span></a>
        <div className="nav-links">
          <a href="/discover">Discover</a>
          <a href="/creators">Creators</a>
          <a href="/account">Account</a>
        </div>
        <a className="ghost-button" href="/login">Sign in</a>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">THE CREATOR DIMENSION</p>
          <h1>Enter a <span>different</span> dimension.</h1>
          <p className="hero-text">A cinematic home for creators, communities and premium video experiences.</p>
          <div className="actions">
            <a className="primary-button" href="/discover">Explore experiences</a>
            <a className="secondary-button" href="/creators">Become a creator</a>
          </div>
          <div className="signal"><i /> Platform status <b>ONLINE</b><em>•</em> Privacy-first</div>
        </div>
        <div className="orb" aria-hidden="true"><div className="orb-core" /><div className="orb-ring ring-a" /><div className="orb-ring ring-b" /><div className="orb-ring ring-c" /></div>
      </section>

      <section id="discover" className="section">
        <div className="section-heading"><div><p className="eyebrow">DISCOVER</p><h2>Published experiences</h2></div><a className="filter" href="/discover">View all ↗</a></div>
        {error && <p className="error">{error}</p>}
        <div className="cards">
          {loading ? (
            <div className="auth-card"><p className="eyebrow">DISCOVER</p><h2>Loading experiences…</h2></div>
          ) : experiences.length === 0 ? (
            <div className="auth-card"><p className="eyebrow">DISCOVER</p><h2>No published experiences yet.</h2><p>Verified creators and published media will appear here when available.</p></div>
          ) : (
            experiences.map((item, index) => (
              <a className={"experience " + ["violet", "cyan", "rose"][index % 3]} key={item.id} href={"/media/" + item.id}>
                <div className="video-surface"><span className="play">▶</span><span className="demo">{item.access_level}</span></div>
                <div className="card-copy"><div><h3>{item.title}</h3><p>{item.creator.display_name}</p></div><span className="arrow">↗</span></div>
              </a>
            ))
          )}
        </div>
      </section>

      <section id="creators" className="creator-strip">
        <div><p className="eyebrow">BUILT FOR CREATORS</p><h2>Your audience. Your rules.</h2></div>
        <p>Subscriptions, premium drops, private messages and transparent earnings — designed around the people making the work.</p>
      </section>
      <footer><span>LOLLIPOP © 2026</span><span>18+ • Verified adults only • Safety & privacy by design</span></footer>
    </main>
  );
}
