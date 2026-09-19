"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API, readJson } from "../../api-client";
import MediaPlayer from "./MediaPlayer";

type Media = {
  id: number;
  creator_id: number;
  title: string;
  description?: string | null;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  status: string;
  access_level: string;
};

export default function MediaPage() {
  const params = useParams<{ id: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;

    async function load() {
      const token = localStorage.getItem("lollipop_access_token");
      if (!token) {
        setError("Sign in to access this premium experience.");
        setLoading(false);
        return;
      }

      try {
        const metadataResponse = await fetch(API + "/api/v1/media/" + params.id, {
          headers: { Authorization: "Bearer " + token },
        });
        const metadata = await readJson<Media>(metadataResponse);
        if (cancelled) return;
        setMedia(metadata);

        const streamResponse = await fetch(API + "/api/v1/media/" + params.id + "/stream", {
          headers: { Authorization: "Bearer " + token },
        });
        if (!streamResponse.ok) {
          throw new Error("Could not load the media stream.");
        }
        const blob = await streamResponse.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setStreamUrl(objectUrl);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load media.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (params.id) void load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [params.id]);

  async function download() {
    const token = localStorage.getItem("lollipop_access_token");
    if (!token || !media) return;
    setDownloading(true);
    try {
      const response = await fetch(API + "/api/v1/media/" + media.id + "/download", {
        headers: { Authorization: "Bearer " + token },
      });
      if (!response.ok) {
        const detail = await readJson<{ detail?: string }>(response).catch(() => null);
        throw new Error(detail?.detail ?? "Download failed.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = media.original_filename || media.title + ".mp4";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#07080c",
        backgroundImage: "radial-gradient(circle at 50% 0%, rgba(240, 51, 168, 0.08) 0%, transparent 60%)",
        color: "#ffffff",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 28px",
          background: "rgba(10, 12, 18, 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "#ffffff",
            fontWeight: 800,
            fontSize: "1.1rem",
            letterSpacing: "0.15em",
          }}
        >
          <img src="/icons/lollipop.svg" alt="" style={{ width: 28, height: 28 }} />
          <span
            style={{
              background: "linear-gradient(135deg, #f033a8 0%, #3fe0d0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            LOLLIPOP
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/discover"
            style={{
              padding: "7px 14px",
              borderRadius: "999px",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.65)",
              textDecoration: "none",
            }}
          >
            Discover
          </Link>
          <Link
            href="/creators"
            style={{
              padding: "7px 14px",
              borderRadius: "999px",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.65)",
              textDecoration: "none",
            }}
          >
            Creators
          </Link>
          <Link
            href="/account"
            style={{
              padding: "7px 14px",
              borderRadius: "999px",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.65)",
              textDecoration: "none",
            }}
          >
            Account
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "36px 24px 80px" }}>
        {loading ? (
          <div
            style={{
              padding: "80px 24px",
              textAlign: "center",
              background: "rgba(18, 22, 34, 0.7)",
              borderRadius: 24,
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "6px 14px",
                borderRadius: 999,
                background: "rgba(63, 224, 208, 0.12)",
                border: "1px solid rgba(63, 224, 208, 0.3)",
                color: "#3fe0d0",
                fontSize: "0.75rem",
                fontWeight: 800,
                letterSpacing: "0.1em",
                marginBottom: 14,
              }}
            >
              EXPERIENCE
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
              Loading stream
              <span
                style={{
                  background: "linear-gradient(135deg, #f033a8 0%, #3fe0d0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                …
              </span>
            </h1>
          </div>
        ) : error ? (
          <div
            style={{
              padding: "60px 28px",
              textAlign: "center",
              background: "rgba(18, 22, 34, 0.7)",
              borderRadius: 24,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              maxWidth: 540,
              margin: "40px auto",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "5px 14px",
                borderRadius: 999,
                background: "rgba(240, 51, 168, 0.12)",
                border: "1px solid rgba(240, 51, 168, 0.3)",
                color: "#f033a8",
                fontSize: "0.75rem",
                fontWeight: 800,
                letterSpacing: "0.1em",
                marginBottom: 16,
              }}
            >
              ACCESS RESTRICTED
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 16px" }}>{error}</h2>
            <Link
              href={"/login?next=/media/" + params.id}
              style={{
                display: "inline-block",
                padding: "10px 24px",
                borderRadius: 999,
                background: "linear-gradient(135deg, #f033a8 0%, #3fe0d0 100%)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              Sign In to Unlock
            </Link>
          </div>
        ) : media ? (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 14px",
                  borderRadius: 999,
                  background:
                    media.access_level.toUpperCase() === "PUBLIC" || media.access_level.toUpperCase() === "FREE"
                      ? "rgba(63, 224, 208, 0.12)"
                      : "rgba(240, 51, 168, 0.12)",
                  border:
                    media.access_level.toUpperCase() === "PUBLIC" || media.access_level.toUpperCase() === "FREE"
                      ? "1px solid rgba(63, 224, 208, 0.3)"
                      : "1px solid rgba(240, 51, 168, 0.3)",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color:
                    media.access_level.toUpperCase() === "PUBLIC" || media.access_level.toUpperCase() === "FREE"
                      ? "#3fe0d0"
                      : "#f033a8",
                  marginBottom: 14,
                  textTransform: "uppercase",
                }}
              >
                EXPERIENCE · {media.access_level}
              </div>

              <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                {media.title}
              </h1>

              {media.description && (
                <p style={{ margin: "0 0 16px", color: "rgba(255, 255, 255, 0.65)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                  {media.description}
                </p>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    fontSize: "0.75rem",
                    color: "rgba(255, 255, 255, 0.7)",
                    fontWeight: 600,
                  }}
                >
                  {media.content_type}
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    fontSize: "0.75rem",
                    color: "rgba(255, 255, 255, 0.7)",
                    fontWeight: 600,
                  }}
                >
                  {Math.max(1, Math.round(media.size_bytes / 1024))} KB
                </span>
              </div>
            </div>

            <div
              style={{
                borderRadius: 20,
                overflow: "hidden",
                background: "#020306",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
                marginBottom: 24,
              }}
            >
              {streamUrl ? (
                <MediaPlayer
                  src={streamUrl}
                  title={media.title}
                  contentType={media.content_type}
                  onDownload={download}
                  downloading={downloading}
                />
              ) : (
                <div style={{ padding: "60px 24px", textAlign: "center" }}>
                  <p style={{ color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>Preparing stream playback…</p>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                padding: "16px 20px",
                background: "rgba(18, 22, 34, 0.6)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderRadius: 16,
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <Link
                href={"/creators/" + media.creator_id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                ← Creator Profile
              </Link>

              <button
                type="button"
                onClick={download}
                disabled={downloading}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(63, 224, 208, 0.4)",
                  background: "rgba(63, 224, 208, 0.12)",
                  color: "#3fe0d0",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: downloading ? "not-allowed" : "pointer",
                  opacity: downloading ? 0.6 : 1,
                }}
              >
                {downloading ? "Preparing Download…" : "Download Media"}
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

