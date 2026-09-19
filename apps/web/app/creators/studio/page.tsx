"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { API, readJson } from "../../api-client";

type Media = {
  id: number;
  title: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  status: string;
  moderation_reason?: string | null;
  created_at: string;
};

export default function CreatorStudioPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [participant, setParticipant] = useState("creator-self");
  const [authorizationVersion, setAuthorizationVersion] = useState("v1");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const token = localStorage.getItem("lollipop_access_token");
    if (!token) {
      location.href = "/login?next=/creators/studio";
      return;
    }
    try {
      const response = await fetch(API + "/api/v1/media", { headers: { Authorization: "Bearer " + token } });
      const data = await readJson<Media[]>(response);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your media.");
    }
  }

  useEffect(() => { void load(); }, []);

  function upload(event: FormEvent) {
    event.preventDefault();
    const token = localStorage.getItem("lollipop_access_token");
    if (!token) { location.href = "/login?next=/creators/studio"; return; }
    if (!file) { setError("Choose a video file first."); return; }

    setBusy(true);
    setProgress(0);
    setError("");
    setMessage("");

    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("consent", JSON.stringify([{
      participant_reference: participant,
      authorization_version: authorizationVersion,
    }]));
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", API + "/api/v1/media/upload");
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = async () => {
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        if (xhr.status < 200 || xhr.status >= 300) throw new Error(data.detail ?? "Upload failed.");
        setMessage("Upload received and sent to moderation.");
        setTitle("");
        setDescription("");
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setBusy(false);
      }
    };
    xhr.onerror = () => { setError("Network error during upload."); setBusy(false); };
    xhr.send(form);
  }

  async function publish(id: number) {
    const token = localStorage.getItem("lollipop_access_token");
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(API + "/api/v1/media/" + id + "/publish", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
      await readJson(response);
      await load();
      setMessage("Media published.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish media.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell page">
      <nav className="nav">
        <Link className="brand" href="/"><img src="/icons/lollipop.svg" alt="" /><span>LOLLIPOP</span></Link>
        <div className="nav-links"><Link href="/account">Account</Link><Link href="/creators">Public profile</Link></div>
      </nav>

      <header className="page-header">
        <p className="eyebrow">CREATOR STUDIO</p>
        <h1>Publish your<br /><span>work.</span></h1>
        <p>Upload a video, record the required consent reference, wait for administrator review, then publish approved media.</p>
      </header>

      {error && <p className="error">{error}</p>}
      {message && <p className="studio-success">{message}</p>}

      <section className="studio-grid">
        <form className="auth-card studio-form" onSubmit={upload}>
          <p className="eyebrow">NEW MEDIA</p>
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={4000} />
          <input placeholder="Participant reference" value={participant} onChange={(e) => setParticipant(e.target.value)} required maxLength={255} />
          <input placeholder="Authorization version" value={authorizationVersion} onChange={(e) => setAuthorizationVersion(e.target.value)} required maxLength={100} />
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
          {file && <p className="studio-file">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</p>}
          {busy && <div className="upload-progress"><span style={{ width: progress + "%" }} /></div>}
          <button className="primary-button" disabled={busy}>{busy ? "Uploading " + progress + "%" : "Upload for review"}</button>
        </form>

        <section>
          <div className="section-heading"><div><p className="eyebrow">YOUR LIBRARY</p><h2>Media</h2></div></div>
          <div className="studio-list">
            {items.length === 0 ? <div className="auth-card"><p className="eyebrow">LIBRARY</p><h2>No uploads yet.</h2></div> : items.map(item => (
              <article className="studio-item" key={item.id}>
                <div>
                  <p className="eyebrow">MEDIA #{item.id}</p>
                  <h3>{item.title}</h3>
                  <p>{item.original_filename} · {(item.size_bytes / 1024 / 1024).toFixed(1)} MB</p>
                  {item.moderation_reason && <p className="error">{item.moderation_reason}</p>}
                </div>
                <div className="studio-item-actions">
                  <strong>{item.status}</strong>
                  {item.status === "APPROVED" && <button className="secondary-button" disabled={busy} onClick={() => void publish(item.id)}>Publish</button>}
                  {item.status === "PUBLISHED" && <Link className="secondary-button" href={"/media/" + item.id}>Open</Link>}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
