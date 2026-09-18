const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

function resolveApiUrl(): string {
  if (typeof window === "undefined") {
    return configuredApiUrl || "http://127.0.0.1:8000";
  }

  const browserHost = window.location.hostname;

  if (configuredApiUrl) {
    try {
      const configured = new URL(configuredApiUrl);
      const isLoopback =
        configured.hostname === "127.0.0.1" ||
        configured.hostname === "localhost";

      // Keep LAN testing portable even when .env.local still points at loopback.
      if (isLoopback && browserHost !== "127.0.0.1" && browserHost !== "localhost") {
        configured.hostname = browserHost;
        return configured.origin;
      }

      return configured.origin;
    } catch {
      // Fall through to the browser-derived development URL.
    }
  }

  return `${window.location.protocol}//${browserHost}:8000`;
}

export const API = resolveApiUrl();

export async function readJson<T = any>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const raw = await response.text();

  let data: any = null;
  if (raw && contentType.includes("application/json")) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : raw && !contentType.includes("text/html")
          ? raw.slice(0, 240)
          : `Request failed (${response.status})`;
    throw new Error(detail);
  }

  if (data === null) {
    throw new Error("The server returned an invalid response.");
  }

  return data as T;
}

export async function apiJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  return readJson<T>(response);
}
