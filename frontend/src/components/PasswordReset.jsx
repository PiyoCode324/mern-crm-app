// src/components/PasswordReset.jsx

import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // バックエンドのパスワードリセットAPIを呼び出す
      await axios.post(
        "http://localhost:5000/api/auth/request-password-reset",
        { email }
      );

      // 成功メッセージを表示
      toast.success(
        "パスワードリセットのメールを送信しました。メールをご確認ください。"
      );
      setEmail("");
    } catch (error) {
      // エラーメッセージを表示
      const errorMessage =
        error.response?.data?.message || "パスワードリセットに失敗しました。";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          パスワードリセット
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              メールアドレス
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "送信中..." : "パスワードリセットのリンクを送信"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;
