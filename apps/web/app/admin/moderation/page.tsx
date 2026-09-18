"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { API, readJson } from "../../api-client";

type MediaItem = {
  id: number;
  creator_id: number;
  creator_email: string;
  title: string;
  description?: string | null;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  checksum_sha256: string;
  status: string;
  consent_records: number;
  moderation_reason?: string | null;
  created_at: string;
  reviewed_at?: string | null;
};

export default function AdminModerationPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  async function load() {
    const token = localStorage.getItem("lollipop_access_token");
    if (!token) {
      location.href = "/login";
      return;
    }
    const response = await fetch(API + "/api/v1/admin/media", {
      headers: { Authorization: "Bearer " + token },
    });
    if (response.status === 401) {
      localStorage.removeItem("lollipop_access_token");
      location.href = "/login";
      return;
    }
    if (response.status === 403) {
      setError("Administrator access required.");
      return;
    }
    try {
      const data = await readJson<MediaItem[]>(response);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load moderation queue.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function review(id: number, action: "approve" | "reject") {
    const token = localStorage.getItem("lollipop_access_token");
    if (!token) return;
    const reason =
      action === "reject"
        ? window.prompt("Rejection reason (required):")
        : window.prompt("Moderation note (optional):");

    if (action === "reject" && !reason) return;

    setBusy(id);
    setError("");

    const response = await fetch(API + `/api/v1/media/${id}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(action === "reject" ? { reason } : {}),
    });

    try {
      await readJson(response);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Moderation action failed.");
    } finally {
      setBusy(null);
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <main className="shell page">
      <nav className="nav">
        <Link className="brand" href="/"><img src="/icons/lollipop.svg" alt="" /><span>LOLLIPOP</span></Link>
        <div className="nav-links">
          <a href="/account">Account</a>
          <a href="/admin/verifications">Verification</a>
        </div>
      </nav>

      <header className="page-header">
        <p className="eyebrow">ADMIN · MODERATION</p>
        <h1>Media<br /><span>queue.</span></h1>
        <p>
          Review creator media submitted for publication. Consent is recorded
          server-side; participant identity details are not exposed in this queue.
        </p>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="admin-queue">
        {items.length === 0 ? (
          <div className="auth-card">
            <p className="eyebrow">QUEUE CLEAR</p>
            <h2>No media awaiting review.</h2>
          </div>
        ) : (
          items.map((item) => (
            <article className="admin-card" key={item.id}>
              <div className="admin-card-head">
                <div>
                  <p className="eyebrow">MEDIA #{item.id}</p>
                  <h2>{item.title}</h2>
                  <p>{item.creator_email}</p>
                </div>
                <strong>{item.status}</strong>
              </div>

              {item.description && <p className="admin-bio">{item.description}</p>}

              <div className="admin-meta-grid">
                <div><span>FILE</span><b>{item.original_filename}</b></div>
                <div><span>TYPE</span><b>{item.content_type}</b></div>
                <div><span>SIZE</span><b>{formatSize(item.size_bytes)}</b></div>
                <div><span>CONSENT</span><b>{item.consent_records} record{item.consent_records === 1 ? "" : "s"}</b></div>
              </div>

              <p className="admin-date">
                Submitted {new Date(item.created_at).toLocaleString()}
              </p>

              <div className="admin-actions">
                <button className="primary-button" disabled={busy === item.id} onClick={() => review(item.id, "approve")}>
                  Approve
                </button>
                <button className="secondary-button" disabled={busy === item.id} onClick={() => review(item.id, "reject")}>
                  Reject
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
