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

export function updateSessionUser(updates: Partial<SessionUser>): void {
  if (typeof window === "undefined") return;
  const current = getSession();
  if (current) {
    const updated = { ...current, ...updates };
    window.localStorage.setItem(KEY, JSON.stringify(updated));
  }
  window.dispatchEvent(new Event("gencv-session"));
}

export function getCandidateName(): string {
  if (typeof window === "undefined") return "";
  const session = getSession();
  if (session?.name && session.name.trim() && session.name.trim() !== "Mon Profil" && session.name.trim() !== "Prénom Nom") {
    return session.name.trim();
  }
  const localName = window.localStorage.getItem("user_full_name");
  if (localName && localName.trim() && localName.trim() !== "Mon Profil" && localName.trim() !== "Prénom Nom") {
    return localName.trim();
  }
  const sessName = window.sessionStorage.getItem("candidate_name");
  if (sessName && sessName.trim() && sessName.trim() !== "Mon Profil" && sessName.trim() !== "Prénom Nom") {
    return sessName.trim();
  }
  return session?.name || localName || sessName || "";
}

export function setCandidateName(name: string): void {
  if (typeof window === "undefined") return;
  const cleanName = name.trim();
  if (!cleanName) return;
  window.localStorage.setItem("user_full_name", cleanName);
  window.sessionStorage.setItem("candidate_name", cleanName);
  const current = getSession();
  if (current) {
    window.localStorage.setItem(KEY, JSON.stringify({ ...current, name: cleanName }));
  }
  try {
    const storedCv = window.sessionStorage.getItem("current_cv");
    if (storedCv) {
      const parsedCv = JSON.parse(storedCv);
      if (parsedCv.header) {
        parsedCv.header.name = cleanName;
        window.sessionStorage.setItem("current_cv", JSON.stringify(parsedCv));
      }
    }
  } catch (e) {}
  window.dispatchEvent(new Event("gencv-session"));
}

export function clearSession(): void {
  window.localStorage.removeItem(KEY);
  window.localStorage.removeItem("user_full_name");
  window.sessionStorage.removeItem("candidate_name");
  window.dispatchEvent(new Event("gencv-session"));
}
