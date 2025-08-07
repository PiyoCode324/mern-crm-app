// src/pages/AdminUserPage.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";

const AdminUserPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      // 認証状態の確認が完了し、かつ管理者である場合のみ実行
      if (!authLoading && isAdmin) {
        try {
          // 新しいエンドポイント '/users/all' を呼び出す
          const response = await authorizedRequest("GET", "/users/all");
          // レスポンスの形式が { users: [...] } なので、usersキーからデータを取得
          setUsers(response.users);
        } catch (err) {
          console.error("ユーザー情報の取得に失敗しました:", err);
          setError("ユーザー情報の取得に失敗しました。");
        } finally {
          setPageLoading(false);
        }
      } else if (!authLoading && !isAdmin) {
        // 管理者ではない場合はエラーメッセージを表示
        setPageLoading(false);
        setError("管理者権限が必要です。");
      }
    };

    fetchUsers();
  }, [authLoading, isAdmin]);

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg">ユーザー情報を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        ユーザー管理
      </h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">ユーザーID</th>
              <th className="py-3 px-6 text-left">メールアドレス</th>
              <th className="py-3 px-6 text-left">役割</th>
              <th className="py-3 px-6 text-center">アクション</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {user._id}
                </td>
                <td className="py-3 px-6 text-left">{user.email}</td>
                <td className="py-3 px-6 text-left">{user.role}</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs">
                      役割変更
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserPage;
