import { forwardBackendRequest, getAuthHeader, toNextResponse } from "../../_backend";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const authHeader = await getAuthHeader();
  const { response, body, isJson } = await forwardBackendRequest(`/vendas/${id}`, {
    headers: { ...authHeader },
  });

  return toNextResponse(response, body, isJson);
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const authHeader = await getAuthHeader();
  const { response, body, isJson } = await forwardBackendRequest(`/vendas/${id}`, {
    method: "DELETE",
    headers: { ...authHeader },
  });

  return toNextResponse(response, body, isJson);
}