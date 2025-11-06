import { GoogleAuth } from "google-auth-library";
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

const SHEET_ID = process.env.SPREADSHEET_ID as string;
const BOT_ID = process.env.WORKS_BOT_ID as string;
type SheetRow = {
  _rawData: string[];
  save: () => Promise<void>;
};
export async function POST(req: Request) {
  try {
    // 要請BodyでAccessToken取得
    const body = await req.json().catch(() => ({}));
    const ACCESS_TOKEN: string =
      body.accessToken || process.env.WORKS_ACCESS_TOKEN || "";

    if (!ACCESS_TOKEN) {
      throw new Error("アクセストークンが指定されていません。");
    }

    // Google Sheets 認証
    const auth = new GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // シートロード
    const doc = new GoogleSpreadsheet(SHEET_ID, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    // Header Index 探し
    const headers: string[] = sheet.headerValues;
    const stateIndex = headers.findIndex((h: string) => h.trim() === "状態");
    const messageIndex = headers.findIndex(
      (h: string) => h.trim() === "メッセージ内容"
    );
    const groupIndex = headers.findIndex(
      (h: string) => h.trim() === "グループ"
    );
    const userIndex = headers.findIndex(
      (h: string) => h.trim() === "ユーザーID"
    );
    const timeIndex = headers.findIndex((h) => h.trim() === "送信時間");

    console.log("📄 シート名:", sheet.title);
    console.log("📋 行数:", rows.length);
    console.log(
      "🧾 状態一覧(raw):",
      rows.map((r: SheetRow) => r._rawData[stateIndex])
    );

    // === 条件: 状態が「送信待機」 && 送信時間が現在時刻より前 ===
    const now = dayjs();
    const waitingRows = rows.filter((r: SheetRow) => {
      const state = r._rawData[stateIndex]?.trim();
      const sendTimeStr = r._rawData[timeIndex]?.trim();
      if (state !== "送信待機" || !sendTimeStr) return false;

      const sendTime = dayjs(sendTimeStr);
      return sendTime.isBefore(now);
    });

    console.log("📊 待機中予約数:", waitingRows.length);

    // === 送信処理 ===
    for (const row of waitingRows) {
      const raw = row._rawData;
      const message = raw[messageIndex];
      const groupId = raw[groupIndex];
      const userIds = (raw[userIndex] || "")
        .split(",")
        .map((id: string) => id.trim())
        .filter(Boolean);

      let success = false;

      // 個人宛て
      if (userIds.length > 0) {
        for (const [index, id] of userIds.entries()) {
          console.log(
            `📨 ${index + 1}/${userIds.length} 件目: ${id} へ送信中...`
          );

          try {
            const res = await fetch(
              `https://www.worksapis.com/v1.0/bots/${BOT_ID}/users/${id}/messages`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${ACCESS_TOKEN}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  content: { type: "text", text: message },
                }),
              }
            );

            if (res.ok) {
              console.log(`✅ ${id} への送信成功`);
              success = true;
            } else {
              const errorText = await res.text();
              console.error(
                `❌ ${id} への送信失敗: ${res.status} ${res.statusText}`
              );
              console.error("レスポンス内容:", errorText);
            }
          } catch (err: unknown) {
            if (err instanceof Error) {
              console.error(`💥 ${id} への送信中エラー:`, err.message);
            } else {
              console.error(`💥 ${id} への送信中エラー:`, String(err));
            }
          }
        }
      }

      // グループ宛て
      else if (groupId) {
        const res = await fetch(
          `https://www.worksapis.com/v1.0/bots/${BOT_ID}/channels/${groupId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: { type: "text", text: message },
            }),
          }
        );
        if (res.ok) success = true;
      }

      // 状態更新
      if (success) {
        row._rawData[stateIndex] = "送信済み";
        await row.save();
      }
    }

    return NextResponse.json({ success: true, count: waitingRows.length });
  } catch (err: unknown) {
    console.error("❌ エラー:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
