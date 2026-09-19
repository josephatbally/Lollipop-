"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API, readJson } from "../api-client";

type User = { id: number; email: string; role: string; status: string };

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("lollipop_access_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetch(API + "/api/v1/auth/me", { headers: { Authorization: "Bearer " + token } })
      .then(async r => {
        if (!r.ok) throw new Error("Session expired");
        setUser(await readJson<User>(r));
      })
      .catch(() => {
        localStorage.removeItem("lollipop_access_token");
        setError("Your session has expired.");
        window.location.href = "/login";
      });
  }, []);

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#07080d",
          color: "#f5f5f7",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#f033a8", fontSize: "0.85rem", letterSpacing: "0.2em", marginBottom: "8px" }}>ACCOUNT</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{error ? error : "Loading session…"}</h2>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 10%, rgba(240,51,168,0.08) 0%, #07080d 65%)",
        color: "#f5f5f7",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "24px 20px 80px",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 0 40px",
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
              fontSize: "1.15rem",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f033a8, #3fe0d0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#07080d" }} />
            </div>
            LOLLIPOP
          </Link>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <Link href="/discover" style={{ color: "#a0a5b5", textDecoration: "none", fontSize: "0.9rem" }}>
              Discover
            </Link>
            <Link href="/creators" style={{ color: "#a0a5b5", textDecoration: "none", fontSize: "0.9rem" }}>
              Creators
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("lollipop_access_token");
                window.location.href = "/login";
              }}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#ff6b6b",
                padding: "8px 16px",
                borderRadius: "100px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </div>
        </nav>

        <div
          style={{
            background: "linear-gradient(180deg, rgba(20,24,35,0.8) 0%, rgba(13,15,22,0.95) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            padding: "36px",
            marginBottom: "32px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #f033a8, #3fe0d0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "#fff",
              }}
            >
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <div
                style={{
                  display: "inline-block",
                  fontSize: "0.7rem",
                  letterSpacing: "0.15em",
                  fontWeight: 700,
                  color: "#3fe0d0",
                  background: "rgba(63,224,208,0.1)",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  marginBottom: "6px",
                }}
              >
                {user.role} · {user.status}
              </div>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 4px" }}>{user.email}</h1>
              <p style={{ color: "#8a8f9d", fontSize: "0.85rem", margin: 0 }}>User ID: #{user.id}</p>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 16px" }}>Workspaces & Controls</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {user.role === "CREATOR" && (
            <Link
              href="/creators/studio"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textDecoration: "none",
                background: "rgba(18,20,29,0.7)",
                border: "1px solid rgba(240,51,168,0.25)",
                borderRadius: "18px",
                padding: "24px 28px",
                color: "#fff",
              }}
            >
              <div>
                <div style={{ color: "#f033a8", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "4px" }}>
                  CREATOR STUDIO
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "4px" }}>Media & Publishing Hub</div>
                <div style={{ color: "#8a8f9d", fontSize: "0.85rem" }}>Upload drops, monitor moderation and publish approved media.</div>
              </div>
              <div style={{ fontSize: "1.5rem", color: "#f033a8" }}>→</div>
            </Link>
          )}

          {user.role !== "CREATOR" && user.role !== "ADMIN" && (
            <Link
              href="/creators/apply"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textDecoration: "none",
                background: "rgba(18,20,29,0.7)",
                border: "1px solid rgba(63,224,208,0.25)",
                borderRadius: "18px",
                padding: "24px 28px",
                color: "#fff",
              }}
            >
              <div>
                <div style={{ color: "#3fe0d0", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "4px" }}>
                  CREATOR ONBOARDING
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "4px" }}>Apply for Creator Verification</div>
                <div style={{ color: "#8a8f9d", fontSize: "0.85rem" }}>Set up your creator profile and start monetizing your content.</div>
              </div>
              <div style={{ fontSize: "1.5rem", color: "#3fe0d0" }}>→</div>
            </Link>
          )}

          {user.role === "ADMIN" && (
            <>
              <Link
                href="/admin/verifications"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textDecoration: "none",
                  background: "rgba(18,20,29,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "18px",
                  padding: "24px 28px",
                  color: "#fff",
                }}
              >
                <div>
                  <div style={{ color: "#a855f7", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "4px" }}>
                    ADMINISTRATION
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "4px" }}>Creator Verification Queue</div>
                  <div style={{ color: "#8a8f9d", fontSize: "0.85rem" }}>Review applications, approve creators, or request info.</div>
                </div>
                <div style={{ fontSize: "1.5rem", color: "#a855f7" }}>→</div>
              </Link>

              <Link
                href="/admin/moderation"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textDecoration: "none",
                  background: "rgba(18,20,29,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "18px",
                  padding: "24px 28px",
                  color: "#fff",
                }}
              >
                <div>
                  <div style={{ color: "#f033a8", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "4px" }}>
                    ADMINISTRATION
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "4px" }}>Media Moderation Queue</div>
                  <div style={{ color: "#8a8f9d", fontSize: "0.85rem" }}>Inspect consent records, verify content, and approve for live release.</div>
                </div>
                <div style={{ fontSize: "1.5rem", color: "#f033a8" }}>→</div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
