import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("client_id", process.env.NEXT_PUBLIC_CLIENT_ID!);
  params.append("client_secret", process.env.NEXT_PUBLIC_CLIENT_SECRET!);
  params.append("redirect_uri", process.env.NEXT_PUBLIC_REDIRECT_URI!);

  const res = await fetch("https://auth.worksmobile.com/oauth2/v2.0/token", {
    method: "POST",
    body: params,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
