// auth/tokenManager.js

import "dotenv/config";
import axios from "axios";
import { URL } from "url";
import fs from "fs/promises";
import path from "path";
import readline from "readline";

const AUTH_URL = "https://auth.worksmobile.com/oauth2/v2.0/authorize";
const TOKEN_URL = "https://auth.worksmobile.com/oauth2/v2.0/token";

const clientId = process.env.CLIENT_ID;
const redirectUri = process.env.REDIRECT_URI;
const scope = process.env.SCOPE;
const clientSecret = process.env.CLIENT_SECRET;

const TOKEN_STORE = path.join(process.cwd(), ".tokens.json");

function buildAuthUrl() {
  const params = new URL(AUTH_URL);
  params.searchParams.set("client_id", clientId);
  params.searchParams.set("redirect_uri", redirectUri);
  params.searchParams.set(
    "scope",
    Array.isArray(scope) ? scope.join(" ") : scope.replace(/,/g, " ")
  );
  params.searchParams.set("response_type", "code");
  params.searchParams.set("state", "manual_state");
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

export { buildAuthUrl };

async function saveTokensToDisk(tokenData) {
  try {
    const expiresIn = tokenData.expires_in ? Number(tokenData.expires_in) : 0;
    console.log("Expires in:", expiresIn);
    console.log("Date.now:", Date.now());
    const obj = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresIn ? Date.now() + (expiresIn - 60) * 1000 : null,
    };
    await fs.writeFile(TOKEN_STORE, JSON.stringify(obj, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not save tokens to disk:", err.message || err);
  }
}

export { saveTokensToDisk };

async function loadTokensFromDisk() {
  try {
    const raw = await fs.readFile(TOKEN_STORE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

async function refreshAccessToken(refreshToken) {
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);

  const res = await axios.post(TOKEN_URL, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data;
}

/**
 * Returns a valid access token for server-side use.
 * - Uses stored tokens on disk
 * - Refreshes if expired
 */
export async function getServerAccessToken() {
  const stored = await loadTokensFromDisk();
  if (
    stored?.access_token &&
    stored.expires_at &&
    Date.now() < stored.expires_at
  ) {
    return stored.access_token;
  }

  if (stored?.refresh_token) {
    const newToken = await refreshAccessToken(stored.refresh_token);
    await saveTokensToDisk(newToken);
    return newToken.access_token;
  }

  throw new Error("No stored tokens available. Complete OAuth flow first.");
}

/**
 * Interactive version: prompts user to manually login if no tokens exist
 */
export async function getServerAccessTokenInteractive() {
  const stored = await loadTokensFromDisk();

  if (
    stored?.access_token &&
    stored.expires_at &&
    Date.now() < stored.expires_at
  ) {
    return stored.access_token;
  }

  if (stored?.refresh_token) {
    const newToken = await refreshAccessToken(stored.refresh_token);
    await saveTokensToDisk(newToken);
    return newToken.access_token;
  }

  // No token, prompt user
  console.log(
    "⚠️ サーバーにトークンがありません。ブラウザでログインして code を取得してください。"
  );
  console.log("ブラウザでアクセス:", buildAuthUrl());

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const code = await new Promise((resolve) => {
    rl.question("ブラウザで取得した code を入力してください: ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  const tokenData = await exchangeCodeForToken(code);
  await saveTokensToDisk(tokenData);
  console.log("✅ トークン保存完了");

  return tokenData.access_token;
}
