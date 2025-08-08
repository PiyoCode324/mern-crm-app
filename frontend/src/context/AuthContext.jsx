// src/context/AuthContext.jsx
import { createContext, useEffect, useState, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { logout as apiLogout } from "../services/authService";
import api from "../utils/api";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  // ✅ 認証状態の準備ができたかを示す新しい状態
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
      setLoading(false);
      // ✅ 認証状態の準備が完了したことを設定
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

  // ✅ isAuthReadyをvalueに追加
  const value = {
    user,
    token,
    isAdmin,
    loading,
    isAuthReady,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 💡 修正: ここに registerUserInBackend 関数を移動
const registerUserInBackend = async (idToken, userData) => {
  try {
    console.log("🚀 バックエンドへの登録開始:", userData);
    const res = await api.post("/users/register", userData, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    console.log("✅ バックエンドへの登録成功:", res.data);

    // 登録成功後、FirebaseのIDトークンを再取得してカスタムクレームを反映
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      await firebaseUser.getIdToken(true); // 強制的にトークンを更新
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
    throw error; // エラーを再スローしてRegister.jsxでキャッチ
  }
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth, registerUserInBackend };
