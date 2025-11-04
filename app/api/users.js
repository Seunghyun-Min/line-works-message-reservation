// api/users.js
import axios from "axios";

const USER_LIST_URL = "https://www.worksapis.com/v1.0/users";

/**
 * LINE WORKS のユーザー一覧を取得
 */
export async function getUserList(accessToken) {
  try {
    const res = await axios.get(USER_LIST_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const users = res.data.users.map((u) => ({
      userId: u.userId,
      name: `${u.userName?.lastName || ""}${u.userName?.firstName || ""}`,
      phonetic: `${u.userName?.phoneticLastName || ""}${
        u.userName?.phoneticFirstName || ""
      }`,
    }));

    console.log(`👥 ユーザー数: ${users.length}`);
    return users;
  } catch (err) {
    console.error(
      "❌ ユーザーリスト取得失敗:",
      err.response?.data || err.message
    );
    throw err;
  }
}
