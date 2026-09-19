"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  title: string;
  contentType: string;
  onDownload: () => void;
  downloading: boolean;
};

export default function MediaPlayer({ src, title, contentType, onDownload, downloading }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [fit, setFit] = useState<"contain" | "cover">("contain");
  const [cinema, setCinema] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);

  useEffect(() => {
    setPipSupported(Boolean(document.pictureInPictureEnabled));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "SELECT" || target?.tagName === "TEXTAREA") return;
      const video = videoRef.current;
      if (!video) return;
      if (event.code === "Space") { event.preventDefault(); void togglePlay(); }
      if (event.key.toLowerCase() === "m") { event.preventDefault(); toggleMute(); }
      if (event.key.toLowerCase() === "f") { event.preventDefault(); void toggleFullscreen(); }
      if (event.key === "ArrowRight") video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 5);
      if (event.key === "ArrowLeft") video.currentTime = Math.max(0, video.currentTime - 5);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return Promise.resolve();
    if (video.paused) return video.play();
    video.pause();
    return Promise.resolve();
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function changeVolume(value: number) {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
    setMuted(video.muted);
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await shellRef.current?.requestFullscreen?.();
  }

  async function togglePip() {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      return;
    }
    await video.requestPictureInPicture();
  }

  function formatTime(value: number) {
    if (!Number.isFinite(value)) return "0:00";
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60).toString().padStart(2, "0");
    return minutes + ":" + seconds;
  }

  return (
    <div className={"media-player-shell " + (cinema ? "cinema" : "")} ref={shellRef}>
      <div className={"media-stage fit-" + fit} onDoubleClick={() => void toggleFullscreen()}>
        <video
          ref={videoRef}
          src={src}
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onVolumeChange={(event) => {
            setVolume(event.currentTarget.volume);
            setMuted(event.currentTarget.muted);
          }}
          aria-label={title}
        />
        <button className="media-big-play" onClick={() => void togglePlay()} aria-label={playing ? "Pause" : "Play"}>
          {playing ? "Ⅱ" : "▶"}
        </button>
      </div>

      <div className="media-controls">
        <button onClick={() => void togglePlay()} aria-label={playing ? "Pause" : "Play"}>{playing ? "Ⅱ" : "▶"}</button>
        <span className="media-time">{formatTime(current)}</span>
        <input
          className="media-seek"
          type="range"
          min="0"
          max={Math.max(duration, 0)}
          step="0.1"
          value={Math.min(current, duration || 0)}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (videoRef.current) videoRef.current.currentTime = value;
            setCurrent(value);
          }}
          aria-label="Seek"
        />
        <span className="media-time">{formatTime(duration)}</span>
        <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>{muted ? "🔇" : "🔊"}</button>
        <input
          className="media-volume"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={muted ? 0 : volume}
          onChange={(event) => changeVolume(Number(event.target.value))}
          aria-label="Volume"
        />
        <select value={speed} onChange={(event) => {
          const next = Number(event.target.value);
          setSpeed(next);
          if (videoRef.current) videoRef.current.playbackRate = next;
        }} aria-label="Playback speed">
          <option value="0.5">0.5×</option>
          <option value="0.75">0.75×</option>
          <option value="1">1×</option>
          <option value="1.25">1.25×</option>
          <option value="1.5">1.5×</option>
          <option value="2">2×</option>
        </select>
        <button onClick={() => setFit(fit === "contain" ? "cover" : "contain")} title="Toggle video fit">
          {fit === "contain" ? "FIT" : "CROP"}
        </button>
        <button onClick={() => setCinema(!cinema)} title="Toggle cinema mode">▣</button>
        {pipSupported && <button onClick={() => void togglePip()} title="Picture in picture">PiP</button>}
        <button onClick={() => void toggleFullscreen()} title="Fullscreen">⛶</button>
        <button onClick={onDownload} disabled={downloading} title="Download">
          {downloading ? "…" : "↓"}
        </button>
      </div>

      <div className="media-hints">Space play/pause · ←/→ seek 5s · M mute · F fullscreen · {contentType}</div>
    </div>
  );
}
