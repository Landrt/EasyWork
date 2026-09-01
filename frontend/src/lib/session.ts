export type SessionUser = {
  id: string;
  email: string;
  name: string;
  affiliateEnabled: boolean;
};

const KEY = "gencv.session";

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser): void {
  window.localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("gencv-session"));
}

export function clearSession(): void {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("gencv-session"));
}
