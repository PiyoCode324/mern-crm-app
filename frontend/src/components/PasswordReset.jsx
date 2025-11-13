// src/components/PasswordReset.jsx
// -----------------------------------------
// パスワードリセット画面コンポーネント
// ・登録済みメールアドレスにパスワードリセットメールを送信
// ・入力バリデーション（メール形式）あり
// ・送信成功/失敗時にメッセージ表示
// -----------------------------------------

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const PasswordReset = () => {
  const { passwordReset } = useAuth(); // AuthContextからパスワードリセット関数を取得
  const [email, setEmail] = useState(""); // 入力メールアドレス
  const [message, setMessage] = useState(""); // 成功・失敗メッセージ
  const [isError, setIsError] = useState(false); // エラー判定
  const [emailError, setEmailError] = useState(""); // メール入力エラー

  // メールアドレス形式チェック用正規表現
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * メール入力変更時の処理
   * ・入力ごとにバリデーション実施
   */
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (newEmail === "") {
      setEmailError(""); // 空欄の場合はエラー表示なし
    } else if (!emailRegex.test(newEmail)) {
      setEmailError("無効なメールアドレス形式です。"); // メール形式不正
    } else {
      setEmailError(""); // 有効なメール形式
    }
  };

  /**
   * フォーム送信時の処理
   * ・メールアドレス形式チェック
   * ・パスワードリセットAPI呼び出し
   * ・結果に応じてメッセージ表示
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setEmailError("");

    // 最終バリデーション
    if (!emailRegex.test(email)) {
      setEmailError("有効なメールアドレスを入力してください。");
      return;
    }

    try {
      const result = await passwordReset(email); // パスワードリセット送信
      if (result.success) {
        setMessage(
          "✅ パスワードリセットメールを送信しました。メールをご確認ください。"
        );
      } else {
        setIsError(true);
        // Firebaseからのエラーコードを日本語化して表示
        if (result.error.includes("auth/user-not-found")) {
          setMessage("❌ このメールアドレスのユーザーは存在しません。");
        } else {
          setMessage(`❌ パスワードリセットに失敗しました: ${result.error}`);
        }
      }
    } catch (err) {
      setIsError(true);
      setMessage("❌ パスワードリセット中に予期せぬエラーが発生しました。");
    }
  };

  // メールアドレスが有効でない場合は送信ボタンを無効化
  const isButtonDisabled = !emailRegex.test(email);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          パスワードをリセットする
        </h2>
        <p className="text-center text-gray-600 mb-6">
          登録済みのメールアドレスを入力してください。
          <br />
          パスワードリセット用のメールを送信します。
        </p>

        {/* フォーム */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-bold mb-2"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                emailError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
              required
              aria-label="メールアドレス"
            />
            {/* メール入力エラー表示 */}
            {emailError && (
              <p className="text-red-500 text-sm mt-2">{emailError}</p>
            )}
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            className={`w-full font-bold py-3 px-4 rounded-lg transition duration-200 ${
              isButtonDisabled
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
            disabled={isButtonDisabled}
          >
            パスワードをリセットする
          </button>
        </form>

        {/* 成功・失敗メッセージ表示 */}
        {message && (
          <div
            className={`mt-4 p-4 rounded-lg text-center ${
              isError
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* ログインページへのリンク */}
        <div className="mt-6 text-center">
          <a href="/login" className="text-indigo-600 hover:underline">
            ログインページに戻る
          </a>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
