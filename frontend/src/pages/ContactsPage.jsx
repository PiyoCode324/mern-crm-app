// src/pages/ContactsPage.jsx

import { useState, useEffect } from "react";
import { authorizedRequest } from "../services/authService";
import ContactForm from "../components/ContactForm";
import ContactList from "../components/ContactList";

const ContactsPage = () => {
  // 現在編集中の問い合わせ（編集モードの場合）
  const [editingContact, setEditingContact] = useState(null);
  // データ更新をトリガーするためのカウンター
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // 新規問い合わせフォーム表示フラグ
  const [showNewForm, setShowNewForm] = useState(false);

  // ユーザー一覧データ（問い合わせフォームで選択肢として使用）
  const [users, setUsers] = useState([]);

  /**
   * 初回レンダリング時に基本ユーザー情報を取得
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // 認証付きGETリクエストでユーザーの基本情報を取得
        const res = await authorizedRequest("get", "/users/basic");
        // レスポンスがオブジェクト形式なので、usersプロパティを抽出
        const usersData = res.users || [];
        setUsers(usersData);
        console.log("✅ Users取得成功:", usersData);
      } catch (err) {
        console.error("❌ Users取得失敗:", err);
      }
    };
    fetchUsers();
  }, []);

  /**
   * 問い合わせ登録または編集成功時の処理
   * - 編集モードを解除
   * - 新規フォーム表示を閉じる
   * - refreshTriggerを更新してContactListを再レンダリング
   */
  const handleSuccess = () => {
    setEditingContact(null);
    setShowNewForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  /**
   * 編集キャンセル時の処理
   * - 編集モードを解除
   * - 新規フォーム表示を閉じる
   */
  const handleCancel = () => {
    setEditingContact(null);
    setShowNewForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* ページタイトル */}
      <h1 className="text-2xl font-bold mb-4">問い合わせ管理</h1>

      {/* 新規問い合わせ作成ボタン */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowNewForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          新規問い合わせ登録
        </button>
      </div>

      {/* 編集中または新規作成フォームを表示 */}
      {(editingContact || showNewForm) && (
        <ContactForm
          contact={editingContact} // 編集対象の問い合わせデータ
          onSuccess={handleSuccess} // 保存成功時のコールバック
          onCancel={handleCancel} // キャンセル時のコールバック
          users={users} // 問い合わせフォーム用のユーザー選択肢
        />
      )}

      {/* 問い合わせ一覧表示 */}
      <div>
        <ContactList
          onEdit={setEditingContact} // 編集ボタン押下時に編集対象をセット
          refreshTrigger={refreshTrigger} // 更新トリガーで再レンダリング
          users={users} // ユーザー情報を渡してフォーム内で利用
        />
      </div>
    </div>
  );
};

export default ContactsPage;
