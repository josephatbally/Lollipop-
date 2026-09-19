"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API, readJson } from "../../api-client";

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
  const [activeTab, setActiveTab] = useState<"all" | "free" | "subscribers">("all");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      fetch(API + "/api/v1/creators/" + params.id).then(async (r) => {
        const d = await readJson(r);
        if (!r.ok) throw new Error(d.detail ?? "Creator not found.");
        return d;
      }),
      fetch(API + "/api/v1/creators/" + params.id + "/media").then(async (r) => {
        const d = await readJson(r);
        if (!r.ok) throw new Error(d.detail ?? "Could not load media.");
        return d;
      }),
    ])
      .then(([creatorData, mediaData]) => {
        setCreator(creatorData);
        setMedia(mediaData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load creator."))
      .finally(() => setLoading(false));
  }, [params.id]);

  const filteredMedia = media.filter((item) => {
    const level = item.access_level.toLowerCase();
    if (activeTab === "free") return level === "public" || level === "free";
    if (activeTab === "subscribers") return level !== "public" && level !== "free";
    return true;
  });

  const followersCount = (creator?.followers_count ?? 1420) + (isFollowing ? 1 : 0);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#090a12", color: "#f5f6ff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: "3px solid rgba(240, 51, 168, 0.2)", borderTopColor: "#f033a8", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#949cb8", fontSize: 14, letterSpacing: "0.1em" }}>LOADING PROFILE...</p>
        </div>
      </main>
    );
  }

  if (error || !creator) {
    return (
      <main style={{ minHeight: "100vh", padding: "40px 20px", background: "#090a12", color: "#f5f6ff", maxWidth: 1080, margin: "0 auto" }}>
        <Link href="/creators" style={{ color: "#3fe0d0", textDecoration: "none", fontSize: 14 }}>&larr; Back to Creators</Link>
        <p style={{ color: "#ff5f9e", marginTop: 30, fontSize: 16 }}>{error || "Creator not found."}</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#090a12", color: "#f5f6ff", paddingBottom: 100 }}>
      {/* Top Banner */}
      <div style={{
        height: 260,
        background: "radial-gradient(circle at 75% 30%, rgba(240, 51, 168, 0.35), transparent 45%), radial-gradient(circle at 20% 80%, rgba(63, 224, 208, 0.2), transparent 40%), linear-gradient(180deg, #18112d 0%, #090a12 100%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        position: "relative"
      }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "24px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/creators" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 9999, background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#f5f6ff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
            &larr; Creators
          </Link>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/discover" style={{ padding: "8px 16px", borderRadius: 9999, background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#949cb8", textDecoration: "none", fontSize: 13 }}>Discover</Link>
            <Link href="/account" style={{ padding: "8px 16px", borderRadius: 9999, background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#949cb8", textDecoration: "none", fontSize: 13 }}>Account</Link>
          </div>
        </div>
      </div>

      {/* Profile Header Shell */}
      <div style={{ maxWidth: 1140, margin: "-70px auto 0", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          {/* Avatar & Identifiers */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 22, flexWrap: "wrap" }}>
            <div style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1a1630, #0d1222)",
              border: "3px solid #f033a8",
              boxShadow: "0 0 24px rgba(240, 51, 168, 0.45)",
              display: "grid",
              placeItems: "center",
              fontSize: 42,
              fontWeight: 800,
              color: "#f5f6ff"
            }}>
              {creator.display_name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}>{creator.display_name}</h1>
                <span style={{ background: "#3fe0d0", color: "#090a12", width: 20, height: 20, borderRadius: "50%", display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 900 }}>✓</span>
              </div>
              <p style={{ margin: "4px 0 0", color: "#949cb8", fontSize: 15 }}>@{creator.handle}</p>
            </div>
          </div>

          {/* Follow Button */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setIsFollowing((prev) => !prev)}
              style={{
                background: isFollowing ? "rgba(63, 224, 208, 0.15)" : "linear-gradient(135deg, #f033a8, #c41885)",
                color: isFollowing ? "#3fe0d0" : "#ffffff",
                border: isFollowing ? "1px solid #3fe0d0" : "none",
                borderRadius: 9999,
                padding: "12px 26px",
                fontSize: 14,
                fontWeight: 700,
                boxShadow: isFollowing ? "none" : "0 0 20px rgba(240, 51, 168, 0.45)",
                cursor: "pointer"
              }}
            >
              {isFollowing ? "Following ✓" : "+ Follow"}
            </button>
          </div>
        </div>

        {/* Bio */}
        {creator.bio && (
          <p style={{ maxWidth: 680, color: "#d1d5e5", fontSize: 16, lineHeight: 1.6, margin: "24px 0 0" }}>
            {creator.bio}
          </p>
        )}

        {/* Stats Strip */}
        <div style={{ display: "flex", gap: 32, margin: "24px 0 36px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: 24, flexWrap: "wrap" }}>
          <div>
            <span style={{ display: "block", fontSize: 20, fontWeight: 800 }}>{followersCount.toLocaleString()}</span>
            <span style={{ fontSize: 12, color: "#949cb8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Followers</span>
          </div>
          <div>
            <span style={{ display: "block", fontSize: 20, fontWeight: 800 }}>{media.length}</span>
            <span style={{ fontSize: 12, color: "#949cb8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Experiences</span>
          </div>
          {creator.subscription_plan && (
            <div>
              <span style={{ display: "block", fontSize: 20, fontWeight: 800, color: "#f033a8" }}>
                {creator.subscription_plan.currency} ${(creator.subscription_plan.price_cents / 100).toFixed(2)}
              </span>
              <span style={{ fontSize: 12, color: "#949cb8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Monthly Pass</span>
            </div>
          )}
        </div>

        {/* Subscription Pass Card */}
        {creator.subscription_plan && (
          <div style={{
            background: "linear-gradient(135deg, rgba(240, 51, 168, 0.12), rgba(63, 224, 208, 0.05))",
            border: "1px solid rgba(240, 51, 168, 0.35)",
            borderRadius: 20,
            padding: 24,
            marginBottom: 40,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20
          }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#f033a8", letterSpacing: "0.12em", textTransform: "uppercase" }}>CREATOR PASS</span>
              <h3 style={{ margin: "6px 0 4px", fontSize: 20, fontWeight: 800 }}>Unlock All Exclusive Experiences</h3>
              <p style={{ margin: 0, color: "#949cb8", fontSize: 14 }}>Full HD streaming, private drops, and subscriber chat access.</p>
            </div>
            <button style={{
              background: "linear-gradient(135deg, #f033a8, #c41885)",
              color: "#ffffff",
              border: "none",
              borderRadius: 9999,
              padding: "14px 28px",
              fontSize: 14,
              fontWeight: 700,
              boxShadow: "0 0 20px rgba(240, 51, 168, 0.45)",
              cursor: "pointer"
            }}>
              Subscribe for ${(creator.subscription_plan.price_cents / 100).toFixed(2)}/mo
            </button>
          </div>
        )}

        {/* Media Navigation Tabs */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          {(
            [
              { id: "all", label: `All (${media.length})` },
              { id: "free", label: "Free Previews" },
              { id: "subscribers", label: "Subscribers Only" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "9px 20px",
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: activeTab === t.id ? "1px solid #f033a8" : "1px solid rgba(255, 255, 255, 0.08)",
                background: activeTab === t.id ? "rgba(240, 51, 168, 0.15)" : "rgba(255, 255, 255, 0.03)",
                color: activeTab === t.id ? "#ffffff" : "#949cb8",
                boxShadow: activeTab === t.id ? "0 0 14px rgba(240, 51, 168, 0.35)" : "none"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed rgba(255, 255, 255, 0.1)", borderRadius: 20, color: "#949cb8" }}>
            <p style={{ fontSize: 16 }}>No experiences found in this category.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {filteredMedia.map((item) => {
              const level = item.access_level.toLowerCase();
              const isLocked = level !== "public" && level !== "free";
              return (
                <article
                  key={item.id}
                  style={{
                    background: "rgba(17, 20, 36, 0.75)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 18,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <div style={{
                    height: 200,
                    background: "radial-gradient(circle at 60% 40%, rgba(240, 51, 168, 0.25), transparent 40%), linear-gradient(135deg, #18112d, #0b0f1a)",
                    position: "relative",
                    display: "grid",
                    placeItems: "center"
                  }}>
                    <div style={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      background: "rgba(0, 0, 0, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(8px)",
                      display: "grid",
                      placeItems: "center",
                      color: "#f5f6ff",
                      fontSize: 18
                    }}>
                      {isLocked ? "🔒" : "▶"}
                    </div>
                    <span style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: isLocked ? "rgba(240, 51, 168, 0.85)" : "rgba(63, 224, 208, 0.85)",
                      color: isLocked ? "#ffffff" : "#090a12",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: 9999,
                      letterSpacing: "0.08em" }}>
                      {item.access_level}
                    </span>
                  </div>
                  <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700 }}>{item.title}</h3>
                      {item.description && (
                        <span style={{ margin: "0 0 12px", color: "#949cb8", fontSize: 13, lineHeight: 1.5 }}>
                          {item.description}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                      <span style={{ fontSize: 12, color: "#949cb8" }}>{item.content_type}</span>
                      <Link
                        href={`/media/${item.id}`}
                        style={{
                          background: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: 9999,
                          padding: "7px 16px",
                          color: "#f5f6ff",
                          textDecoration: "none",
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      >
                        {isLocked ? "Unlock" : "Play →"}

                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
