// app/api/employees/route.ts
import { NextResponse } from "next/server";
import { getUserList } from "../users.js";
import { getAccessToken } from "../../../auth/tokenManager.js";

export async function GET() {
  try {
    console.log("🚀 /api/employees 呼び出し開始...");

    // ① アクセストークン取得
    const tokenData = await getAccessToken();
    const accessToken = tokenData.access_token;

    // ② ユーザー一覧取得
    const users = await getUserList(accessToken);

    console.log(`👥 取得した社員数: ${users.length}`);

    // ③ フロントに返す
    return NextResponse.json(users);
  } catch (err: unknown) {
    // ✅ TypeScript向けに安全なエラーハンドリング
    if (err instanceof Error) {
      console.error("❌ 社員リスト取得APIエラー:", err.message);
    } else {
      console.error("❌ 社員リスト取得APIエラー:", err);
    }

    return NextResponse.json(
      { error: "社員リストの取得に失敗しました" },
      { status: 500 }
    );
  }
}
