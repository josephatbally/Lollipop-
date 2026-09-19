// @ts-nocheck
"use client";

import { useState } from "react";

export type UserRole = "viewer" | "creator" | "admin";

export default function RoleSwitcher() {
  const [role, setRole] = useState<UserRole>("viewer");

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      background: "rgba(255, 255, 255, 0.05)",
      border: "1px solid var(--line)",
      borderRadius: "999px",
      padding: "2px 4px",
      fontSize: "0.75rem"
    }}>
      {(["viewer", "creator", "admin"] as UserRole[]).map((r) => (
        <button
          key={r}
          onClick={() => setRole(r)}
          style={{
            background: role === r ? "var(--violet)" : "transparent",
            color: role === r ? "#fff" : "var(--muted)",
            border: "none",
            borderRadius: "999px",
            padding: "4px 10px",
            textTransform: "capitalize",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
