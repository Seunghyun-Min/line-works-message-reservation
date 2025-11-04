import { NextResponse } from "next/server";
import { getUserList } from "../users.js";
import { getAccessToken } from "../../../auth/tokenManager.js";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { GoogleAuth } from "google-auth-library";

const SHEET_ID = process.env.SPREADSHEET_ID as string;

export async function GET() {
  try {
    console.log("🚀 /api/employees 呼び出し開始...");

    // ① アクセストークン取得
    const tokenData = await getAccessToken();
    const accessToken = tokenData.access_token;

    // ② ユーザー一覧取得
    const users = await getUserList(accessToken);
    console.log(`👥 取得した社員数: ${users.length}`);

    // ③ Google Sheets 認証
    const auth = new GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // ④ Google Sheets に接続
    const doc = new GoogleSpreadsheet(SHEET_ID, auth);
    await doc.loadInfo();

    // 「employeesList」シートを取得または作成
    let sheet = doc.sheetsByTitle["employeesList"];
    if (!sheet) {
      sheet = await doc.addSheet({
        title: "employeesList",
        headerValues: ["userId", "name"],
      });
      console.log("🆕 新しいシート 'employeesList' を作成しました");
    }

    // 古いデータをクリアして新しいデータを上書き
    await sheet.clear();
    await sheet.setHeaderRow(["userId", "name"]);

    await sheet.addRows(
      users.map((u: any) => ({
        userId: u.userId || "",
        name: u.name || "",
      }))
    );

    console.log(
      `✅ ${users.length}件の社員情報をスプレッドシートに保存しました`
    );

    // ⑤ フロントにも返す
    return NextResponse.json(users);
  } catch (err: any) {
    console.error("❌ 社員リスト取得APIエラー:", err);
    return NextResponse.json(
      { error: "社員リストの取得・保存に失敗しました" },
      { status: 500 }
    );
  }
}
