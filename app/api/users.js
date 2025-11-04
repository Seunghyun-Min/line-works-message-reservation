// app/api/users.js
import axios from "axios";

const USER_LIST_URL = "https://www.worksapis.com/v1.0/users";

/**
 * LINE WORKS のユーザー一覧を取得（ページング対応）
 */
export async function getUserList(accessToken) {
  let allUsers = [];
  let cursor = null;
  let page = 1;

  try {
    do {
      const url = cursor ? `${USER_LIST_URL}?cursor=${cursor}` : USER_LIST_URL;

      console.log(`📡 ユーザー取得中 (ページ ${page})...`);

      const res = await axios.get(url, {
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

      allUsers = [...allUsers, ...users];
      cursor = res.data.responseMetaData?.nextCursor || null;
      page++;
    } while (cursor);

    // --- 重複除去（userId基準） ---
    const uniqueUsers = Array.from(
      new Map(allUsers.map((u) => [u.userId, u])).values()
    );

    console.log(`👥 総ユーザー数: ${uniqueUsers.length}`);
    return uniqueUsers;
  } catch (err) {
    console.error(
      "❌ ユーザーリスト取得失敗:",
      err.response?.data || err.message
    );
    throw err;
  }
}
