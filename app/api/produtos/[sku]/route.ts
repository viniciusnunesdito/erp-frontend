import { forwardBackendRequest, getAuthHeader, toNextResponse } from "../../_backend";

type Params = { params: Promise<{ sku: string }> };

export async function GET(_: Request, { params }: Params) {
  const { sku } = await params;
  const authHeader = await getAuthHeader();
  const { response, body, isJson } = await forwardBackendRequest(
    `/produtos/${sku}`,
    {
      headers: { ...authHeader },
    },
  );

  return toNextResponse(response, body, isJson);
}

export async function PUT(request: Request, { params }: Params) {
  const payload = await request.json().catch(() => null);
  const { sku } = await params;
  const authHeader = await getAuthHeader();

  const { response, body, isJson } = await forwardBackendRequest(
    `/produtos/${sku}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      body: JSON.stringify(payload ?? {}),
    },
  );

  return toNextResponse(response, body, isJson);
}

export async function DELETE(_: Request, { params }: Params) {
  const { sku } = await params;
  const authHeader = await getAuthHeader();
  const { response, body, isJson } = await forwardBackendRequest(
    `/produtos/${sku}`,
    {
      method: "DELETE",
      headers: { ...authHeader },
    },
  );

  return toNextResponse(response, body, isJson);
}
