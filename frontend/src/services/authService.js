// src/services/authService.js
import axios from "axios";
import { getAuth, signInWithCustomToken, signOut } from "firebase/auth"; // signOutを追加

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// axiosインスタンスの作成
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
 */
export const authorizedRequest = async (method, url, data = null) => {
  const config = {
    method,
    url,
    headers: {},
  };

  if (method.toLowerCase() !== "delete") {
    config.data = data;
    config.headers["Content-Type"] = "application/json";
  }

  try {
    const res = await authApi.request(config);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("認証エラー: トークンが無効です");
    }
    throw error;
  }
};

/**
 * ログイン関数
 */
export const login = async (email, password) => {
  try {
    const response = await authApi.post("/users/login", { email, password });
    const { token } = response.data;
    localStorage.setItem("token", token);
    return response.data;
  } catch (error) {
    console.error("ログインエラー:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * ログアウト関数
 */
export const logout = async () => {
  const auth = getAuth();
  await signOut(auth); // Firebaseからサインアウト
  localStorage.removeItem("token"); // localStorageからトークンを削除
};
