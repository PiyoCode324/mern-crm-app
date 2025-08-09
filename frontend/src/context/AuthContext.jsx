// src/context/AuthContext.jsx
import { createContext, useEffect, useState, useContext } from "react";
import { onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";
import { logout as apiLogout } from "../services/authService";
import api from "../utils/api";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // ✅ ローディング状態をtrueで初期化し、認証確認が完了するまで待機する
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const idTokenResult = await currentUser.getIdTokenResult();
          const claims = idTokenResult.claims;

          setUser(currentUser);
          setToken(await currentUser.getIdToken());
          setIsAdmin(claims?.role === "admin");

          console.log("✅ AuthContext: ユーザーがログインしました", {
            user: currentUser.uid,
            isAdmin: claims?.role === "admin",
            claims: claims,
          });
        } catch (error) {
          console.error(
            "❌ AuthContext: IDトークンの取得に失敗しました",
            error
          );
        }
      } else {
        setUser(null);
        setToken(null);
        setIsAdmin(false);

        console.log("❌ AuthContext: ユーザーはログアウトしました");
      }
      // ✅ 認証状態が確定したら、loadingとisAuthReadyを更新
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

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

const registerUserInBackend = async (idToken, userData) => {
  try {
    console.log("🚀 バックエンドへの登録開始:", userData);
    const res = await api.post("/users/register", userData, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    console.log("✅ バックエンドへの登録成功:", res.data);

    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      await firebaseUser.getIdToken(true);
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

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth, registerUserInBackend };
