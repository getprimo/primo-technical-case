// Every call to the API goes through apiFetch: it sends the impersonated user's id.

let currentUserId: string | null = null;

export function setCurrentUser(userId: string | null) {
  currentUserId = userId;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(currentUserId ? { "x-user-id": currentUserId } : {}),
      ...init.headers,
    },
  });
  if (!res.ok)
    throw new Error(`${init.method ?? "GET"} ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

export interface DevUser {
  id: string;
  name: string;
  role: "admin" | "employee";
  company: string;
}

export interface DeviceRow {
  id: string;
  serialNumber: string;
  model: string;
  platform: "macos" | "windows";
  lastSeenAt: string;
  owner: { id: string; name: string; status: string } | null;
  diskEncryption: {
    enabled: boolean | null;
    reportedAt: string | null;
    compliance: "compliant" | "non_compliant";
  };
}
