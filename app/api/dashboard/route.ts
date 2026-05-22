import { forwardBackendRequest, getAuthHeader, toNextResponse } from "../_backend";

export async function GET(request: Request) {
  const authHeader = await getAuthHeader();
  const url = new URL(request.url);
  const query = url.search;
  const { response, body, isJson } = await forwardBackendRequest(
    `/dashboard${query}`,
    {
      headers: { ...authHeader },
    },
  );

  return toNextResponse(response, body, isJson);
}
