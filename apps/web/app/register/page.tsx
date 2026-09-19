"use client";

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
