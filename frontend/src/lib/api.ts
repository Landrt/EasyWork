"use client";

import { authClient } from "./auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

/**
 * Hook to get an authenticated fetch client.
 * It automatically injects the Neon Auth JWT into the Authorization header.
 */
export function useApi() {
  const { data: sessionData } = authClient.useSession();

  const getHeaders = (extra?: HeadersInit) => {
    const headers = new Headers(extra);
    headers.set("Content-Type", "application/json");
    if (sessionData?.session) {
      const token = sessionData.session.token || sessionData.session.id;
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  };

  /** Returns parsed JSON; throws on non-OK responses. */
  const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: getHeaders(options.headers),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "API Error");
    }

    return response.json();
  };

  /** Returns the raw Response (for blobs, CSV, etc.). Throws on non-OK responses. */
  const fetchRaw = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: getHeaders(options.headers),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "API Error");
    }

    return response;
  };

  return { fetch: authenticatedFetch, fetchRaw };
}
