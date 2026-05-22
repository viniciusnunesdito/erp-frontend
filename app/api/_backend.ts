import { cookies } from "next/headers";

const API_BASE = process.env.ERP_API_URL || "http://localhost:4000";
const TOKEN_COOKIE = "erp_token";

export const getBackendUrl = (path: string) => {
  if (path.startsWith("/")) {
    return `${API_BASE}${path}`;
  }
  return `${API_BASE}/${path}`;
};

export const getAuthHeader = async (): Promise<HeadersInit> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

export const forwardBackendRequest = async (
  path: string,
  init: RequestInit = {},
) => {
  const response = await fetch(getBackendUrl(path), {
    cache: "no-store",
    ...init,
  });
  const text = await response.text();
  if (!text) {
    return { response, body: null, isJson: true };
  }

  try {
    const body = JSON.parse(text) as unknown;
    return { response, body, isJson: true };
  } catch {
    return { response, body: text, isJson: false };
  }
};

export const toNextResponse = (
  response: Response,
  body: unknown,
  isJson: boolean,
) => {
  if (isJson) {
    return Response.json(body ?? null, { status: response.status });
  }

  const contentType = response.headers.get("content-type") || "text/plain";
  return new Response(body ? String(body) : "", {
    status: response.status,
    headers: { "Content-Type": contentType },
  });
};
