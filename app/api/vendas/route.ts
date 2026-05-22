import { forwardBackendRequest, getAuthHeader, toNextResponse } from "../_backend";

export async function GET() {
  const authHeader = await getAuthHeader();
  const { response, body, isJson } = await forwardBackendRequest("/vendas", {
    headers: { ...authHeader },
  });

  return toNextResponse(response, body, isJson);
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const authHeader = await getAuthHeader();

  const { response, body, isJson } = await forwardBackendRequest("/vendas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(payload ?? {}),
  });

  return toNextResponse(response, body, isJson);
}
