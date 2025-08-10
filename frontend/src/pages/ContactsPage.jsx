// src/pages/ContactsPage.jsx (修正版)

import { useState } from "react";
// Linkコンポーネントは不要になるため削除
// import { Link } from "react-router-dom";
import ContactForm from "../components/ContactForm";
import ContactList from "../components/ContactList";

const ContactsPage = () => {
  const [editingContact, setEditingContact] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // ✅ 新規フォームの表示状態を管理するstateを追加
  const [showNewForm, setShowNewForm] = useState(false);

  const handleSuccess = () => {
    setEditingContact(null);
    // ✅ 新規フォームも閉じる
    setShowNewForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  // ✅ フォームを閉じるための共通の関数
  const handleCancel = () => {
    setEditingContact(null);
    setShowNewForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">問い合わせ管理</h1>

      <div className="flex justify-end mb-4">
        {/* ✅ 新規フォームを表示するボタンに変更 */}
        <button
          onClick={() => setShowNewForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          新規問い合わせ登録
        </button>
      </div>

      {/* ✅ editingContact または showNewForm が true の場合にフォームを表示 */}
      {(editingContact || showNewForm) && (
        <ContactForm
          contact={editingContact}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      <div>
        <ContactList
          onEdit={setEditingContact}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
};

export default ContactsPage;
