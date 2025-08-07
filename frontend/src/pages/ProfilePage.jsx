// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signOut,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";

const ProfilePage = () => {
  const { user: firebaseUser, token, setToken, logout } = useAuth(); // ✅ logout関数を取得
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        navigate("/login");
        return;
      }
      try {
        await authorizedRequest("POST", "/users/register", null, token);
        const res = await authorizedRequest("GET", "/users/me", token);
        setProfile(res.user);
        setDisplayName(res.user.displayName || "");
      } catch (err) {
        console.error("ユーザー取得エラー", err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, navigate]);

  const reauthenticate = async (password) => {
    if (!firebaseUser) throw new Error("ユーザーが見つかりません");
    const credential = EmailAuthProvider.credential(
      firebaseUser.email,
      password
    );
    await reauthenticateWithCredential(firebaseUser, credential);
  };

  const handleUpdate = async () => {
    try {
      if (!firebaseUser) {
        throw new Error("ユーザー情報がありません");
      }

      if (displayName === profile.displayName || !displayName.trim()) {
        alert("変更がありません。または、表示名が空です。");
        return;
      }

      await updateProfile(firebaseUser, { displayName });
      const res = await authorizedRequest("PUT", "/users/me", { displayName });

      setProfile(res.user);
      alert("プロフィールを更新しました");
    } catch (err) {
      console.error("更新エラー", err);
      alert(
        "更新に失敗しました: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("本当にアカウントを削除しますか？");
    if (!confirmDelete) return;

    try {
      if (!firebaseUser || !token) {
        throw new Error("ユーザーまたはトークンがありません");
      }

      const password = window.prompt(
        "操作を続行するにはパスワードを再入力してください"
      );
      if (!password) {
        alert("パスワードが入力されませんでした。操作を中止します。");
        return;
      }

      await reauthenticate(password);
      await authorizedRequest("DELETE", "/users/me");
      await firebaseUser.delete();

      localStorage.removeItem("token");
      if (setToken) {
        setToken(null);
      }

      alert("アカウントを削除しました");
      navigate("/login");
    } catch (err) {
      console.error("削除エラー", err);
      if (err.code === "auth/requires-recent-login") {
        alert(
          "操作のために再ログインが必要です。ログアウトしてから再度ログインしてください。"
        );
        await signOut(auth);
        navigate("/login");
      } else {
        alert("削除に失敗しました: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">ユーザー情報が見つかりません</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          プロフィール
        </h2>

        <div className="mb-4">
          <p className="text-gray-600">
            <strong>メールアドレス:</strong> {profile.email}
          </p>
          <p className="text-gray-600">
            <strong>表示名:</strong> {profile.displayName || "名前未設定"}
          </p>
        </div>

        <div className="mb-6">
          <label
            htmlFor="displayName"
            className="block text-gray-700 font-semibold mb-2"
          >
            表示名:
          </label>
          <input
            id="displayName"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleUpdate}
            className="w-2/5 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            更新
          </button>
          <button
            onClick={handleDelete}
            className="w-2/5 bg-transparent text-red-600 font-bold py-3 rounded-lg border border-red-600 hover:bg-red-100 transition-colors"
          >
            アカウント削除
          </button>
        </div>

        {/* ✅ ログアウトボタンを追加 */}
        <button
          onClick={handleLogout}
          className="mt-4 w-full bg-gray-600 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
