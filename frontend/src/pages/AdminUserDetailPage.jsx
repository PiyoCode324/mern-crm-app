// src/pages/AdminUserDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // URLパラメータ取得
import { useAuth } from "../context/AuthContext"; // 認証・管理者判定
import { authorizedRequest } from "../services/authService"; // 認証付きAPI呼び出し
import LoadingSpinner from "../components/LoadingSpinner"; // 読み込み表示
import ErrorMessage from "../components/ErrorMessage"; // エラー表示

const AdminUserDetailPage = () => {
  const { userId } = useParams(); // URLからuserIdを取得
  const { isAdmin, loading: authLoading } = useAuth(); // 管理者権限判定
  const [user, setUser] = useState(null); // 取得ユーザー情報
  const [loading, setLoading] = useState(true); // ページ読み込み状態
  const [error, setError] = useState(null); // エラー状態

  useEffect(() => {
    // 認証完了かつ管理者の場合のみデータ取得
    if (!authLoading && isAdmin) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const response = await authorizedRequest("GET", `/users/${userId}`);
          setUser(response.user);
        } catch (err) {
          console.error("Failed to fetch user details:", err);
          setError("ユーザー情報の取得に失敗しました。");
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else if (!authLoading && !isAdmin) {
      setLoading(false);
      setError("管理者権限が必要です。");
    }
  }, [userId, authLoading, isAdmin]);

  // ローディング中表示
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ErrorMessage message={error} />
      </div>
    );
  }

  // ユーザーが取得できなかった場合
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ErrorMessage message="ユーザーが見つかりません。" />
      </div>
    );
  }

  // 成功時の詳細表示
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2 text-center">
          ユーザー詳細: {user.displayName || user.email}
        </h1>

        <div className="space-y-4">
          {/* UID */}
          <div className="flex items-center">
            <p className="font-bold text-gray-700 w-1/3">ユーザーID (UID):</p>
            <p className="text-gray-600 font-mono break-all w-2/3">
              {user.uid}
            </p>
          </div>

          {/* MongoDB ID */}
          <div className="flex items-center">
            <p className="font-bold text-gray-700 w-1/3">MongoDB ID:</p>
            <p className="text-gray-600 font-mono break-all w-2/3">
              {user._id}
            </p>
          </div>

          {/* 表示名 */}
          <div className="flex items-center">
            <p className="font-bold text-gray-700 w-1/3">表示名:</p>
            <p className="text-gray-600 w-2/3">
              {user.displayName || "設定なし"}
            </p>
          </div>

          {/* メール */}
          <div className="flex items-center">
            <p className="font-bold text-gray-700 w-1/3">メールアドレス:</p>
            <p className="text-gray-600 w-2/3">{user.email}</p>
          </div>

          {/* 役割 */}
          <div className="flex items-center">
            <p className="font-bold text-gray-700 w-1/3">役割:</p>
            <p className="text-gray-600 w-2/3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                  user.role === "admin"
                    ? "bg-purple-200 text-purple-800"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {user.role}
              </span>
            </p>
          </div>

          {/* アカウント状態 */}
          <div className="flex items-center">
            <p className="font-bold text-gray-700 w-1/3">アカウント状態:</p>
            <p className="text-gray-600 w-2/3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                  user.disabled
                    ? "bg-red-200 text-red-800"
                    : "bg-green-200 text-green-800"
                }`}
              >
                {user.disabled ? "無効" : "有効"}
              </span>
            </p>
          </div>

          {/* 作成日 */}
          {user.createdAt && (
            <div className="flex items-center">
              <p className="font-bold text-gray-700 w-1/3">作成日:</p>
              <p className="text-gray-600 w-2/3">
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
          )}

          {/* 最終ログイン */}
          {user.lastLoginAt && (
            <div className="flex items-center">
              <p className="font-bold text-gray-700 w-1/3">最終ログイン:</p>
              <p className="text-gray-600 w-2/3">
                {new Date(user.lastLoginAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
