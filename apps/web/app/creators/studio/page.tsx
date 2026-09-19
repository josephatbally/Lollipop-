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
      setMessage("Media published successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish media.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#090a12", color: "#f5f6ff", paddingBottom: 100 }}>
      {/* Persistent Navigation */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(9, 10, 18, 0.85)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "16px 24px"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                background: "linear-gradient(135deg, #f033a8, #3fe0d0)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                fontSize: 16,
                color: "#090a12",
                boxShadow: "0 0 16px rgba(240, 51, 168, 0.5)"
              }}>🍭</span>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "0.06em", color: "#f5f6ff" }}>LOLLIPOP</span>
            </Link>
            <nav style={{ display: "flex", gap: 20 }}>
              <Link href="/discover" style={{ color: "#949cb8", fontWeight: 500, fontSize: 14, textDecoration: "none" }}>Discover</Link>
              <Link href="/creators" style={{ color: "#949cb8", fontWeight: 500, fontSize: 14, textDecoration: "none" }}>Creators</Link>
              <Link href="/account" style={{ color: "#949cb8", fontWeight: 500, fontSize: 14, textDecoration: "none" }}>Account</Link>
            </nav>
          </div>
          <Link href="/creators" style={{
            padding: "8px 18px",
            borderRadius: 9999,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#3fe0d0",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 600
          }}>
            Public Profile →
          </Link>
        </div>
      </header>

      {/* Main Studio Shell */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        <header style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#f033a8", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            CREATOR STUDIO
          </span>
          <h1 style={{ fontSize: 38, fontWeight: 900, margin: "8px 0 10px", letterSpacing: "-0.03em" }}>
            Publish New Experience
          </h1>
          <p style={{ color: "#949cb8", fontSize: 15, maxWidth: 650, margin: 0, lineHeight: 1.6 }}>
            Upload raw video experiences, record signed participant consent, await automated moderation, and broadcast to your subscriber tiers.
          </p>
        </header>

        {error && (
          <div style={{ background: "rgba(255, 95, 158, 0.12)", border: "1px solid rgba(255, 95, 158, 0.35)", borderRadius: 14, padding: "14px 20px", marginBottom: 24, color: "#ff5f9e", fontSize: 14 }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ background: "rgba(63, 224, 208, 0.12)", border: "1px solid rgba(63, 224, 208, 0.35)", borderRadius: 14, padding: "14px 20px", marginBottom: 24, color: "#3fe0d0", fontSize: 14 }}>
            {message}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 36, alignItems: "start" }}>
          
          {/* Left Column: Upload Form */}
          <section style={{
            background: "rgba(17, 20, 36, 0.8)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(240, 51, 168, 0.25)",
            borderRadius: 22,
            padding: 32,
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)"
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <span>Upload Video</span>
              <span style={{ fontSize: 11, background: "rgba(240, 51, 168, 0.15)", color: "#f033a8", padding: "4px 10px", borderRadius: 9999, fontWeight: 700 }}>STUDIO</span>
            </h2>

            <form onSubmit={upload} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#949cb8", marginBottom: 6, textTransform: "uppercase" }}>Title</label>
                <input
                  placeholder="e.g. Cinematic Soundscapes - Episode 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#f5f6ff", fontSize: 14, outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#949cb8", marginBottom: 6, textTransform: "uppercase" }}>Description</label>
                <textarea
                  placeholder="Provide context for subscribers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={4000}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#f5f6ff", fontSize: 14, outline: "none", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#949cb8", marginBottom: 6, textTransform: "uppercase" }}>Participant Reference</label>
                  <input
                    value={participant}
                    onChange={(e) => setParticipant(e.target.value)}
                    required
                    maxLength={255}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 12, background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#f5f6ff", fontSize: 13, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#949cb8", marginBottom: 6, textTransform: "uppercase" }}>Auth Version</label>
                  <input
                    value={authorizationVersion}
                    onChange={(e) => setAuthorizationVersion(e.target.value)}
                    required
                    maxLength={100}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 12, background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#f5f6ff", fontSize: 13, outline: "none" }}
                  />
                </div>
              </div>

              {/* File Dropzone */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#949cb8", marginBottom: 6, textTransform: "uppercase" }}>Video File (MP4, WebM)</label>
                <div style={{
                  border: "2px dashed rgba(240, 51, 168, 0.35)",
                  borderRadius: 14,
                  padding: 24,
                  textAlign: "center",
                  background: "rgba(240, 51, 168, 0.03)",
                  position: "relative"
                }}>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    required
                    style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, opacity: 0, cursor: "pointer" }}
                  />
                  <div style={{ fontSize: 24, marginBottom: 8 }}>📁</div>
                  <p style={{ margin: 0, fontSize: 14, color: "#f5f6ff", fontWeight: 600 }}>
                    {file ? file.name : "Click or drag video file here"}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#949cb8" }}>
                    {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "Supports MP4, WebM up to 500MB"}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              {busy && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6, color: "#3fe0d0" }}>
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255, 255, 255, 0.1)", borderRadius: 9999, overflow: "hidden" }}>
                    <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #f033a8, #3fe0d0)", transition: "width 0.2s ease" }} />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                style={{
                  background: "linear-gradient(135deg, #f033a8, #c41885)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 9999,
                  padding: "14px 24px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: busy ? "not-allowed" : "pointer",
                  boxShadow: "0 0 20px rgba(240, 51, 168, 0.45)",
                  marginTop: 10
                }}
              >
                {busy ? `Uploading ${progress}%...` : "Upload for Review →"}
              </button>
            </form>
          </section>

          {/* Right Column: Library */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Your Library</h2>
              <span style={{ fontSize: 13, color: "#949cb8" }}>{items.length} items</span>
            </div>

            {items.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed rgba(255, 255, 255, 0.1)", borderRadius: 20, color: "#949cb8" }}>
                <p style={{ margin: 0, fontSize: 15 }}>No uploads yet. Videos you submit will appear here.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {items.map((item) => {
                  const statusColors: Record<string, { bg: string; text: string }> = {
                    PENDING_REVIEW: { bg: "rgba(63, 224, 208, 0.15)", text: "#3fe0d0" },
                    APPROVED: { bg: "rgba(46, 213, 115, 0.15)", text: "#2ed573" },
                    PUBLISHED: { bg: "rgba(240, 51, 168, 0.15)", text: "#f033a8" },
                    REJECTED: { bg: "rgba(255, 95, 158, 0.15)", text: "#ff5f9e" },
                  };
                  const color = statusColors[item.status] || { bg: "rgba(255, 255, 255, 0.1)", text: "#949cb8" };

                  return (
                    <article
                      key={item.id}
                      style={{
                        background: "rgba(17, 20, 36, 0.75)",
                        backdropFilter: "blur(14px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: 18,
                        padding: 20,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        flexWrap: "wrap"
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "#949cb8", textTransform: "uppercase" }}>#{item.id}</span>
                          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{item.title}</h3>
                        </div>
                        <p style={{ margin: "0 0 6px", color: "#949cb8", fontSize: 13 }}>
                          {item.original_filename} · {(item.size_bytes / 1024 / 1024).toFixed(1)} MB
                        </p>
                        {item.moderation_reason && (
                          <p style={{ margin: "4px 0 0", color: "#ff5f9e", fontSize: 12 }}>
                            Note: {item.moderation_reason}
                          </p>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{
                          padding: "5px 12px",
                          borderRadius: 9999,
                          fontSize: 11,
                          fontWeight: 800,
                          background: color.bg,
                          color: color.text,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase"
                        }}>
                          {item.status}
                        </span>

                        {item.status === "APPROVED" && (
                          <button
                            disabled={busy}
                            onClick={() => void publish(item.id)}
                            style={{
                              background: "linear-gradient(135deg, #2ed573, #1e90ff)",
                              color: "#fff",
                              border: "none",
                              borderRadius: 9999,
                              padding: "7px 18px",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            Publish
                          </button>
                        )}

                        {item.status === "PUBLISHED" && (
                          <Link
                            href={`/media/${item.id}`}
                            style={{
                              background: "rgba(255, 255, 255, 0.08)",
                              border: "1px solid rgba(255, 255, 255, 0.15)",
                              borderRadius: 9999,
                              padding: "7px 16px",
                              color: "#f5f6ff",
                              textDecoration: "none",
                              fontSize: 12,
                              fontWeight: 600
                            }}
                          >
                            Open →
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
