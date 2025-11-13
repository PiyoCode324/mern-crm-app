// src/components/ProtectedRoute.jsx
// -----------------------------------------
// 認証済みユーザーのみアクセス可能なルートを保護するコンポーネント
// ・userが存在すればchildrenを表示
// ・userが存在しなければログインページへリダイレクト
// ・読み込み中は「読み込み中...」と表示
// -----------------------------------------

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); // AuthContextからユーザー情報とロード状態を取得

  // 読み込み中は簡易メッセージ表示
  if (loading) return <p>読み込み中...</p>;

  // 認証済みの場合はchildrenを表示、未認証の場合はログインページへ遷移
  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
