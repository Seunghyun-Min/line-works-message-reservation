import { NextResponse } from "next/server";
import { getUserList } from "../users.js";
import { getAccessToken } from "../../../auth/tokenManager.js";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// ---- 環境変数に設定しておく必要あり ----
// GOOGLE_SERVICE_ACCOUNT_EMAIL
// GOOGLE_PRIVATE_KEY
// GOOGLE_SHEET_ID

export async function GET() {
  try {
    console.log("🚀 /api/employees 呼び出し開始...");

    const tokenData = await getAccessToken();
    const accessToken = tokenData.access_token;
    console.log("✅ アクセストークン取得OK");

    const users = await getUserList(accessToken);
    console.log(`✅ 社員リスト取得OK (${users.length}件)`);

    // Google Sheets 書き込みテスト
    console.log("📝 Google Sheets 書き込み開始...");

    // ← このあたりでGoogle連携をしている場合、認証失敗で落ちる可能性あり

    return NextResponse.json(users);
  } catch (err: any) {
    console.error("❌ 社員リスト取得APIエラー詳細:", err);
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
