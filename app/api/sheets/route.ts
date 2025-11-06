import { google } from "googleapis";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

const SHEET_ID = process.env.SPREADSHEET_ID as string;

type SheetRow = {
  予約ID: string;
  送信時間: string;
  個人: string;
  グループ: string;
  メッセージ内容: string;
  状態: string;
  ユーザーID: string;
};

/**
 * GET: スプレッドシートからデータ読み取り
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "A1:G150",
    });

    const rows = res.data.values || [];
    const data = rows.slice(1).map((row) => ({
      id: row[0],
      time: row[1],
      targetUser: row[2],
      targetGroup: row[3],
      message: row[4],
      status: row[5],
      userIds: row[6]?.split(",") || [],
    }));

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("❌ Spreadsheet 読み取りエラー:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * POST: フォームデータをスプレッドシートに追加
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sendTime, personal, group, message } = body;

    if (!sendTime) {
      return NextResponse.json(
        { error: "送信時間を選択してください。" },
        { status: 400 }
      );
    } else if (!personal && !group) {
      return NextResponse.json(
        { error: "宛先を入力してください。" },
        { status: 400 }
      );
    } else if (personal && group) {
      // 둘 다 입력되면 에러
      return NextResponse.json(
        { error: "宛先は個人かグループのどちらかのみ選択してください。" },
        { status: 400 }
      );
    } else if (!message) {
      return NextResponse.json(
        { error: "メッセージ内容を入力してください。" },
        { status: 400 }
      );
    }

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const uuid = randomUUID();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "A:G",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            uuid,
            body.sendTime || "",
            body.personal || "",
            body.group || "",
            body.message || "",
            "送信待機", // 統一済み
            (body.personalIds || []).join(","),
          ],
        ],
      },
    });

    return NextResponse.json({ ok: true, id: uuid });
  } catch (err) {
    console.error("❌ スプレッドシート追加エラー:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * PATCH: 予約情報の更新
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, sendTime, personal, personalIds, group, message, status } =
      body;

    if (!id) {
      return NextResponse.json(
        { error: "予約IDが指定されていません。" },
        { status: 400 }
      );
    }

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "A1:G150",
    });

    const rows = res.data.values || [];
    const dataRows = rows.slice(1);
    const targetIndex = dataRows.findIndex((row) => row[0] === id);

    if (targetIndex === -1) {
      return NextResponse.json(
        { error: `ID「${id}」が見つかりません。` },
        { status: 404 }
      );
    }

    const rowNumber = targetIndex + 2;
    const oldRow = dataRows[targetIndex];
    const newPersonalIds =
      Array.isArray(personalIds) && personalIds.length > 0
        ? personalIds.join(",")
        : oldRow[6] || "";

    const updatedRow = [
      id,
      sendTime,
      personal,
      group,
      message,
      status,
      newPersonalIds,
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `A${rowNumber}:G${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [updatedRow] },
    });

    return NextResponse.json({ success: true, updated: updatedRow });
  } catch (err: any) {
    console.error("❌ PATCH エラー:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * DELETE: 指定した予約IDのデータを削除
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "削除する予約IDが指定されていません。" },
        { status: 400 }
      );
    }

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 現在のデータ取得
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "A1:G150",
    });

    const rows = res.data.values || [];
    const header = rows[0];
    const dataRows = rows.slice(1);

    // 対象行の検索
    const targetIndex = dataRows.findIndex((row) => row[0] === id);

    if (targetIndex === -1) {
      return NextResponse.json(
        { error: `ID「${id}」が見つかりません。` },
        { status: 404 }
      );
    }

    // 対象行を削除（配列上から）
    dataRows.splice(targetIndex, 1);

    // 新しい配列（ヘッダー含む）として再書き込み
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: "A1:G150",
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: "A1",
      valueInputOption: "RAW",
      requestBody: {
        values: [header, ...dataRows],
      },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error("❌ DELETE エラー:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
