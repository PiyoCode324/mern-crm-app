// src/services/authService.js

// 必要なライブラリをインポート
import axios from "axios";
import { getAuth, signInWithCustomToken, signOut } from "firebase/auth";
import { jwtDecode } from "jwt-decode"; // JWTトークンをデコードするためのライブラリ

// 環境変数からAPIのベースURLを取得
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// すべてのAPIリクエストを処理するためのaxiosインスタンスを作成
const authApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @description リフレッシュトークンを使用して、新しいIDトークンを取得する関数
 * @returns {Promise<string>} 新しいIDトークン
 * @throws {Error} リフレッシュトークンがない場合、またはリフレッシュに失敗した場合
 */
const refreshAccessToken = async () => {
  try {
    // ローカルストレージからリフレッシュトークンを取得
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      // リフレッシュトークンがない場合はエラーをスロー
      throw new Error("リフレッシュトークンがありません。");
    }

    // バックエンドの新しいエンドポイントにリフレッシュトークンを送信
    const response = await authApi.post("/auth/refresh-token", {
      refreshToken,
    });

    const newIdToken = response.data.idToken;
    // ローカルストレージに新しいIDトークンを保存
    localStorage.setItem("token", newIdToken);

    // 💡 バックエンドが新しいリフレッシュトークンも返却する場合は、ここで更新する
    // localStorage.setItem("refreshToken", response.data.refreshToken);

    return newIdToken;
  } catch (error) {
    console.error("トークンのリフレッシュに失敗しました:", error);
    // トークン更新に失敗した場合は、ユーザーを強制的にログアウトさせる
    await logout();
    throw error;
  }
};

/**
 * @description すべてのAPIリクエスト送信前に実行されるインターセプター
 * トークンの有効期限をチェックし、期限切れの場合は自動で更新する
 */
authApi.interceptors.request.use(
  async (config) => {
    // ローカルストレージから現在のIDトークンを取得
    let token = localStorage.getItem("token");
    if (token) {
      try {
        // トークンをデコードして有効期限(exp)を取得
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // トークンが期限切れかどうかを比較
        if (decodedToken.exp < currentTime) {
          console.log("トークンが期限切れです。自動で更新します。");
          // 期限切れの場合、refreshAccessToken関数を呼び出して新しいトークンを取得
          const newToken = await refreshAccessToken();
          // リクエストヘッダーを新しいトークンに更新
          config.headers.Authorization = `Bearer ${newToken}`;
        } else {
          // トークンがまだ有効な場合はそのまま使用
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("トークンのデコードに失敗しました:", error);
        // トークンが不正な形式の場合はログアウト
        await logout();
        return Promise.reject(error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * @description 認証が必要なAPIリクエストを実行するための共通関数
 * この関数を呼び出すことで、トークン管理のロジックが自動で適用される
 * @param {string} method HTTPメソッド (GET, POST, PUT, DELETE)
 * @param {string} url リクエスト先のURL
 * @param {object} [data=null] リクエストボディのデータ
 * @returns {Promise<any>} APIからのレスポンスデータ
 * @throws {Error} APIリクエストに失敗した場合
 */
export const authorizedRequest = async (method, url, data = null) => {
  try {
    const res = await authApi({
      method,
      url,
      data: method.toLowerCase() === "get" ? null : data,
    });
    return res.data;
  } catch (error) {
    // APIからのレスポンスが401 (Unauthorized)の場合
    if (error.response?.status === 401) {
      console.error(
        "認証エラー: トークンが無効です。自動更新を試行しましたが失敗しました。"
      );
      // インターセプターでの自動更新も失敗したと判断し、ログアウトさせる
      await logout();
    }
    throw error;
  }
};

/**
 * @description ユーザーログインを実行し、トークンを保存する関数
 * @param {string} email ユーザーのメールアドレス
 * @param {string} password ユーザーのパスワード
 * @returns {Promise<object>} ログイン後のユーザー情報
 */
export const login = async (email, password) => {
  try {
    const response = await authApi.post("/users/login", { email, password });
    const { token, refreshToken } = response.data;
    // IDトークンとリフレッシュトークンの両方をローカルストレージに保存
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    return response.data;
  } catch (error) {
    console.error("ログインエラー:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * @description ユーザーログアウトを実行し、保存されたトークンを削除する関数
 */
export const logout = async () => {
  const auth = getAuth();
  await signOut(auth); // Firebaseの認証状態をクリア
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken"); // ローカルストレージのトークンを両方削除
  // ページをリロードして、すべてのコンポーネントの状態をリセット
  window.location.reload();
};
