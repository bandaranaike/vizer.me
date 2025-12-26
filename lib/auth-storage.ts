export type StoredUser = {
  id: number;
  email: string;
  username?: string | null;
  fullName?: string | null;
};

const STORAGE_KEY = "vizer.auth.user";
export const AUTH_CHANGE_EVENT = "vizer.auth.change";

export function loadStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as StoredUser;
  } catch (error) {
    console.error("Failed to parse stored user", error);
    return null;
  }
}

export function saveStoredUser(user: StoredUser) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  } catch (error) {
    console.error("Failed to persist user", error);
  }
}

export function clearStoredUser() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  } catch (error) {
    console.error("Failed to clear stored user", error);
  }
}

export function buildUserHeaders(user?: StoredUser | null) {
  const sourceUser = user ?? loadStoredUser();

  if (!sourceUser) return {};

  const headers: Record<string, string> = {
    "X-User-Id": String(sourceUser.id),
    "X-User-Email": sourceUser.email,
  };

  if (sourceUser.username) {
    headers["X-User-Username"] = sourceUser.username;
  }

  if (sourceUser.fullName) {
    headers["X-User-Name"] = sourceUser.fullName;
  }

  return headers;
}
