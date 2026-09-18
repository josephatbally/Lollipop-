"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="shell page">
      <section className="auth-card" style={{ marginTop: "14vh" }}>
        <p className="eyebrow">LOLLIPOP RUNTIME</p>
        <h1>Something went <span>off dimension.</span></h1>
        <p className="hero-text">The page hit an unexpected error. You can retry without losing the rest of the application.</p>
        <div className="actions">
          <button className="primary-button" onClick={() => reset()}>Try again</button>
          <a className="secondary-button" href="/">Return home</a>
        </div>
        {error.digest && <p className="error">Error reference: {error.digest}</p>}
      </section>
    </main>
  );
}
