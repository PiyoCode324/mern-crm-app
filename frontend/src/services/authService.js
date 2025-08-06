// src/services/authService.js

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// リクエスト送信前に、localStorageからトークンを取得してヘッダーに設定するインターセプター
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 認証が必要なAPIリクエストを送信するヘルパー関数
 * @param {string} method - HTTPメソッド (例: 'get', 'post', 'put', 'delete')
 * @param {string} url - APIエンドポイントのURL (例: '/api/users/me')
 * @param {object} [data=null] - リクエストボディ
 * @returns {Promise<object>} APIレスポンスデータ
 */
// ✅ token 引数を削除
export const authorizedRequest = async (method, url, data = null) => {
  const config = {
    method,
    url,
    // headersはインターセプターで設定されるため、ここでは空でOK
    // ただし、Content-TypeはPOST/PUTで必要なので、条件付きで設定
    headers: {},
  };

  // DELETEメソッド以外の場合にのみdataとContent-Typeを設定
  if (method.toLowerCase() !== "delete") {
    // ✅ toLowerCase() を追加して堅牢に
    config.data = data;
    config.headers["Content-Type"] = "application/json";
  }

  try {
    const res = await authApi.request(config);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("認証エラー: トークンが無効です");
      // ここでログアウト処理などをトリガーすることも可能
    }
    throw error;
  }
};
