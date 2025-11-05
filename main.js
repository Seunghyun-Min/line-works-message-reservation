// main.js
import { getAccessToken } from "./auth/tokenManager.js";
import { getUserList } from "./app/api/users.js"; // ← 修正ポイント
import { sendPendingMessages } from "./app/api/bot/send/route.js";

(async () => {
  try {
    console.log("🚀 トークン取得処理開始...");
    const tokenData = await getAccessToken();
    const accessToken = tokenData.access_token;

    console.log("\n🧾 トークン情報:");
    console.log(tokenData);

    console.log("\n👥 社員リスト取得中...");
    const users = await getUserList(accessToken); // ← 関数名も一致させる

    console.log("\n✅ 取得結果:");
    console.table(users);
  } catch (err) {
    console.error("💥 全体エラー:", err.message);
  }
})();

(async () => {
  try {
    console.log("🚀 トークン取得処理開始...");
    const tokenData = await getAccessToken();
    const accessToken = tokenData.access_token;

    console.log(
      "✅ アクセストークン取得成功:",
      accessToken.slice(0, 20) + "..."
    );

    console.log("📤 スプレッドシートの送信待ちメッセージ送信開始...");
    await sendPendingMessages(accessToken);

    console.log("🎉 全ての送信処理完了");
  } catch (err) {
    console.error("💥 全体エラー:", err.message);
  }
})();
