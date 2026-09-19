"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API, readJson } from "../../api-client";

type Application = {
  id: number;
  user_id: number;
  email: string;
  display_name: string;
  handle: string;
  bio?: string | null;
  status: string;
  verification_status: string;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  review_reason?: string | null;
};

export default function AdminVerificationsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  async function load() {
    const token = localStorage.getItem("lollipop_access_token");
    if (!token) {
      location.href = "/login?next=/admin/verifications";
      return;
    }
    try {
      const response = await fetch(API + "/api/v1/admin/creator-applications", {
        headers: { Authorization: "Bearer " + token },
      });
      if (response.status === 401) {
        localStorage.removeItem("lollipop_access_token");
        location.href = "/login?next=/admin/verifications";
        return;
      }
      if (response.status === 403) {
        setError("Administrator access required to view the verification queue.");
        return;
      }
      const data = await readJson<Application[]>(response);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load verification queue.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function review(id: number, action: "approve" | "reject") {
    const token = localStorage.getItem("lollipop_access_token");
    if (!token) return;
    const reason =
      action === "reject"
        ? window.prompt("Rejection reason (required):")
        : window.prompt("Review note (optional):");

    if (action === "reject" && !reason) return;

    setBusy(id);
    setError("");

    try {
      const response = await fetch(API + `/api/v1/admin/creator-applications/${id}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ reason: reason || null }),
      });
      await readJson(response);
      setItems((current: Application[]) => current.filter((x: Application) => x.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review action failed.");
    } finally {
      setBusy(null);
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
      {/* Navigation Bar */}
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
            href="/admin/verifications"
            style={{
              padding: "7px 14px",
              borderRadius: "999px",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#3fe0d0",
              textDecoration: "none",
              background: "rgba(63, 224, 208, 0.12)",
              border: "1px solid rgba(63, 224, 208, 0.35)",
            }}
          >
            Verifications
          </Link>
          <Link
            href="/admin/moderation"
            style={{
              padding: "7px 14px",
              borderRadius: "999px",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.65)",
              textDecoration: "none",
            }}
          >
            Media
          </Link>
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

      {/* Main Content */}
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px 80px" }}>
        <header style={{ marginBottom: 36 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 14px",
              borderRadius: 999,
              background: "rgba(240, 51, 168, 0.12)",
              border: "1px solid rgba(240, 51, 168, 0.3)",
              fontSize: "0.75rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "#f033a8",
              marginBottom: 16,
            }}
          >
            ADMIN · VERIFICATION
          </div>
          <h1
            style={{
              fontSize: "2.6rem",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Creator{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #f033a8 0%, #3fe0d0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Queue
            </span>
          </h1>
          <p style={{ margin: "12px 0 0", color: "rgba(255, 255, 255, 0.6)", fontSize: "0.95rem" }}>
            Review submitted creator applications. Approving an application assigns the CREATOR role and unlocks Creator Studio.
          </p>
        </header>

        {error && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 14,
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
              fontSize: "0.9rem",
              marginBottom: 28,
            }}
          >
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div
            style={{
              padding: "56px 24px",
              textAlign: "center",
              background: "rgba(18, 22, 34, 0.7)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 24,
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
                marginBottom: 12,
              }}
            >
              QUEUE CLEAR
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0, color: "rgba(255, 255, 255, 0.9)" }}>
              No pending creator applications.
            </h2>
            <p style={{ margin: "8px 0 0", color: "rgba(255, 255, 255, 0.5)", fontSize: "0.9rem" }}>
              New creator applications will appear here in real-time.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {items.map((item: Application) => (
              <article
                key={item.id}
                style={{
                  background: "rgba(18, 22, 34, 0.75)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 20,
                  padding: "24px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  transition: "border-color 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        color: "#3fe0d0",
                      }}
                    >
                      APPLICATION #{item.id}
                    </span>
                    <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "4px 0 2px" }}>
                      {item.display_name}
                    </h2>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.55)" }}>
                      @{item.handle} · {item.email}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: "5px 12px",
                      borderRadius: 999,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      background:
                        item.verification_status === "APPROVED"
                          ? "rgba(16, 185, 129, 0.15)"
                          : item.verification_status === "REJECTED"
                          ? "rgba(239, 68, 68, 0.15)"
                          : "rgba(240, 51, 168, 0.15)",
                      color:
                        item.verification_status === "APPROVED"
                          ? "#34d399"
                          : item.verification_status === "REJECTED"
                          ? "#fca5a5"
                          : "#f033a8",
                      border:
                        item.verification_status === "APPROVED"
                          ? "1px solid rgba(16, 185, 129, 0.3)"
                          : item.verification_status === "REJECTED"
                          ? "1px solid rgba(239, 68, 68, 0.3)"
                          : "1px solid rgba(240, 51, 168, 0.3)",
                    }}
                  >
                    {item.verification_status || item.status}
                  </span>
                </div>

                {item.bio && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      fontSize: "0.9rem",
                      color: "rgba(255, 255, 255, 0.8)",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.bio}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                    paddingTop: 8,
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.45)" }}>
                    Submitted {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : "—"}
                  </span>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      disabled={busy === item.id}
                      onClick={() => review(item.id, "approve")}
                      style={{
                        padding: "8px 18px",
                        borderRadius: 999,
                        border: "none",
                        background: "linear-gradient(135deg, #10b981 0%, #3fe0d0 100%)",
                        color: "#051310",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: busy === item.id ? "not-allowed" : "pointer",
                        opacity: busy === item.id ? 0.6 : 1,
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy === item.id}
                      onClick={() => review(item.id, "reject")}
                      style={{
                        padding: "8px 18px",
                        borderRadius: 999,
                        border: "1px solid rgba(239, 68, 68, 0.4)",
                        background: "rgba(239, 68, 68, 0.12)",
                        color: "#fca5a5",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: busy === item.id ? "not-allowed" : "pointer",
                        opacity: busy === item.id ? 0.6 : 1,
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
