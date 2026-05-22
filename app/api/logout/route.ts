import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set({
    name: "erp_token",
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}
