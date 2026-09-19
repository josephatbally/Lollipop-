import os

login_code = '''"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { API, readJson } from "../api-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch(API + "/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await readJson<{ access_token?: string; detail?: string }>(r);
      if (!r.ok || !data.access_token) {
        throw new Error(data.detail ?? "Sign in failed");
      }
      localStorage.setItem("lollipop_access_token", data.access_token);
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.href = next?.startsWith("/") ? next : "/account";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 10%, rgba(240,51,168,0.12) 0%, #07080d 65%)",
        color: "#f5f5f7",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "24px 20px 60px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <nav
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "60px",
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
              boxShadow: "0 0 12px rgba(240,51,168,0.5)",
            }}
          >
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#07080d" }} />
          </div>
          LOLLIPOP
        </Link>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link href="/discover" style={{ color: "#a0a5b5", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
            Discover
          </Link>
          <Link href="/creators" style={{ color: "#a0a5b5", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
            Creators
          </Link>
        </div>
      </nav>

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(18, 20, 29, 0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(240,51,168,0.06)",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: "0.72rem",
            letterSpacing: "0.15em",
            fontWeight: 700,
            color: "#f033a8",
            marginBottom: "12px",
            background: "rgba(240,51,168,0.1)",
            padding: "4px 10px",
            borderRadius: "100px",
          }}
        >
          WELCOME BACK
        </div>
        <h1 style={{ fontSize: "1.9rem", fontWeight: 800, margin: "0 0 8px", lineHeight: 1.2 }}>
          Enter your <span style={{ color: "#f033a8" }}>dimension.</span>
        </h1>
        <p style={{ color: "#8a8f9d", fontSize: "0.88rem", margin: "0 0 28px" }}>
          Access your private feeds, creator subscriptions, and drops.
        </p>

        {error && (
          <div
            style={{
              background: "rgba(255,75,75,0.12)",
              border: "1px solid rgba(255,75,75,0.3)",
              color: "#ff6b6b",
              borderRadius: "12px",
              padding: "12px 14px",
              fontSize: "0.85rem",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#8a8f9d", fontWeight: 600, marginBottom: "6px" }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(10, 12, 18, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
                padding: "14px 16px",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#8a8f9d", fontWeight: 600, marginBottom: "6px" }}>
              PASSWORD
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(10, 12, 18, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
                padding: "14px 16px",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "15px",
              borderRadius: "14px",
              background: busy ? "rgba(240,51,168,0.5)" : "linear-gradient(135deg, #f033a8 0%, #a82079 100%)",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: busy ? "not-allowed" : "pointer",
              boxShadow: "0 8px 24px rgba(240,51,168,0.35)",
            }}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.85rem", color: "#8a8f9d" }}>
          No account?{" "}
          <Link href="/register" style={{ color: "#3fe0d0", textDecoration: "none", fontWeight: 600 }}>
            Create one ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
'''

register_code = '''"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { API, readJson } from "../api-client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch(API + "/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await readJson<{ access_token?: string; detail?: string }>(r);
      if (!r.ok || !d.access_token) {
        throw new Error(d.detail ?? "Registration failed");
      }
      localStorage.setItem("lollipop_access_token", d.access_token);
      window.location.href = "/account";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 10%, rgba(63,224,208,0.12) 0%, #07080d 65%)",
        color: "#f5f5f7",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "24px 20px 60px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <nav
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "60px",
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
              boxShadow: "0 0 12px rgba(63,224,208,0.5)",
            }}
          >
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#07080d" }} />
          </div>
          LOLLIPOP
        </Link>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link href="/discover" style={{ color: "#a0a5b5", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
            Discover
          </Link>
          <Link href="/login" style={{ color: "#a0a5b5", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      </nav>

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(18, 20, 29, 0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(63,224,208,0.06)",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: "0.72rem",
            letterSpacing: "0.15em",
            fontWeight: 700,
            color: "#3fe0d0",
            marginBottom: "12px",
            background: "rgba(63,224,208,0.1)",
            padding: "4px 10px",
            borderRadius: "100px",
          }}
        >
          CREATE ACCOUNT
        </div>
        <h1 style={{ fontSize: "1.9rem", fontWeight: 800, margin: "0 0 8px", lineHeight: 1.2 }}>
          Start your <span style={{ color: "#3fe0d0" }}>journey.</span>
        </h1>
        <p style={{ color: "#8a8f9d", fontSize: "0.88rem", margin: "0 0 28px" }}>
          Join as a collector or become a verified creator.
        </p>

        {error && (
          <div
            style={{
              background: "rgba(255,75,75,0.12)",
              border: "1px solid rgba(255,75,75,0.3)",
              color: "#ff6b6b",
              borderRadius: "12px",
              padding: "12px 14px",
              fontSize: "0.85rem",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#8a8f9d", fontWeight: 600, marginBottom: "6px" }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(10, 12, 18, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
                padding: "14px 16px",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#8a8f9d", fontWeight: 600, marginBottom: "6px" }}>
              PASSWORD (8+ CHARACTERS)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(10, 12, 18, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
                padding: "14px 16px",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "15px",
              borderRadius: "14px",
              background: busy ? "rgba(63,224,208,0.5)" : "linear-gradient(135deg, #3fe0d0 0%, #1ba396 100%)",
              color: "#07080d",
              border: "none",
              fontWeight: 800,
              fontSize: "1rem",
              cursor: busy ? "not-allowed" : "pointer",
              boxShadow: "0 8px 24px rgba(63,224,208,0.3)",
            }}
          >
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.85rem", color: "#8a8f9d" }}>
          Already registered?{" "}
          <Link href="/login" style={{ color: "#f033a8", textDecoration: "none", fontWeight: 600 }}>
            Sign in ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
'''

account_code = '''"use client";

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
'''

apply_code = '''"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { API, readJson } from "../../api-client";

type Application = {
  display_name: string;
  handle: string;
  bio: string | null;
  status: string;
  verification_status: string;
};

export default function CreatorApplyPage() {
  const [data, setData] = useState({ display_name: "", handle: "", bio: "" });
  const [status, setStatus] = useState("NOT_STARTED");
  const [verification, setVerification] = useState("NOT_STARTED");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("lollipop_access_token");
    if (!token) {
      window.location.href = "/login?next=/creators/apply";
      return;
    }

    fetch(API + "/api/v1/auth/creator-application", {
      headers: { Authorization: "Bearer " + token },
    })
      .then(async response => {
        if (response.status === 404) return;
        const application = await readJson<Application>(response);
        setData({
          display_name: application.display_name,
          handle: application.handle,
          bio: application.bio ?? "",
        });
        setStatus(application.status);
        setVerification(application.verification_status);
      })
      .catch(err => setMsg(err instanceof Error ? err.message : "Could not load your application."));
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    const token = localStorage.getItem("lollipop_access_token");
    if (!token) {
      window.location.href = "/login?next=/creators/apply";
      return;
    }

    setBusy(true);
    setMsg("");
    try {
      const application = await readJson<Application>(
        await fetch(API + "/api/v1/auth/creator-application", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(data),
        }),
      );
      setStatus(application.status);
      setVerification(application.verification_status);
      setMsg("Application saved successfully.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not save your application.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    const token = localStorage.getItem("lollipop_access_token");
    if (!token) {
      window.location.href = "/login?next=/creators/apply";
      return;
    }

    setBusy(true);
    setMsg("");
    try {
      const application = await readJson<Application>(
        await fetch(API + "/api/v1/auth/creator-application/submit", {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
        }),
      );
      setStatus(application.status);
      setVerification(application.verification_status);
      setMsg("Application submitted for verification.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not submit your application.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 10%, rgba(63,224,208,0.1) 0%, #07080d 65%)",
        color: "#f5f5f7",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "24px 20px 80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <nav
        style={{
          width: "100%",
          maxWidth: "1000px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
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
          <Link href="/account" style={{ color: "#a0a5b5", textDecoration: "none", fontSize: "0.9rem" }}>
            Account
          </Link>
        </div>
      </nav>

      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "rgba(18, 20, 29, 0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <span
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.15em",
              fontWeight: 700,
              color: "#3fe0d0",
              background: "rgba(63,224,208,0.1)",
              padding: "4px 10px",
              borderRadius: "100px",
            }}
          >
            CREATOR APPLICATION
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: status === "SUBMITTED" ? "#3fe0d0" : "#a0a5b5",
            }}
          >
            Status: {status}
          </span>
        </div>

        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 8px" }}>
          Build your <span style={{ color: "#3fe0d0" }}>dimension.</span>
        </h1>
        <p style={{ color: "#8a8f9d", fontSize: "0.9rem", margin: "0 0 28px" }}>
          Complete your public identity, then submit your verification request for moderation.
        </p>

        {msg && (
          <div
            style={{
              background: "rgba(63,224,208,0.12)",
              border: "1px solid rgba(63,224,208,0.3)",
              color: "#3fe0d0",
              borderRadius: "12px",
              padding: "12px 14px",
              fontSize: "0.85rem",
              marginBottom: "20px",
            }}
          >
            {msg}
          </div>
        )}

        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#8a8f9d", fontWeight: 600, marginBottom: "6px" }}>
              DISPLAY NAME
            </label>
            <input
              type="text"
              placeholder="e.g. Elena Rostova"
              value={data.display_name}
              onChange={e => setData({ ...data, display_name: e.target.value })}
              required
              disabled={status === "SUBMITTED"}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(10, 12, 18, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
                padding: "14px 16px",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#8a8f9d", fontWeight: 600, marginBottom: "6px" }}>
              CREATOR HANDLE
            </label>
            <input
              type="text"
              placeholder="e.g. elena_r"
              value={data.handle}
              onChange={e => setData({ ...data, handle: e.target.value })}
              required
              disabled={status === "SUBMITTED"}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(10, 12, 18, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
                padding: "14px 16px",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#8a8f9d", fontWeight: 600, marginBottom: "6px" }}>
              CREATOR BIO & VISION
            </label>
            <textarea
              placeholder="Tell collectors about your style, art, and exclusive media drops..."
              value={data.bio}
              onChange={e => setData({ ...data, bio: e.target.value })}
              rows={4}
              disabled={status === "SUBMITTED"}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(10, 12, 18, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
                padding: "14px 16px",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={busy || status === "SUBMITTED"}
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "15px",
              borderRadius: "14px",
              background: status === "SUBMITTED" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.12)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.15)",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: status === "SUBMITTED" ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Saving…" : "Save Draft"}
          </button>
        </form>

        {status !== "SUBMITTED" && (
          <button
            onClick={submit}
            disabled={busy || !data.display_name || !data.handle}
            style={{
              marginTop: "12px",
              width: "100%",
              padding: "15px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #3fe0d0 0%, #1ba396 100%)",
              color: "#07080d",
              border: "none",
              fontWeight: 800,
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(63,224,208,0.3)",
            }}
          >
            Submit for Verification
          </button>
        )}
      </div>
    </div>
  );
}
'''

home_code = '''"use client";

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
        const creatorList = Array.isArray(creators) ? creators as Creator[] : Array.isArray(creators?.value) ? creators.value as Creator[] : [];
        const results = await Promise.all(
          creatorList.map(async creator => {
            const response = await fetch(API + "/api/v1/creators/" + creator.id + "/media");
            const data = await readJson(response);
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
'''

files = {
    "apps/web/app/login/page.tsx": login_code,
    "apps/web/app/register/page.tsx": register_code,
    "apps/web/app/account/page.tsx": account_code,
    "apps/web/app/creators/apply/page.tsx": apply_code,
    "apps/web/app/page.tsx": home_code,
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Applied style to {path}")

print("All remaining pages updated successfully.")
