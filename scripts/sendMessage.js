// scripts/sendMessage.js
import { getAccessToken } from "../auth/tokenManager.js";
import axios from "axios";

(async () => {
  try {
    console.log("🚀 メッセージ送信プロセス開始...");
    const tokenData = await getAccessToken();
    const accessToken = tokenData.access_token;

    console.log(
      "✅ アクセストークン取得成功:",
      accessToken.slice(0, 20) + "..."
    );

    console.log("📤 スプレッドシートの送信待ちメッセージ送信開始...");

    // ✅ Next.js APIにPOST要請
    const res = await axios.post("http://localhost:3000/api/bot/send", {
      accessToken,
    });

    console.log("✅ API応答:", res.data);
    console.log("🎉 全ての送信処理完了");
  } catch (err) {
    console.error("💥 メッセージ送信エラー:", err.message);
  }
})();
