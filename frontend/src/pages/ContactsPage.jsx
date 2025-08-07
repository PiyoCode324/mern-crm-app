// src/pages/ContactsPage.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import ContactForm from "../components/ContactForm"; // 修正: ContactFormをインポート
import ContactList from "../components/ContactList";

const ContactsPage = () => {
  const [editingContact, setEditingContact] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // フォームの送信成功時にリストを更新する関数
  const handleSuccess = () => {
    setEditingContact(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">問い合わせ管理</h1>

      {/* 修正: editingContactが存在する場合のみContactFormを表示 */}
      {editingContact ? (
        <ContactForm contact={editingContact} onSuccess={handleSuccess} />
      ) : (
        <div className="flex justify-end mb-4">
          <Link
            to="/contacts/new"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            新規問い合わせ登録
          </Link>
        </div>
      )}

      {/* 問い合わせ一覧 */}
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
