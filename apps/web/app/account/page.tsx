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
      location.href = "/login";
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
        location.href = "/login";
      });
  }, []);

  if (!user) {
    return <main className="shell page"><header className="page-header"><p className="eyebrow">ACCOUNT</p><h1>Loading<span>…</span></h1><p>{error}</p></header></main>;
  }

  return (
    <main className="shell page">
      <nav className="nav">
        <Link className="brand" href="/" aria-label="Lollipop home"><img src="/icons/lollipop.svg" alt="" /><span>LOLLIPOP</span></Link>
        <div className="nav-links"><Link href="/discover">Discover</Link><Link href="/creators">Creators</Link></div>
        <button className="ghost-button" onClick={() => { localStorage.removeItem("lollipop_access_token"); location.href = "/login"; }}>Sign out</button>
      </nav>

      <header className="page-header">
        <p className="eyebrow">AUTHENTICATED ACCOUNT</p>
        <h1>Your <span>space.</span></h1>
        <p>{user.email}</p>
      </header>

      <section className="account-list">
        <div className="account-row"><div><p className="eyebrow">ACCOUNT STATUS</p><span>{user.status} · {user.role}</span></div></div>

        {user.role === "CREATOR" && (
          <div className="account-row">
            <div><p className="eyebrow">CREATOR STUDIO</p><span>Upload, monitor moderation and publish approved media.</span></div>
            <Link href="/creators/studio">›</Link>
          </div>
        )}

        {user.role !== "CREATOR" && user.role !== "ADMIN" && (
          <div className="account-row">
            <div><p className="eyebrow">CREATOR WORKSPACE</p><span>Apply, save your profile and track verification.</span></div>
            <Link href="/creators/apply">›</Link>
          </div>
        )}

        {user.role === "ADMIN" && (
          <>
            <div className="account-row"><div><p className="eyebrow">CREATOR VERIFICATION</p><span>Review creator applications.</span></div><Link href="/admin/verifications">›</Link></div>
            <div className="account-row"><div><p className="eyebrow">MEDIA MODERATION</p><span>Approve or reject uploaded creator media.</span></div><Link href="/admin/moderation">›</Link></div>
          </>
        )}
      </section>
    </main>
  );
}
