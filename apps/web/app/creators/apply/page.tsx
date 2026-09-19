"use client";

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
