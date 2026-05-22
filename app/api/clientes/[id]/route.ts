import { forwardBackendRequest, getAuthHeader, toNextResponse } from "../../_backend";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const authHeader = await getAuthHeader();
  const { response, body, isJson } = await forwardBackendRequest(
    `/clientes/${id}`,
    {
      headers: { ...authHeader },
    },
  );

  return toNextResponse(response, body, isJson);
}

export async function PUT(request: Request, { params }: Params) {
  const payload = await request.json().catch(() => null);
  const { id } = await params;
  const authHeader = await getAuthHeader();

  const { response, body, isJson } = await forwardBackendRequest(
    `/clientes/${id}`,
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
  const { id } = await params;
  const authHeader = await getAuthHeader();
  const { response, body, isJson } = await forwardBackendRequest(
    `/clientes/${id}`,
    {
      method: "DELETE",
      headers: { ...authHeader },
    },
  );

  return toNextResponse(response, body, isJson);
}
