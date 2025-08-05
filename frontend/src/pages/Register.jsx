// src/pages/Register.jsx

import React, { useState } from "react";
import { auth } from "../firebase/config";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(""); // 表示名も受け取る場合
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      // Firebase登録後にMongoDBにも登録
      await registerUserInBackend();

      // 登録成功後、ダッシュボードへ遷移
      navigate("/login");
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  // MongoDBにユーザー登録
  const registerUserInBackend = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) return;

      const idToken = await user.getIdToken();

      const res = await api.post(
        "/users/register",
        { displayName }, // 表示名を送信
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      console.log("✅ ユーザー登録済み（MongoDB）:", res.data);
    } catch (error) {
      console.error("❌ バックエンドへの登録失敗:", error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">新規登録</h2>
      <form onSubmit={handleRegister}>
        <label className="block mb-2">
          メールアドレス
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 p-2 border rounded w-full"
          />
        </label>

        <label className="block mb-2">
          表示名（任意）
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          />
        </label>

        <label className="block mb-4">
          パスワード
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 p-2 border rounded w-full"
          />
        </label>

        {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 w-full"
        >
          登録する
        </button>
      </form>
    </div>
  );
}
