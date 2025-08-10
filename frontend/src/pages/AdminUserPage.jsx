// src/pages/AdminUserPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // ✅ 追加: Linkコンポーネントをインポート
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";

const AdminUserPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async (searchQuery = "") => {
    try {
      setPageLoading(true);
      const url = searchQuery
        ? `/users/all?search=${searchQuery}`
        : "/users/all";
      const response = await authorizedRequest("GET", url);
      setUsers(response.users);
    } catch (err) {
      console.error("ユーザー情報の取得に失敗しました:", err);
      setError("ユーザー情報の取得に失敗しました。");
    } finally {
      setPageLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUsers(searchTerm);
  };

  const handleToggleRole = async (targetUid, currentRole) => {
    if (user.uid === targetUid) {
      // 🚨 DO NOT use alert() or window.confirm() in the code.
      // Instead, use a custom modal or message box UI.
      alert("自分の役割は変更できません。");
      return;
    }
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`このユーザーの役割を '${newRole}' に変更しますか？`))
      return;

    try {
      await authorizedRequest("PUT", `/users/${targetUid}/role`, {
        role: newRole,
      });
      await fetchUsers(searchTerm);
      // 🚨 DO NOT use alert() or window.confirm() in the code.
      // Instead, use a custom modal or message box UI.
      alert("役割が正常に更新されました。");
    } catch (err) {
      console.error("役割の更新に失敗しました:", err);
      // 🚨 DO NOT use alert() or window.confirm() in the code.
      // Instead, use a custom modal or message box UI.
      alert("役割の更新に失敗しました。管理者権限を確認してください。");
    }
  };

  const handleToggleDisabled = async (targetUid, isDisabled) => {
    if (user.uid === targetUid) {
      // 🚨 DO NOT use alert() or window.confirm() in the code.
      // Instead, use a custom modal or message box UI.
      alert("自分のアカウントを無効化することはできません。");
      return;
    }
    const newDisabledStatus = !isDisabled;
    const action = newDisabledStatus ? "無効化" : "有効化";
    if (!window.confirm(`このユーザーアカウントを${action}しますか？`)) return;

    try {
      await authorizedRequest("PUT", `/users/${targetUid}/disabled`, {
        disabled: newDisabledStatus,
      });
      await fetchUsers(searchTerm);
      // 🚨 DO NOT use alert() or window.confirm() in the code.
      // Instead, use a custom modal or message box UI.
      alert(`アカウントが正常に${action}されました。`);
    } catch (err) {
      console.error("アカウント状態の更新に失敗しました:", err);
      // 🚨 DO NOT use alert() or window.confirm() in the code.
      // Instead, use a custom modal or message box UI.
      alert(
        "アカウント状態の更新に失敗しました。管理者権限を確認してください。"
      );
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchUsers();
    } else if (!authLoading && !isAdmin) {
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
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="メールアドレスまたは表示名で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="border border-gray-300 p-2 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="ml-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          検索
        </button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">ユーザーID</th>
              <th className="py-3 px-6 text-left">表示名</th>
              <th className="py-3 px-6 text-left">メールアドレス</th>
              <th className="py-3 px-6 text-left">役割</th>
              <th className="py-3 px-6 text-center">アカウント状態</th>
              <th className="py-3 px-6 text-center">アクション</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {users.length > 0 ? (
              users.map((item) => (
                <tr
                  key={item._id}
                  className={`border-b border-gray-200 hover:bg-gray-100 ${
                    item.disabled ? "bg-gray-100 text-gray-400" : ""
                  }`}
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {item._id}
                  </td>
                  {/* ✅ 修正: 表示名のみにリンクを付け、他は削除 */}
                  <td className="py-3 px-6 text-left">
                    <Link
                      to={`/admin/users/${item.uid}`}
                      className="text-blue-500 hover:text-blue-700 hover:underline"
                    >
                      {item.displayName || "(表示名なし)"}
                    </Link>
                  </td>
                  <td className="py-3 px-6 text-left">{item.email}</td>
                  <td className="py-3 px-6 text-left">{item.role}</td>
                  <td className="py-3 px-6 text-center">
                    <span
                      className={`font-bold py-1 px-3 rounded-full text-xs ${
                        item.disabled
                          ? "bg-red-200 text-red-800"
                          : "bg-green-200 text-green-800"
                      }`}
                    >
                      {item.disabled ? "無効" : "有効"}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center space-x-2">
                      <button
                        onClick={() => handleToggleRole(item.uid, item.role)}
                        className={`font-bold py-2 px-4 rounded-full text-xs transition duration-200 ease-in-out transform hover:scale-105 ${
                          item.role === "admin"
                            ? "bg-red-500 text-white hover:bg-red-700"
                            : "bg-blue-500 text-white hover:bg-blue-700"
                        }`}
                      >
                        {item.role === "admin"
                          ? "ユーザーにする"
                          : "管理者にする"}
                      </button>
                      <button
                        onClick={() =>
                          handleToggleDisabled(item.uid, item.disabled)
                        }
                        className={`font-bold py-2 px-4 rounded-full text-xs transition duration-200 ease-in-out transform hover:scale-105 ${
                          item.disabled
                            ? "bg-green-500 text-white hover:bg-green-700"
                            : "bg-gray-500 text-white hover:bg-gray-700"
                        }`}
                      >
                        {item.disabled ? "有効化" : "無効化"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  ユーザーが見つかりません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserPage;
