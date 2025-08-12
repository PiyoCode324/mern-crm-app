// src/services/authService.js
import axios from "axios";
import { getAuth, signOut } from "firebase/auth";
import { jwtDecode } from "jwt-decode";
// import Dashboard from "../pages/Dashboard";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

let cachedToken = localStorage.getItem("token");
let cachedExp = cachedToken ? jwtDecode(cachedToken).exp : 0;
let refreshPromise = null;

/**
 * バックグラウンドでトークンを更新
 */
const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise; // 更新中なら同じPromiseを返す
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    await logout();
    throw new Error("リフレッシュトークンがありません");
  }

  refreshPromise = authApi
    .post("/auth/refresh-token", { refreshToken })
    .then((res) => {
      const { idToken } = res.data;
      cachedToken = idToken;
      cachedExp = jwtDecode(idToken).exp;
      localStorage.setItem("token", idToken);
      return idToken;
    })
    .catch(async (err) => {
      console.error("トークン更新失敗:", err);
      await logout();
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

/**
 * Axiosリクエスト前インターセプター
 */
authApi.interceptors.request.use(async (config) => {
  if (config.skipAuthInterceptor) {
    // インターセプターの処理をスキップ
    return config;
  }

  const now = Date.now() / 1000;

  console.log("🚀 interceptor: リクエスト前", { cachedToken, cachedExp, now });

  if (cachedToken && cachedExp - now < 5) {
    try {
      console.log("🔄 interceptor: トークン更新開始");
      const newToken = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${newToken}`;
      console.log("✅ interceptor: 新トークンセット", newToken);
      return config;
    } catch (e) {
      console.error("❌ interceptor: トークン更新失敗", e);
      return Promise.reject("トークン更新失敗");
    }
  }

  if (cachedToken) {
    config.headers.Authorization = `Bearer ${cachedToken}`;
    console.log("✅ interceptor: 既存トークンセット");
  } else {
    console.warn("⚠️ interceptor: トークンがありません");
  }
  return config;
});

/**
 * 共通のAPI呼び出し関数
 */
export const authorizedRequest = async (method, url, data = null) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser; // ログイン中のユーザーを取得

    // ユーザーがログインしていなければエラーをスロー
    if (!user) {
      throw new Error("ユーザーがログインしていません。");
    }

    // ここで最新のトークンを取得
    const idToken = await user.getIdToken();

    // axiosにトークンをセットしてリクエスト
    const res = await authApi({
      method,
      url,
      data: method.toLowerCase() === "get" ? null : data,
      headers: {
        Authorization: `Bearer ${idToken}`, // トークンをここでセット
      },
      skipAuthInterceptor: true, // ← インターセプターでこれがあると処理をスキップする
    });
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // 必要に応じてlogoutを呼び出す
      await logout();
      // return Dashboard;
    }
    throw error;
  }
};

/**
 * ログイン処理
 */
export const login = async (email, password) => {
  const res = await authApi.post("/users/login", { email, password });
  const { token, refreshToken } = res.data;
  cachedToken = token;
  cachedExp = jwtDecode(token).exp;
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
  return res.data;
};

/**
 * ログアウト処理（ページリロードなし）
 */
export const logout = async () => {
  const auth = getAuth();
  await signOut(auth);
  cachedToken = null;
  cachedExp = 0;
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  // React Routerを使ってログインページに遷移させる
  window.location.href = "/login";
};
