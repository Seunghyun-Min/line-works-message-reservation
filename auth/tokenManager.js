// auth/tokenManager.js
import "dotenv/config";
import puppeteer from "puppeteer";
import axios from "axios";
import { URL } from "url";

const AUTH_URL = "https://auth.worksmobile.com/oauth2/v2.0/authorize";
const TOKEN_URL = "https://auth.worksmobile.com/oauth2/v2.0/token";

const clientId = process.env.CLIENT_ID;
const redirectUri = process.env.REDIRECT_URI;
const scope = process.env.SCOPE;
const clientSecret = process.env.CLIENT_SECRET;
const MODE = process.env.MODE || "manual"; // auto or manual

function buildAuthUrl() {
  const params = new URL(AUTH_URL);
  params.searchParams.set("client_id", clientId);
  params.searchParams.set("redirect_uri", redirectUri);
  params.searchParams.set(
    "scope",
    Array.isArray(scope) ? scope.join(" ") : scope.replace(/,/g, " ")
  );
  params.searchParams.set("response_type", "code");
  params.searchParams.set("state", "puppeteer_state");
  return params.toString();
}

async function exchangeCodeForToken(code) {
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("redirect_uri", redirectUri);

  const res = await axios.post(TOKEN_URL, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data;
}

/**
 * Puppeteerを使ってLINE WORKSにログインし、アクセストークンを返す
 */
export async function getAccessToken() {
  console.log("🔑 LINE WORKS 認証開始...");

  const authUrl = buildAuthUrl();
  console.log("Authorize URL:", authUrl);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(authUrl, { waitUntil: "networkidle2" });

    if (MODE === "auto" && process.env.LW_USER && process.env.LW_PASS) {
      console.log("🔁 自動ログインモード");

      // --- ユーザーID入力欄 ---
      const userSelector = "input[name='user_id'], input[type='text']";
      await page.waitForSelector(userSelector, { timeout: 10000 });
      await page.type(userSelector, process.env.LW_USER, { delay: 50 });

      // --- パスワード入力欄 ---
      const passSelector = "input[name='password'], input[type='password']";
      await page.waitForSelector(passSelector, { timeout: 10000 });
      await page.type(passSelector, process.env.LW_PASS, { delay: 50 });

      // --- ログインボタン ---
      const loginBtn = await page.$("#loginBtn, button[type='submit']");
      if (loginBtn) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "networkidle2" }),
          loginBtn.click(),
        ]);
      } else {
        console.warn(
          "⚠️ ログインボタンが見つかりませんでした。セレクタを確認してください。"
        );
      }

      console.log("✅ 自動ログイン処理完了");
    } else {
      console.log("👋 手動ログインモード: ログインしてから続行します...");
    }

    await new Promise((r) => setTimeout(r, 1000));
    await page.reload({ waitUntil: "networkidle2" });

    const currentUrl = page.url();
    const code = new URL(currentUrl).searchParams.get("code");
    if (!code) throw new Error("認可コードが取得できませんでした");

    console.log("✅ 認可コード取得:", code);

    const tokenData = await exchangeCodeForToken(code);
    console.log("✅ アクセストークン取得成功");
    return tokenData;
  } catch (err) {
    console.error("❌ 認証エラー:", err.message);
    throw err;
  } finally {
    await browser.close();
  }
}
