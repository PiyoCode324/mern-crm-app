// src/pages/AdminUserPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";
import ActivityLog from "../components/ActivityLog";

const AdminUserPage = () => {
  // 現在ログイン中のユーザー情報、管理者権限、認証ロード状態を取得
  const { user, isAdmin, loading: authLoading } = useAuth();

  // ユーザー一覧データを格納
  const [users, setUsers] = useState([]);
  // ページ単位のローディング状態
  const [pageLoading, setPageLoading] = useState(true);
  // エラーメッセージ格納
  const [error, setError] = useState(null);
  // 検索フォームの入力値
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * ユーザー一覧を取得する関数
   * @param {string} searchQuery - 検索文字列（メールアドレス or 表示名）
   */
  const fetchUsers = async (searchQuery = "") => {
    try {
      setPageLoading(true); // ローディング開始
      // 検索クエリがあればURLに追加、なければ全件取得
      const url = searchQuery
        ? `/users/all?search=${searchQuery}`
        : "/users/all";
      // 認証付きリクエストでユーザー一覧を取得
      const response = await authorizedRequest("GET", url);
      // 取得成功時にstate更新
      setUsers(response.users);
    } catch (err) {
      console.error("ユーザー情報の取得に失敗しました:", err);
      // エラー時に表示用stateを更新
      setError("ユーザー情報の取得に失敗しました。");
    } finally {
      setPageLoading(false); // ローディング終了
    }
  };

  /**
   * 検索ボタン押下またはEnterで検索実行
   */
  const handleSearch = () => {
    fetchUsers(searchTerm);
  };

  /**
   * ユーザーの役割を切り替える関数
   * 自分自身の役割変更は禁止
   * ※ window.confirm() は簡易UI。将来的にはカスタムモーダルに置き換え
   * @param {string} targetUid - 対象ユーザーUID
   * @param {string} currentRole - 現在の役割 ("admin" or "user")
   */
  const handleToggleRole = async (targetUid, currentRole) => {
    if (user.uid === targetUid) {
      console.log("自分の役割は変更できません。");
      return;
    }
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`このユーザーの役割を '${newRole}' に変更しますか？`))
      return;

    try {
      // サーバーへPUTリクエストで役割を更新
      await authorizedRequest("PUT", `/users/${targetUid}/role`, {
        role: newRole,
      });
      // 更新後にユーザー一覧を再取得して画面更新
      await fetchUsers(searchTerm);
      console.log("役割が正常に更新されました。");
    } catch (err) {
      console.error("役割の更新に失敗しました:", err);
      console.log("役割の更新に失敗しました。管理者権限を確認してください。");
    }
  };

  /**
   * ユーザーアカウントの有効/無効を切り替える関数
   * 自分自身の無効化は禁止
   * @param {string} targetUid - 対象ユーザーUID
   * @param {boolean} isDisabled - 現在の無効状態
   */
  const handleToggleDisabled = async (targetUid, isDisabled) => {
    if (user.uid === targetUid) {
      console.log("自分のアカウントを無効化することはできません。");
      return;
    }
    const newDisabledStatus = !isDisabled;
    const action = newDisabledStatus ? "無効化" : "有効化";
    if (!window.confirm(`このユーザーアカウントを${action}しますか？`)) return;

    try {
      // サーバーへPUTリクエストでアカウント状態を更新
      await authorizedRequest("PUT", `/users/${targetUid}/disabled`, {
        disabled: newDisabledStatus,
      });
      // 更新後にユーザー一覧を再取得
      await fetchUsers(searchTerm);
      console.log(`アカウントが正常に${action}されました。`);
    } catch (err) {
      console.error("アカウント状態の更新に失敗しました:", err);
      console.log(
        "アカウント状態の更新に失敗しました。管理者権限を確認してください。"
      );
    }
  };

  /**
   * 初回レンダリングおよび認証情報変更時にユーザー一覧を取得
   */
  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchUsers(); // 管理者の場合のみ取得
    } else if (!authLoading && !isAdmin) {
      setPageLoading(false);
      setError("管理者権限が必要です。");
    }
  }, [authLoading, isAdmin]);

  // ページ全体が読み込み中の場合のUI
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg">ユーザー情報を読み込み中...</p>
      </div>
    );
  }

  // エラー発生時のUI
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  // メインのユーザー管理UI
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        ユーザー管理
      </h1>

      {/* 検索フォーム */}
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

      {/* ユーザー一覧テーブル */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto mb-8">
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
                  {/* ユーザーID */}
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {item._id}
                  </td>

                  {/* 表示名（クリックで詳細ページへ遷移） */}
                  <td className="py-3 px-6 text-left">
                    <Link
                      to={`/admin/users/${item.uid}`}
                      className="text-blue-500 hover:text-blue-700 hover:underline"
                    >
                      {item.displayName || "(表示名なし)"}
                    </Link>
                  </td>

                  {/* メールアドレス */}
                  <td className="py-3 px-6 text-left">{item.email}</td>

                  {/* 役割 */}
                  <td className="py-3 px-6 text-left">{item.role}</td>

                  {/* アカウント状態 */}
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

                  {/* アクションボタン */}
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center space-x-2">
                      {/* 役割切替ボタン */}
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

                      {/* 有効/無効切替ボタン */}
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
              // ユーザーが存在しない場合
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  ユーザーが見つかりません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 活動ログコンポーネント */}
      <ActivityLog />
    </div>
  );
};

export default AdminUserPage;
