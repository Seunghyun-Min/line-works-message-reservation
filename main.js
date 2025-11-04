// main.js
import { getAccessToken } from "./auth/tokenManager.js";
import { getUserList } from "./app/api/users.js";

(async () => {
  try {
    console.log("🚀 トークン取得処理開始...");
    const tokenData = await getAccessToken();
    const accessToken = tokenData.access_token;

    console.log("\n🧾 トークン情報:");
    console.log(tokenData);

    console.log("\n👥 社員リスト取得中...");
    const users = await getUserList(accessToken);

    console.log("\n✅ 取得結果:");
    console.table(users);
  } catch (err) {
    console.error("💥 全体エラー:", err.message);
  }
})();
