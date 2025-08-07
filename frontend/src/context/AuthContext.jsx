// src/context/AuthContext.jsx
import { createContext, useEffect, useState, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { logout as apiLogout } from "../services/authService"; // authServiceからlogoutをインポート

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
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
      } else {
        setUser(null);
        setToken(null);
        setIsAdmin(false);

        console.log("❌ AuthContext: ユーザーはログアウトしました");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await apiLogout(); // authServiceのlogoutを呼び出す
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  const value = { user, token, isAdmin, loading, logout: handleLogout }; // logout関数を公開

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
