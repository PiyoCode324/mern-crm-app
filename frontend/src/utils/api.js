// src/utils/api.js

import axios from "axios";
import { getAuth } from "firebase/auth";

// 環境変数からAPIのベースURLを取得
// ここでは VITE_API_BASE_URL が .env ファイルに設定されている想定
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Axiosインスタンスの作成
 * - baseURL: APIのベースURL
 * - headers: デフォルトでJSONを送受信するためのContent-Type設定
 *
 * このインスタンスを通してAPIリクエストを行うことで、
 * 共通の設定や認証処理を一元管理できる。
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * リクエストインターセプター
 * - リクエスト前にFirebase認証済みユーザーのIDトークンを取得
 * - Authorizationヘッダーに Bearer トークンとして自動設定
 *
 * これにより、各リクエストで毎回トークンを付与する処理を書く必要がなくなる。
 */
api.interceptors.request.use(
  async (config) => {
    // Firebase認証オブジェクトを取得
    const auth = getAuth();
    const user = auth.currentUser;

    // ユーザーがログインしている場合のみトークンを付与
    if (user) {
      try {
        // Firebase SDKでIDトークンを取得
        const token = await user.getIdToken();
        // Authorizationヘッダーにセット
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Firebase IDトークンの取得に失敗しました:", error);
        // トークン取得に失敗した場合はリクエストを中止
        return Promise.reject(error);
      }
    }

    return config;
  },
  (error) => {
    // リクエスト設定段階でエラーが発生した場合
    return Promise.reject(error);
  }
);

// 他のモジュールから import して利用可能
export default api;
