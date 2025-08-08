// src/pages/AdminUserPage.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";

const AdminUserPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  // ユーザーリストを取得する関数
  const fetchUsers = async () => {
    try {
      const response = await authorizedRequest("GET", "/users/all");
      setUsers(response.users);
    } catch (err) {
      console.error("ユーザー情報の取得に失敗しました:", err);
      setError("ユーザー情報の取得に失敗しました。");
    } finally {
      setPageLoading(false);
    }
  };

  // 役割を切り替える関数
  const handleToggleRole = async (targetUserId, currentRole) => {
    // 自身のアカウントの役割は変更できないようにする
    if (user._id === targetUserId) {
      alert("自分の役割は変更できません。");
      return;
    }

    const newRole = currentRole === "admin" ? "user" : "admin";

    // 確認ダイアログ
    if (!window.confirm(`このユーザーの役割を '${newRole}' に変更しますか？`)) {
      return;
    }

    try {
      // バックエンドの役割更新APIを呼び出す
      await authorizedRequest("PUT", `/users/${targetUserId}/role`, {
        role: newRole,
      });

      // API呼び出し成功後、ユーザーリストを再取得してUIを更新
      await fetchUsers();
      alert("役割が正常に更新されました。");
    } catch (err) {
      console.error("役割の更新に失敗しました:", err);
      alert("役割の更新に失敗しました。管理者権限を確認してください。");
    }
  };

  useEffect(() => {
    // 認証状態の確認が完了し、かつ管理者である場合のみ実行
    if (!authLoading && isAdmin) {
      fetchUsers();
    } else if (!authLoading && !isAdmin) {
      // 管理者ではない場合はエラーメッセージを表示
      setPageLoading(false);
      setError("管理者権限が必要です。");
    }
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
            {users.map((item) => (
              <tr
                key={item._id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {item._id}
                </td>
                <td className="py-3 px-6 text-left">{item.email}</td>
                <td className="py-3 px-6 text-left">{item.role}</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center">
                    <button
                      onClick={() => handleToggleRole(item._id, item.role)}
                      className={`font-bold py-2 px-4 rounded-full text-xs transition duration-200 ease-in-out transform hover:scale-105
                        ${
                          item.role === "admin"
                            ? "bg-red-500 text-white hover:bg-red-700"
                            : "bg-blue-500 text-white hover:bg-blue-700"
                        }
                      `}
                    >
                      {item.role === "admin"
                        ? "ユーザーにする"
                        : "管理者にする"}
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
