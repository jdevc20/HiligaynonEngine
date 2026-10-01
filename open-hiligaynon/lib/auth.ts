import axios from "axios";

export type HilitechRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface HilitechUser {
  id: string;
  IdentityId: string;
  email: string;
  username: string | null;
  role: HilitechRole;
  status: string;
  profile?: {
    displayName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

export interface HilitechSession {
  accessToken: string;
  user: HilitechUser;
}

const STORAGE_KEY = "hiligaynon.hilitech.session";
const authBaseURL =
  process.env.NEXT_PUBLIC_HILITECH_AUTH_URL ||
  "https://hilitech-auth-service.onrender.com/api";
const clientId = process.env.NEXT_PUBLIC_HILITECH_CLIENT_ID?.trim();

const authApi = axios.create({
  baseURL: authBaseURL,
  timeout: 15000,
  withCredentials: true,
});

export const getStoredHilitechSession = (): HilitechSession | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HilitechSession) : null;
  } catch {
    return null;
  }
};

export const storeHilitechSession = (session: HilitechSession | null) => {
  if (typeof window === "undefined") return;

  if (!session) {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const signInWithHilitech = async (
  email: string,
  password: string
): Promise<HilitechSession> => {
  const response = await authApi.post("/auth/login", {
    email,
    password,
    ...(clientId ? { clientId } : {}),
  });

  const session = response.data?.data as HilitechSession | undefined;

  if (!session?.accessToken || !session.user?.IdentityId) {
    throw new Error("Hilitech Authentication returned an invalid login response.");
  }

  storeHilitechSession(session);
  return session;
};

export const refreshHilitechSession = async (): Promise<HilitechSession> => {
  const response = await authApi.post("/token/refresh", {});
  const session = response.data?.data as HilitechSession | undefined;

  if (!session?.accessToken || !session.user?.IdentityId) {
    throw new Error("Hilitech Authentication returned an invalid refresh response.");
  }

  storeHilitechSession(session);
  return session;
};

export const signOutFromHilitech = async () => {
  try {
    await authApi.post("/token/revoke", {});
  } finally {
    storeHilitechSession(null);
  }
};

export const isHilitechAdmin = (role?: HilitechRole) =>
  role === "ADMIN" || role === "SUPER_ADMIN";
