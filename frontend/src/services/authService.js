// src/services/authService.js

import axios from "axios";
import { getAuth, signOut } from "firebase/auth";
import { getApp } from "firebase/app";

// 環境変数からAPIのベースURLを取得
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Firebaseアプリの初期化
// NOTE: main.jsxなどでFirebaseを初期化済みであることが前提
const firebaseApp = getApp();
const auth = getAuth(firebaseApp);

// Axiosインスタンスを作成（全てのリクエストで共通設定）
const authApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * Axiosリクエスト前インターセプター
 * すべての認証済みリクエストにFirebaseトークンを自動で付与
 */
authApi.interceptors.request.use(async (config) => {
  const user = auth.currentUser; // 現在ログイン中のユーザー情報を取得

  // ユーザーが未ログイン、またはトークン不要なリクエストの場合はスキップ
  if (!user || config.skipAuth) {
    console.warn(
      "⚠️ interceptor: ユーザーがログインしていないか、認証が不要なリクエストです。"
    );
    return config;
  }

  try {
    // Firebase SDKがトークンの有効期限をチェック・自動更新してくれる
    const idToken = await user.getIdToken();
    config.headers.Authorization = `Bearer ${idToken}`; // Authorizationヘッダーにトークンをセット
    console.log(
      "✅ interceptor: Firebaseから取得したトークンをセットしました。"
    );
  } catch (error) {
    console.error("❌ interceptor: トークン取得に失敗しました", error);
    // トークン取得失敗時はリクエストを中止
    return Promise.reject(new Error("Firebaseトークンの取得に失敗しました。"));
  }

  return config;
});

/**
 * 共通のAPI呼び出し関数
 * 認証トークンの付与はインターセプターに任せる
 *
 * @param {string} method - HTTPメソッド ("get", "post", "put", "delete"など)
 * @param {string} url - エンドポイントのURL
 * @param {object|null} data - リクエストボディ（POST/PUT用）
 * @returns {Promise<any>} APIレスポンスのデータ
 */
export const authorizedRequest = async (method, url, data = null) => {
  try {
    const res = await authApi({
      method,
      url,
      // GETリクエストはbodyを送らない
      data: method.toLowerCase() === "get" ? null : data,
    });
    return res.data;
  } catch (error) {
    // 401 Unauthorizedの場合、トークンが無効なのでログアウト
    if (error.response?.status === 401) {
      console.error(
        "401 Unauthorized - トークンが無効です。ログアウトします。"
      );
      await logout();
    }
    throw error; // その他のエラーは呼び出し元にスロー
  }
};

/**
 * ログアウト処理
 * Firebaseサインアウト + ローカルストレージ削除 + ログイン画面にリダイレクト
 */
export const logout = async () => {
  await signOut(auth); // Firebaseからサインアウト
  localStorage.removeItem("refreshToken"); // リフレッシュトークンを削除
  window.location.href = "/login"; // ログイン画面にリダイレクト
};
