// src/pages/Login.jsx

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth"; // Firebaseのメール/パスワード認証関数
import { auth } from "../firebase/config"; // Firebase初期化済みauthオブジェクト
import { useNavigate, Link } from "react-router-dom"; // 画面遷移用のフックとリンクコンポーネント

// 簡易ログ関数：デバッグ用にコンソールに出力
const addLog = (msg) => {
  console.log(`[Login] ${msg}`);
};

export default function Login() {
  // フォーム入力のステート管理
  const [email, setEmail] = useState(""); // メールアドレス
  const [password, setPassword] = useState(""); // パスワード
  const [error, setError] = useState(""); // エラーメッセージ表示用

  const navigate = useNavigate(); // 画面遷移用フック

  // フォーム送信時のログイン処理
  const handleLogin = async (e) => {
    e.preventDefault(); // ページリロードを防ぐ
    setError(""); // 既存のエラーをリセット

    try {
      addLog("ログイン処理開始");

      // Firebaseでログイン処理
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      addLog(`ログイン成功: UID=${user.uid}`);

      // FirebaseユーザーのIDトークンを取得
      const token = await user.getIdToken();
      addLog(`IDトークンを取得しました: ${token.substring(0, 20)}...`);

      // 取得したIDトークンをlocalStorageに保存（認証維持用）
      localStorage.setItem("token", token);
      addLog("IDトークンをlocalStorageに保存しました");

      // ダッシュボード画面へ遷移
      navigate("/dashboard");
      addLog("ダッシュボードへ遷移しました");
    } catch (err) {
      // エラー時の処理
      console.error("ログインエラー詳細:", err);
      setError("ログインに失敗しました"); // ユーザー向けエラーメッセージ
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* ログインフォーム */}
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4 text-center">ログイン</h2>

        {/* エラーメッセージ表示 */}
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {/* メール入力 */}
        <input
          type="email"
          placeholder="メールアドレス"
          className="w-full p-2 mb-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* パスワード入力 */}
        <input
          type="password"
          placeholder="パスワード"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* ログインボタン */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          ログイン
        </button>

        {/* パスワードリセットリンク */}
        <p className="mt-4 text-center">
          <Link
            to="/password-reset"
            className="text-sm text-blue-600 underline"
          >
            パスワードをお忘れですか？
          </Link>
        </p>

        {/* 新規登録リンク */}
        <p className="mt-4">
          アカウントをお持ちでない方は{" "}
          <Link to="/register" className="text-blue-600 underline">
            新規登録
          </Link>
        </p>
      </form>
    </div>
  );
}
