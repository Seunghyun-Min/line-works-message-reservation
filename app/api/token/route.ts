// app/api/token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { saveTokensToDisk } from "../../../auth/tokenManager.js";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    console.log("[/api/token] Received code:", code);

    if (!code) {
      return NextResponse.json(
        { error: "Missing authorization code" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("client_id", process.env.CLIENT_ID!);
    params.append("client_secret", process.env.CLIENT_SECRET!);
    params.append("redirect_uri", process.env.REDIRECT_URI!);

    console.log("[/api/token] Requesting access token from LINE WORKS...");

    const res = await fetch("https://auth.worksmobile.com/oauth2/v2.0/token", {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const data = await res.json();
    console.log("[/api/token] Token response:", data);

    if (!res.ok || !data.access_token) {
      console.error("[/api/token] Failed to get access token", data);
      return NextResponse.json(
        { error: "Token request failed", details: data },
        { status: 500 }
      );
    }

    // httpOnly 쿠키로 토큰 저장
    const response = NextResponse.json(data);
    response.cookies.set("accessToken", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24시간
      path: "/",
    });

    // 서버 디스크에도 저장
    try {
      await saveTokensToDisk(data);
      console.log("[/api/token] Tokens saved to disk");
    } catch (err) {
      console.warn(
        "[/api/token] Could not save tokens to disk:",
        (err as Error).message
      );
    }

    return response;
  } catch (err) {
    console.error("[/api/token] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error", details: (err as Error).message },
      { status: 500 }
    );
  }
}
