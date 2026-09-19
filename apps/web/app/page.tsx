"use client";

import Link from "next/link";
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
        const creatorList = Array.isArray(creators) ? creators as Creator[] : Array.isArray(creators?.value) ? creators.value as Creator[] : [];
        const results = await Promise.all(
          creatorList.map(async creator => {
            const response = await fetch(API + "/api/v1/creators/" + creator.id + "/media");
            const data = await readJson(response);
            if (!response.ok) return [];
            return (data as Media[]).map(media => ({ ...media, creator }));
          })
        );
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
    <div
      style={{
        minHeight: "100vh",
        background: "#07080d",
        color: "#f5f5f7",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflowX: "hidden",
      }}
    >
      <nav
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "#fff",
            fontWeight: 800,
            letterSpacing: "0.1em",
            fontSize: "1.2rem",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f033a8, #3fe0d0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(240,51,168,0.5)",
            }}
          >
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#07080d" }} />
          </div>
          LOLLIPOP
        </Link>

        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link href="/discover" style={{ color: "#a0a5b5", textDecoration: "none", fontSize: "0.95rem", fontWeight: 500 }}>
            Discover
          </Link>
          <Link href="/creators" style={{ color: "#a0a5b5", textDecoration: "none", fontSize: "0.95rem", fontWeight: 500 }}>
            Creators
          </Link>
          <Link href="/account" style={{ color: "#a0a5b5", textDecoration: "none", fontSize: "0.95rem", fontWeight: 500 }}>
            Account
          </Link>
          <Link
            href="/login"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              padding: "8px 18px",
              borderRadius: "100px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            Sign in
          </Link>
        </div>
      </nav>

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "80px 20px 100px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "40px",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: "600px", zIndex: 2 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              fontWeight: 800,
              color: "#f033a8",
              marginBottom: "16px",
              background: "rgba(240,51,168,0.1)",
              padding: "6px 14px",
              borderRadius: "100px",
            }}
          >
            THE CREATOR DIMENSION
          </div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.2rem)",
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              margin: "0 0 24px",
            }}
          >
            Enter a <span style={{ color: "#f033a8" }}>different</span> dimension.
          </h1>
          <p style={{ color: "#8a8f9d", fontSize: "1.15rem", lineHeight: 1.6, margin: "0 0 36px" }}>
            A cinematic home for verified creators, premium drops, and exclusive community experiences.
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "40px" }}>
            <Link
              href="/discover"
              style={{
                background: "linear-gradient(135deg, #f033a8 0%, #a82079 100%)",
                color: "#fff",
                padding: "16px 32px",
                borderRadius: "100px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1rem",
                boxShadow: "0 8px 30px rgba(240,51,168,0.4)",
              }}
            >
              Explore experiences ↗
            </Link>
            <Link
              href="/creators/apply"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                padding: "16px 32px",
                borderRadius: "100px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              Become a creator
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#6a7082", fontSize: "0.85rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3fe0d0", display: "inline-block" }} />
            Platform status <strong style={{ color: "#fff" }}>ONLINE</strong> • 18+ Verified adults only • Safety & Privacy by design
          </div>
        </div>

        <div
          style={{
            position: "relative",
            width: "320px",
            height: "320px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "280px",
              height: "280px",
              borderRadius: "50%",
              background: "radial-gradient(circle, #f033a8 0%, #3fe0d0 70%, transparent 100%)",
              filter: "blur(50px)",
              opacity: 0.35,
            }}
          />
          <div
            style={{
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              border: "1px solid rgba(240,51,168,0.4)",
              boxShadow: "0 0 50px rgba(240,51,168,0.2) inset",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                border: "1px dashed rgba(63,224,208,0.5)",
              }}
            />
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
          <div>
            <div style={{ color: "#3fe0d0", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", marginBottom: "8px" }}>
              DISCOVER
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>Published experiences</h2>
          </div>
          <Link href="/discover" style={{ color: "#3fe0d0", textDecoration: "none", fontWeight: 600, fontSize: "0.95rem" }}>
            View all ↗
          </Link>
        </div>

        {error && (
          <div style={{ background: "rgba(255,75,75,0.12)", color: "#ff6b6b", padding: "14px", borderRadius: "12px", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#8a8f9d" }}>Loading cinematic experiences…</div>
        ) : experiences.length === 0 ? (
          <div
            style={{
              background: "rgba(18,20,29,0.5)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "20px",
              padding: "48px 32px",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: "1.2rem" }}>No published experiences yet</h3>
            <p style={{ color: "#8a8f9d", fontSize: "0.9rem", margin: 0 }}>
              Verified creators and newly approved media will appear in this spotlight.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {experiences.map((item, idx) => (
              <Link
                key={item.id}
                href={"/media/" + item.id}
                style={{
                  textDecoration: "none",
                  color: "#fff",
                  background: "rgba(18, 20, 29, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "20px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
              >
                <div
                  style={{
                    height: "190px",
                    background: `linear-gradient(135deg, ${
                      ["rgba(240,51,168,0.25)", "rgba(63,224,208,0.2)", "rgba(168,85,247,0.25)"][idx % 3]
                    } 0%, rgba(10,12,18,0.95) 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.5)",
                      backdropFilter: "blur(10px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      color: "#fff",
                    }}
                  >
                    ▶
                  </div>
                  <span
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      right: "12px",
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "100px",
                      padding: "4px 10px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: item.access_level === "SUBSCRIBERS_ONLY" ? "#f033a8" : "#3fe0d0",
                    }}
                  >
                    {item.access_level}
                  </span>
                </div>

                <div style={{ padding: "20px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px" }}>{item.title}</h3>
                  <p style={{ color: "#8a8f9d", fontSize: "0.85rem", margin: 0 }}>by {item.creator.display_name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto 80px",
          padding: "60px 40px",
          background: "linear-gradient(135deg, rgba(240,51,168,0.08) 0%, rgba(63,224,208,0.05) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "24px",
        }}
      >
        <div style={{ maxWidth: "580px" }}>
          <div style={{ color: "#f033a8", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", marginBottom: "8px" }}>
            BUILT FOR CREATORS
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 12px" }}>Your audience. Your rules.</h2>
          <p style={{ color: "#8a8f9d", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
            Subscriptions, premium drops, private messages, and transparent earnings — designed directly around the people making the work.
          </p>
        </div>
        <Link
          href="/creators/apply"
          style={{
            background: "linear-gradient(135deg, #3fe0d0 0%, #1ba396 100%)",
            color: "#07080d",
            padding: "16px 32px",
            borderRadius: "100px",
            textDecoration: "none",
            fontWeight: 800,
            fontSize: "1rem",
            boxShadow: "0 8px 30px rgba(63,224,208,0.3)",
          }}
        >
          Get started ↗
        </Link>
      </section>

      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "32px 20px",
          textAlign: "center",
          color: "#6a7082",
          fontSize: "0.85rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <span>LOLLIPOP © 2026</span>
          <span>18+ • Verified adults only • Safety & privacy by design</span>
        </div>
      </footer>
    </div>
  );
}
