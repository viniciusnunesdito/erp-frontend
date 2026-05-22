import { cookies } from "next/headers";
import { forwardBackendRequest, toNextResponse } from "../_backend";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.email || !body?.senha) {
    return Response.json({ error: "Dados invalidos" }, { status: 400 });
  }

  const { response, body: responseBody, isJson } = await forwardBackendRequest(
    "/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: body.email,
        password: body.senha,
      }),
    },
  );

  if (response.ok && isJson && responseBody && typeof responseBody === "object") {
    const token = (responseBody as { token?: string }).token;
    if (token) {
      const cookieStore = await cookies();
      cookieStore.set({
        name: "erp_token",
        value: token,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
      });
    }
  }

  return toNextResponse(response, responseBody, isJson);
}
