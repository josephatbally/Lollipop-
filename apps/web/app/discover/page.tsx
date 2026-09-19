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
  followers_count?: number;
  media_count?: number;
  is_verified?: boolean;
  subscription_plan?: Plan | null;
};

const CATEGORIES = ["All", "Visual Art", "Music & Audio", "Cinema", "Design", "Gaming", "Performers"];

export default function DiscoverPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API + "/api/v1/creators");
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.detail ?? "Could not load creators.");
      const list = Array.isArray(data) ? data : Array.isArray(data?.value) ? data.value : [];
      setCreators(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load creators.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = creators.filter((c) => {
    const term = search.toLowerCase();
    return !term || c.display_name.toLowerCase().includes(term) || c.handle.toLowerCase().includes(term) || (c.bio && c.bio.toLowerCase().includes(term));
  });

  const featured = creators[0] ?? null;

  return (
    <main style={{ minHeight: "100vh", background: "#090a12", color: "#f5f6ff", paddingBottom: 100 }}>
      {/* Navigation Header */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(9, 10, 18, 0.85)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "16px 24px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                background: "linear-gradient(135deg, #f033a8, #3fe0d0)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                fontSize: 16,
                color: "#090a12",
                boxShadow: "0 0 16px rgba(240, 51, 168, 0.5)"
              }}>🍭</span>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "0.06em", color: "#f5f6ff" }}>LOLLIPOP</span>
            </Link>
            <nav style={{ display: "flex", gap: 20 }}>
              <Link href="/discover" style={{ color: "#f033a8", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Discover</Link>
              <Link href="/creators" style={{ color: "#949cb8", fontWeight: 500, fontSize: 14, textDecoration: "none" }}>Creators</Link>
              <Link href="/account" style={{ color: "#949cb8", fontWeight: 500, fontSize: 14, textDecoration: "none" }}>Account</Link>
            </nav>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/creators/studio" style={{
              padding: "8px 18px",
              borderRadius: 9999,
              background: "linear-gradient(135deg, #f033a8, #c41885)",
              color: "#ffffff",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
              boxShadow: "0 0 16px rgba(240, 51, 168, 0.4)"
            }}>
              Creator Studio
            </Link>
            <Link href="/login" style={{
              padding: "8px 18px",
              borderRadius: 9999,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#f5f6ff",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600
            }}>
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 20px" }}>
        {/* Featured Spotlight */}
        {featured && (
          <section style={{
            borderRadius: 24,
            overflow: "hidden",
            marginBottom: 48,
            border: "1px solid rgba(240, 51, 168, 0.25)",
            background: "radial-gradient(circle at 80% 30%, rgba(240, 51, 168, 0.3), transparent 50%), radial-gradient(circle at 10% 80%, rgba(63, 224, 208, 0.2), transparent 40%), linear-gradient(180deg, #16122c 0%, #0d101e 100%)",
            boxShadow: "0 0 40px rgba(240, 51, 168, 0.15)",
            padding: "48px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 320
          }}>
            <div style={{ maxWidth: 640 }}>
              <span style={{
                background: "rgba(240, 51, 168, 0.2)",
                border: "1px solid #f033a8",
                color: "#f033a8",
                padding: "6px 14px",
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase"
              }}>
                FEATURED SPOTLIGHT
              </span>
              <h1 style={{ fontSize: 44, fontWeight: 900, margin: "20px 0 12px", letterSpacing: "-0.03em" }}>
                {featured.display_name}
              </h1>
              <p style={{ color: "#d1d5e5", fontSize: 16, lineHeight: 1.6, margin: "0 0 24px" }}>
                {featured.bio || "Immerse yourself in premier creative drops, private streaming sessions, and exclusive masterclasses."}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <Link href={`/creators/${featured.id}`} style={{
                background: "linear-gradient(135deg, #f033a8, #c41885)",
                color: "#ffffff",
                padding: "14px 32px",
                borderRadius: 9999,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
                boxShadow: "0 0 24px rgba(240, 51, 168, 0.5)"
              }}>
                Explore Experiences →
              </Link>
              {featured.subscription_plan && (
                <span style={{ color: "#3fe0d0", fontWeight: 700, fontSize: 15, background: "rgba(63, 224, 208, 0.1)", padding: "10px 18px", borderRadius: 9999, border: "1px solid rgba(63, 224, 208, 0.3)" }}>
                  Pass from ${(featured.subscription_plan.price_cents / 100).toFixed(2)}/mo
                </span>
              )}
            </div>
          </section>
        )}

        {/* Catalog Header & Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, marginBottom: 24 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#3fe0d0", letterSpacing: "0.12em", textTransform: "uppercase" }}>EXPLORE</span>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: "4px 0 0" }}>Trending Creators</h2>
          </div>
          <div style={{ minWidth: 280 }}>
            <input
              type="text"
              placeholder="Search creators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 18px",
                borderRadius: 9999,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#f5f6ff",
                fontSize: 14,
                outline: "none"
              }}
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 16, marginBottom: 28 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "8px 18px",
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                border: selectedCategory === cat ? "1px solid #3fe0d0" : "1px solid rgba(255, 255, 255, 0.08)",
                background: selectedCategory === cat ? "rgba(63, 224, 208, 0.15)" : "rgba(255, 255, 255, 0.03)",
                color: selectedCategory === cat ? "#3fe0d0" : "#949cb8",
                boxShadow: selectedCategory === cat ? "0 0 14px rgba(63, 224, 208, 0.35)" : "none"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Creator Grid */}
        {error ? (
          <div style={{ padding: 40, borderRadius: 20, background: "rgba(255, 95, 158, 0.1)", border: "1px solid rgba(255, 95, 158, 0.3)", textAlign: "center" }}>
            <p style={{ color: "#ff5f9e", fontSize: 16, marginBottom: 16 }}>{error}</p>
            <button onClick={load} style={{ padding: "10px 24px", borderRadius: 9999, background: "#f033a8", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}>Try Again</button>
          </div>
        ) : loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 44, height: 44, border: "3px solid rgba(63, 224, 208, 0.2)", borderTopColor: "#3fe0d0", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#949cb8", fontSize: 14 }}>LOADING CATALOG...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(255, 255, 255, 0.1)", borderRadius: 24, color: "#949cb8" }}>
            <p style={{ fontSize: 18, margin: 0 }}>No creators match your criteria.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
            {filtered.map((creator, idx) => (
              <article
                key={creator.id}
                style={{
                  background: "rgba(17, 20, 36, 0.75)",
                  backdropFilter: "blur(16px)",
                  border: `1px solid ${idx % 2 === 0 ? "rgba(240, 51, 168, 0.3)" : "rgba(63, 224, 208, 0.3)"}`,
                  borderRadius: 20,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div style={{
                  height: 120,
                  background: idx % 2 === 0
                    ? "radial-gradient(circle at 70% 30%, rgba(240, 51, 168, 0.3), transparent 60%), linear-gradient(135deg, #18112d, #0b0f1a)"
                    : "radial-gradient(circle at 30% 70%, rgba(63, 224, 208, 0.25), transparent 60%), linear-gradient(135deg, #0e1e28, #0b0f1a)",
                  position: "relative"
                }}>
                  <div style={{
                    position: "absolute",
                    bottom: -32,
                    left: 20,
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    background: "#111424",
                    border: "3px solid #f033a8",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#f5f6ff",
                    boxShadow: "0 0 16px rgba(240, 51, 168, 0.45)"
                  }}>
                    {creator.display_name.slice(0, 1).toUpperCase()}
                  </div>
                </div>
                <div style={{ padding: "44px 20px 24px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>{creator.display_name}</h3>
                      <span style={{ background: "#3fe0d0", color: "#090a12", width: 18, height: 18, borderRadius: "50%", display: "inline-grid", placeItems: "center", fontSize: 11, fontWeight: 900 }}>✓</span>
                    </div>
                    <p style={{ margin: "4px 0 12px", color: "#949cb8", fontSize: 14 }}>@{creator.handle}</p>
                    {creator.bio && (
                      <p style={{ margin: "0 0 16px", color: "#d1d5e5", fontSize: 14, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {creator.bio}
                      </p>
                    )}
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {creator.subscription_plan ? (
                      <div>
                        <span style={{ fontSize: 11, color: "#949cb8", textTransform: "uppercase" }}>Pass</span>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#f033a8" }}>${(creator.subscription_plan.price_cents / 100).toFixed(2)}/mo</p>
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, color: "#3fe0d0" }}>Free access</span>
                    )}
                    <Link href={`/creators/${creator.id}`} style={{ background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: 9999, padding: "8px 20px", color: "#f5f6ff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>Profile →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
