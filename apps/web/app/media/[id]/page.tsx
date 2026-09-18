"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { API, readJson } from "../../api-client";

type Media = {
  id: number;
  creator_id: number;
  title: string;
  description?: string | null;
  content_type: string;
  size_bytes: number;
  status: string;
  access_level: string;
};

export default function MediaPage() {
  const params = useParams<{ id: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl = "";
    async function load() {
      const token = localStorage.getItem("lollipop_access_token");
      if (!token) {
        setError("Sign in to access this experience.");
        setLoading(false);
        return;
      }

      try {
        const metadataResponse = await fetch(API + "/api/v1/media/" + params.id, {
          headers: { Authorization: "Bearer " + token },
        });
        const metadata = await readJson(metadataResponse);
        if (!metadataResponse.ok) throw new Error(metadata.detail ?? "Media is not available.");
        setMedia(metadata);

        const streamResponse = await fetch(API + "/api/v1/media/" + params.id + "/stream", {
          headers: { Authorization: "Bearer " + token },
        });
        if (!streamResponse.ok) {
          const detail = await readJson(streamResponse).catch(() => ({}));
          throw new Error(detail.detail ?? "Could not load the media stream.");
        }
        const blob = await streamResponse.blob();
        objectUrl = URL.createObjectURL(blob);
        setStreamUrl(objectUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load media.");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) load();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [params.id]);

  if (loading) {
    return <main className="shell page"><header className="page-header"><p className="eyebrow">EXPERIENCE</p><h1>Loading<span>…</span></h1></header></main>;
  }

  return (
    <main className="shell page">
      <nav className="nav">
        <a className="brand" href="/"><img src="/icons/lollipop.svg" alt="" /><span>LOLLIPOP</span></a>
        <div className="nav-links"><a href="/discover">Discover</a><a href="/account">Account</a></div>
      </nav>

      {error ? (
        <section className="auth-card">
          <p className="eyebrow">ACCESS</p>
          <h1>{error}</h1>
          <a className="secondary-button" href="/login">Sign in</a>
        </section>
      ) : media ? (
        <section>
          <header className="page-header">
            <p className="eyebrow">EXPERIENCE · {media.access_level}</p>
            <h1>{media.title}</h1>
            {media.description && <p>{media.description}</p>}
          </header>
          {streamUrl && (
            <video
              controls
              playsInline
              preload="metadata"
              src={streamUrl}
              style={{ width: "100%", maxHeight: "75vh", borderRadius: "24px" }}
            />
          )}
        </section>
      ) : null}
    </main>
  );
}
