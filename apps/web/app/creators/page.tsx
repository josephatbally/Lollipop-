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
  avatar_url?: string | null;
  banner_url?: string | null;
  followers_count?: number;
  media_count?: number;
  is_verified?: boolean;
  subscription_plan?: Plan | null;
};

function formatFollowers(count: number = 0): string {
  if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + "M";
  if (count >= 1_000) return (count / 1_000).toFixed(1) + "K";
  return count.toString();
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [following, setFollowing] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/api/v1/creators`);
      const data = await readJson<Creator[]>(response);
      setCreators(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load creators.");
    } finally {
      setLoading(false);
    }
  }

  function toggleFollow(creatorId: number) {
    setFollowing((prev) =>
      prev.includes(creatorId)
        ? prev.filter((id) => id !== creatorId)
        : [...prev, creatorId]
    );
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="shell page">
      {/* Top Header Navigation */}
      <nav className="nav">
        <Link className="brand" href="/" aria-label="Lollipop home">
          <img src="/icons/lollipop.svg" alt="" />
          <span>LOLLIPOP</span>
        </Link>
        <div className="nav-links">
          <Link href="/discover">Discover</Link>
          <Link href="/creators" style={{ color: "var(--text)" }}>Creators</Link>
          <Link href="/creators/studio">Studio</Link>
          <Link href="/admin/verifications">Admin</Link>
          <Link href="/account">Account</Link>
        </div>
        <Link className="ghost-button" href="/login">Sign in</Link>
      </nav>

      {/* Hero Header */}
      <header className="page-header" style={{ margin: "40px 0 32px" }}>
        <p className="eyebrow" style={{ color: "var(--violet)", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em" }}>
          CREATORS
        </p>
        <h1 style={{ fontSize: "2.4rem", margin: "8px 0", fontWeight: 800 }}>
          Verified creators
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
          Hand-checked artists, players and producers publishing on Lollipop.
        </p>
      </header>

      {error ? (
        <section className="auth-card" style={{ padding: 24, background: "var(--panel)", borderRadius: 16 }}>
          <p className="eyebrow" style={{ color: "var(--rose)" }}>CONNECTION NOTICE</p>
          <h2>Could not reach creator service</h2>
          <p style={{ color: "var(--muted)", margin: "8px 0 16px" }}>{error}</p>
          <button className="secondary-button" onClick={load}>Try again</button>
        </section>
      ) : loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)" }}>
          Loading creators...
        </div>
      ) : (
        <div className="creator-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "24px",
          paddingBottom: "60px"
        }}>
          {creators.map((c) => {
            const isFollowing = following.includes(c.id);
            const banner = c.banner_url || `https://picsum.photos/seed/${c.handle}/600/200`;
            const avatar = c.avatar_url || `https://i.pravatar.cc/160?u=${c.handle}`;

            return (
              <div
                key={c.id}
                style={{
                  background: "rgba(13, 16, 27, 0.7)",
                  border: "1px solid var(--line)",
                  borderRadius: "20px",
                  overflow: "hidden",
                  transition: "border-color 0.2s ease, transform 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  backdropFilter: "blur(12px)"
                }}
              >
                {/* Banner Header */}
                <div style={{ height: "110px", width: "100%", position: "relative", overflow: "hidden" }}>
                  <img
                    src={banner}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }}
                  />
                </div>

                {/* Card Body with Overlapping Avatar */}
                <div style={{ padding: "0 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ marginTop: "-40px", marginBottom: "12px" }}>
                    <img
                      src={avatar}
                      alt={c.display_name}
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        border: "3px solid var(--bg)",
                        objectFit: "cover",
                        background: "#0d101b"
                      }}
                    />
                  </div>

                  <Link
                    href={`/creators/${c.id}`}
                    style={{
                      color: "var(--text)",
                      textDecoration: "none",
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    {c.display_name}
                    <span style={{ color: "var(--cyan)", fontSize: "0.9rem" }}>✦</span>
                  </Link>
                  <p style={{ color: "var(--muted)", fontSize: "0.8rem", margin: "2px 0 8px" }}>
                    @{c.handle}
                  </p>

                  <p style={{
                    color: "var(--muted)",
                    fontSize: "0.85rem",
                    lineHeight: "1.4",
                    flex: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    {c.bio || "Creator publishing multimedia experiences and exclusives on Lollipop."}
                  </p>

                  <div style={{
                    marginTop: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "1px solid var(--line)",
                    paddingTop: "14px"
                  }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                      {formatFollowers(c.followers_count || 4200)} followers · {c.media_count ?? 8} media
                    </span>

                    <button
                      onClick={() => toggleFollow(c.id)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: "999px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        border: isFollowing ? "1px solid var(--line)" : "none",
                        background: isFollowing ? "transparent" : "var(--violet)",
                        color: isFollowing ? "var(--muted)" : "#fff"
                      }}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
