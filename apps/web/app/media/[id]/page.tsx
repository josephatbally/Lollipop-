"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { API, readJson } from "../../api-client";
import MediaPlayer from "./MediaPlayer";

type Media = {
  id: number;
  creator_id: number;
  title: string;
  description?: string | null;
  original_filename: string;
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
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;

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
        const metadata = await readJson<Media>(metadataResponse);
        if (!metadataResponse.ok) throw new Error((metadata as any).detail ?? "Media is not available.");
        if (cancelled) return;
        setMedia(metadata);

        const streamResponse = await fetch(API + "/api/v1/media/" + params.id + "/stream", {
          headers: { Authorization: "Bearer " + token },
        });
        if (!streamResponse.ok) {
          const detail = await readJson(streamResponse).catch(() => ({}));
          throw new Error((detail as any).detail ?? "Could not load the media stream.");
        }
        const blob = await streamResponse.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setStreamUrl(objectUrl);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load media.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (params.id) void load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [params.id]);

  async function download() {
    const token = localStorage.getItem("lollipop_access_token");
    if (!token || !media) return;
    setDownloading(true);
    try {
      const response = await fetch(API + "/api/v1/media/" + media.id + "/download", {
        headers: { Authorization: "Bearer " + token },
      });
      if (!response.ok) {
        const detail = await readJson(response).catch(() => ({}));
        throw new Error((detail as any).detail ?? "Download failed.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = media.original_filename || media.title + ".mp4";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return <main className="shell page"><header className="page-header"><p className="eyebrow">EXPERIENCE</p><h1>Loading<span>…</span></h1></header></main>;
  }

  return (
    <main className="shell page">
      <nav className="nav">
        <Link className="brand" href="/"><img src="/icons/lollipop.svg" alt="" /><span>LOLLIPOP</span></Link>
        <div className="nav-links"><a href="/discover">Discover</a><a href="/creators">Creators</a><a href="/account">Account</a></div>
      </nav>

      {error ? (
        <section className="auth-card">
          <p className="eyebrow">ACCESS</p>
          <h1>{error}</h1>
          <Link className="secondary-button" href={"/login?next=/media/" + params.id}>Sign in</Link>
        </section>
      ) : media ? (
        <section>
          <header className="page-header media-header">
            <p className="eyebrow">EXPERIENCE · {media.access_level}</p>
            <h1>{media.title}</h1>
            {media.description && <p>{media.description}</p>}
            <div className="media-meta"><span>{media.content_type}</span><span>{Math.max(1, Math.round(media.size_bytes / 1024))} KB</span></div>
          </header>

          {streamUrl ? (
            <MediaPlayer
              src={streamUrl}
              title={media.title}
              contentType={media.content_type}
              onDownload={download}
              downloading={downloading}
            />
          ) : (
            <div className="auth-card"><p className="eyebrow">MEDIA</p><h2>Preparing the experience…</h2></div>
          )}

          <div className="media-footer-actions">
            <Link className="secondary-button" href={"/creators/" + media.creator_id}>Creator profile</Link>
            <button className="secondary-button" onClick={download} disabled={downloading}>{downloading ? "Preparing…" : "Download media"}</button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
