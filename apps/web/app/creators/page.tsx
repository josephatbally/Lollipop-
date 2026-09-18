"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API, readJson } from "../api-client";

type Plan = { price_cents: number; currency: string };
type Creator = {
  id: number;
  display_name: string;
  handle: string;
  bio?: string | null;
  subscription_plan?: Plan | null;
};

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API + "/api/v1/creators");
      const data = await readJson<Creator[]>(response);
      setCreators(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load creators.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="shell page">
      <nav className="nav">
        <Link className="brand" href="/" aria-label="Lollipop home">
          <img src="/icons/lollipop.svg" alt="" />
          <span>LOLLIPOP</span>
        </Link>
        <div className="nav-links">
          <Link href="/discover">Discover</Link>
          <Link href="/creators">Creators</Link>
          <Link href="/account">Account</Link>
        </div>
        <Link className="ghost-button" href="/login">Sign in</Link>
      </nav>

      <header className="page-header">
        <p className="eyebrow">CREATORS</p>
        <h1>Meet the people<br /><span>behind the dimension.</span></h1>
        <p>Explore verified creators and open their published experiences.</p>
      </header>

      {error ? (
        <section className="auth-card">
          <p className="eyebrow">CONNECTION ERROR</p>
          <h2>Could not reach the creator service.</h2>
          <p>{error}</p>
          <button className="secondary-button" onClick={load}>Try again</button>
        </section>
      ) : (
        <section className="creator-grid">
          {loading ? (
            <div className="auth-card">
              <p className="eyebrow">CREATORS</p>
              <h2>Loading creators…</h2>
            </div>
          ) : creators.length === 0 ? (
            <div className="auth-card">
              <p className="eyebrow">CREATORS</p>
              <h2>No creators are published yet.</h2>
              <p>Verified creator profiles will appear here when they are ready.</p>
              <Link className="secondary-button" href="/creators/apply">Become a creator</Link>
            </div>
          ) : (
            creators.map((creator, index) => (
              <article className={"creator-card " + ["violet", "cyan", "rose"][index % 3]} key={creator.id}>
                <div className="avatar">{creator.display_name.slice(0, 1).toUpperCase()}</div>
                <div>
                  <h2>{creator.display_name}</h2>
                  <p>@{creator.handle}</p>
                  {creator.bio && <p>{creator.bio}</p>}
                  {creator.subscription_plan && (
                    <p>
                      {creator.subscription_plan.currency}{" "}
                      {(creator.subscription_plan.price_cents / 100).toFixed(2)} / month
                    </p>
                  )}
                </div>
                <Link className="secondary-button" href={"/creators/" + creator.id}>View</Link>
              </article>
            ))
          )}
        </section>
      )}
    </main>
  );
}
