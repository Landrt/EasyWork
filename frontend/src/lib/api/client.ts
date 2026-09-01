import { ACTIONS, type ActionId, type CheckoutTier } from "./actions";
import { setSession, type SessionUser } from "../session";

export class ApiError extends Error {
  constructor(
    public readonly action: ActionId,
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiResult<T> = { data: T };

type LoginPayload = { email: string; password: string };
type RegisterPayload = { name: string; email: string; password: string };
type ForgotPayload = { email: string };
type ResetPayload = { token: string; password: string };
type CheckoutPayload = { tier: CheckoutTier };

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Mock until the real API exists. Action IDs are unchanged.
 * Set NEXT_PUBLIC_API_URL to send real requests instead.
 */
export async function callAction<T>(
  id: ActionId,
  payload?: unknown,
): Promise<ApiResult<T>> {
  const spec = ACTIONS[id];
  const base = process.env.NEXT_PUBLIC_API_URL;

  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL n'est pas défini. Les requêtes API nécessitent le backend.");
  }

  const res = await fetch(`${base}${spec.path}`, {
    method: spec.method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body:
      spec.method === "GET" || spec.method === "DELETE"
        ? undefined
        : JSON.stringify(payload ?? {}),
  });
  const json = (await res.json().catch(() => ({}))) as {
    message?: string;
    code?: string;
    data?: T;
  };
  if (!res.ok) {
    throw new ApiError(
      id,
      res.status,
      json.message ?? "La requête a échoué.",
      json.code,
    );
  }
  return { data: (json.data ?? json) as T };
}

