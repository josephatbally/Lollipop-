"use client";

import { useEffect, useState } from "react";

export default function PwaInstallPrompt() {
  const [event, setEvent] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (value: Event) => {
      value.preventDefault();
      setEvent(value);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !event) return null;

  return (
    <aside className="pwa-install" aria-label="Install Lollipop">
      <div><p className="eyebrow">MOBILE APP</p><strong>Install Lollipop</strong><span>Use Lollipop from your phone like an app.</span></div>
      <div className="pwa-actions">
        <button className="secondary-button" onClick={() => setVisible(false)}>Later</button>
        <button className="primary-button" onClick={async () => {
          await event.prompt();
          await event.userChoice;
          setEvent(null);
          setVisible(false);
        }}>Install</button>
      </div>
    </aside>
  );
}
