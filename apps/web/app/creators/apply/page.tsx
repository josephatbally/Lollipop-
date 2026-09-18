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
      setMsg("Application saved.");
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
    <main className="shell page">
      <nav className="nav">
        <Link className="brand" href="/" aria-label="Lollipop home">
          <img src="/icons/lollipop.svg" alt="" />
          <span>LOLLIPOP</span>
        </Link>
        <div className="nav-links">
          <Link href="/discover">Discover</Link>
          <Link href="/creators">Creators</Link>
          <Link href="/account">Account</Link>
        </div>
      </nav>

      <header className="page-header">
        <p className="eyebrow">CREATOR MODE</p>
        <h1>Build your<br /><span>dimension.</span></h1>
        <p>Complete your creator profile, then submit it for the verification workflow.</p>
      </header>

      <section className="auth-card">
        <p className="eyebrow">APPLICATION · {status}</p>
        <p>Verification: <strong>{verification}</strong></p>

        <form onSubmit={save}>
          <input
            placeholder="Display name"
            value={data.display_name}
            onChange={event => setData({ ...data, display_name: event.target.value })}
            required
          />
          <input
            placeholder="Handle (letters, numbers, underscore)"
            value={data.handle}
            onChange={event => setData({ ...data, handle: event.target.value })}
            required
          />
          <textarea
            placeholder="Bio"
            value={data.bio}
            onChange={event => setData({ ...data, bio: event.target.value })}
            rows={5}
          />
          <button className="primary-button" disabled={busy || status === "SUBMITTED"}>
            {busy ? "Saving…" : "Save application"}
          </button>
        </form>

        {status !== "SUBMITTED" && (
          <button className="secondary-button" onClick={submit} disabled={busy}>
            Submit for verification
          </button>
        )}

        {msg && <p className="auth-switch">{msg}</p>}
      </section>
    </main>
  );
}
