import { forwardBackendRequest, getAuthHeader, toNextResponse } from "../_backend";

export async function GET() {
  const authHeader = await getAuthHeader();
  const { response, body, isJson } = await forwardBackendRequest("/perfil", {
    headers: { ...authHeader },
  });

  return toNextResponse(response, body, isJson);
}

export async function PUT(request: Request) {
  const payload = await request.json().catch(() => null);
  const authHeader = await getAuthHeader();

  const { response, body, isJson } = await forwardBackendRequest("/perfil", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(payload ?? {}),
  });

  return toNextResponse(response, body, isJson);
}
