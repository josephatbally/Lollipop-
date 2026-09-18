export const API =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : "http://127.0.0.1:8000");

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
