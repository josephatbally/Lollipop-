"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { API, readJson } from "../api-client";

export default function LoginPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const r = await fetch(API + "/api/v1/auth/login", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,password})});
      const data = await readJson(r); if (!r.ok) throw new Error(data.detail ?? "Sign in failed");
      localStorage.setItem("lollipop_access_token", data.access_token); const next = new URLSearchParams(window.location.search).get("next"); window.location.href = next?.startsWith("/") ? next : "/account";
    } catch (err) { setError(err instanceof Error ? err.message : "Sign in failed"); } finally { setBusy(false); }
  }
  return <main className="shell page"><nav className="nav"><Link className="brand" href="/" aria-label="Lollipop home"><img src="/icons/lollipop.svg" alt="" /><span>LOLLIPOP</span></Link><div className="nav-links"><a href="/discover">Discover</a><a href="/creators">Creators</a></div></nav><section className="auth-card"><p className="eyebrow">WELCOME BACK</p><h1>Enter your <span>dimension.</span></h1><form onSubmit={submit}><input aria-label="Email" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/><input aria-label="Password" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8}/>{error && <p className="error">{error}</p>}<button className="primary-button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form><p className="auth-switch">No account? <Link href="/register">Create one</Link></p></section></main>;
}
