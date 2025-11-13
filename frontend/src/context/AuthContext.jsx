// src/context/AuthContext.jsx
// Firebase認証の状態をグローバルに管理するコンテキスト
// ユーザー情報・トークン・管理者権限・ロード状態などを保持し、
// アプリ全体で認証情報を共有可能にする

import { createContext, useEffect, useState, useContext } from "react";
import { onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";
import { logout as apiLogout } from "../services/authService";
import api from "../utils/api";

// AuthContextを作成
const AuthContext = createContext();

// AuthProviderコンポーネント
// children配下で useAuth() を使って認証情報を取得可能
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Firebaseユーザー情報
  const [token, setToken] = useState(null); // Firebase IDトークン
  const [isAdmin, setIsAdmin] = useState(false); // 管理者フラグ
  const [loading, setLoading] = useState(true); // ロード中フラグ
  const [isAuthReady, setIsAuthReady] = useState(false); // 認証初期化完了フラグ

  // Firebase認証状態監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("🔄 onAuthStateChanged fired:", currentUser);
      if (currentUser) {
        try {
          // IDトークンとカスタムクレームを取得
          const idToken = await currentUser.getIdToken();
          const idTokenResult = await currentUser.getIdTokenResult();
          const claims = idTokenResult.claims;

          setUser(currentUser);
          setToken(idToken);
          setIsAdmin(claims?.role === "admin");

          console.log("✅ AuthContext: ユーザーがログインしました", {
            uid: currentUser.uid,
            isAdmin: claims?.role === "admin",
            claims,
          });
        } catch (error) {
          console.error(
            "❌ AuthContext: IDトークンの取得に失敗しました",
            error
          );
          setUser(null);
          setToken(null);
          setIsAdmin(false);
        }
      } else {
        // ログアウト状態
        setUser(null);
        setToken(null);
        setIsAdmin(false);
        console.log("❌ AuthContext: ユーザーはログアウトしました");
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    // クリーンアップ：監視解除
    return () => {
      console.log("🔚 onAuthStateChanged listener解除");
      unsubscribe();
    };
  }, []);

  // ログアウト関数
  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  // パスワードリセットメール送信
  const handlePasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("✅ パスワードリセットメールを送信しました");
      return { success: true };
    } catch (error) {
      console.error("❌ パスワードリセットエラー:", error);
      return { success: false, error: error.message };
    }
  };

  // Contextで提供する値
  const value = {
    user,
    token,
    isAdmin,
    loading,
    isAuthReady,
    logout: handleLogout,
    passwordReset: handlePasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// バックエンドにユーザーを登録する関数
const registerUserInBackend = async (idToken, userData) => {
  try {
    console.log("🚀 バックエンドへの登録開始:", userData);
    const res = await api.post("/users/register", userData, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    console.log("✅ バックエンドへの登録成功:", res.data);

    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      await firebaseUser.getIdToken(true); // トークンを強制更新
      console.log("✅ IDトークンの強制更新成功");
    }
  } catch (error) {
    console.error("❌ バックエンド登録エラー:", error.response || error);
    if (error.response?.status === 404) {
      console.error(
        "⚠️ エラー: 404 Not Found - バックエンドのルート設定を確認してください。"
      );
    } else {
      console.error("⚠️ エラー詳細:", error.response?.data?.message);
    }
    throw error;
  }
};

// カスタムフックで簡単にContext利用
const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth, registerUserInBackend };
