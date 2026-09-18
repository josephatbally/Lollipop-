"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { API, readJson } from "../../api-client";

type Plan = { price_cents: number; currency: string };
type Creator = {
  id: number;
  display_name: string;
  handle: string;
  bio?: string | null;
  subscription_plan?: Plan | null;
  media_count: number;
};
type Media = {
  id: number;
  title: string;
  description?: string | null;
  content_type: string;
  size_bytes: number;
  access_level: string;
  created_at: string;
};

export default function CreatorProfilePage() {
  const params = useParams<{ id: string }>();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      fetch(API + "/api/v1/creators/" + params.id).then(async r => {
        const d = await readJson(r);
        if (!r.ok) throw new Error(d.detail ?? "Creator not found.");
        return d;
      }),
      fetch(API + "/api/v1/creators/" + params.id + "/media").then(async r => {
        const d = await readJson(r);
        if (!r.ok) throw new Error(d.detail ?? "Could not load media.");
        return d;
      }),
    ])
      .then(([creatorData, mediaData]) => {
        setCreator(creatorData);
        setMedia(mediaData);
      })
      .catch(err => setError(err instanceof Error ? err.message : "Could not load creator."))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <main className="shell page"><header className="page-header"><p className="eyebrow">CREATOR</p><h1>Loading<span>…</span></h1></header></main>;
  }

  if (error || !creator) {
    return <main className="shell page"><nav className="nav"><a className="brand" href="/">◉ LOLLIPOP</a><a href="/discover">Back to discover</a></nav><p className="error">{error || "Creator not found."}</p></main>;
  }

  return (
    <main className="shell page">
      <nav className="nav">
        <a className="brand" href="/">◉ LOLLIPOP</a>
        <div className="nav-links"><a href="/discover">Discover</a><a href="/account">Account</a></div>
      </nav>

      <header className="page-header">
        <p className="eyebrow">VERIFIED CREATOR</p>
        <h1>{creator.display_name}<br /><span>@{creator.handle}</span></h1>
        {creator.bio && <p>{creator.bio}</p>}
        <p>{creator.media_count} published experience{creator.media_count === 1 ? "" : "s"}</p>
        {creator.subscription_plan && (
          <p>{creator.subscription_plan.currency} {(creator.subscription_plan.price_cents / 100).toFixed(2)} / month</p>
        )}
      </header>

      <section className="creator-grid">
        {media.length === 0 ? (
          <div className="auth-card"><p className="eyebrow">CONTENT</p><h2>No published experiences yet.</h2></div>
        ) : (
          media.map(item => (
            <article className="creator-card cyan" key={item.id}>
              <div className="video-surface"><span className="play">▶</span><span className="demo">{item.access_level}</span></div>
              <div>
                <h2>{item.title}</h2>
                {item.description && <p>{item.description}</p>}
                <p>{item.content_type} · {Math.round(item.size_bytes / 1024)} KB</p>
                <a className="secondary-button" href={"/media/" + item.id}>Open experience</a>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
