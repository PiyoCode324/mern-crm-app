// src/pages/CustomerDetailPage.jsx

import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";
import ContactForm from "../components/ContactForm";
import ContactList from "../components/ContactList";
import { Link } from "react-router-dom";

const CustomerDetailPage = () => {
  const { user } = useAuth();
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 問い合わせ機能の状態管理
  const [editingContact, setEditingContact] = useState(null);
  const [refreshContacts, setRefreshContacts] = useState(0);

  const fetchCustomer = useCallback(async () => {
    if (!user) {
      setError("ログインしてください。");
      setLoading(false);
      return;
    }
    try {
      const res = await authorizedRequest("GET", `/customers/${customerId}`);
      setCustomer(res);
    } catch (err) {
      console.error("顧客情報取得エラー:", err);
      setError(err.response?.data?.error || "顧客情報の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [user, customerId]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleContactSuccess = () => {
    setRefreshContacts((prev) => prev + 1);
    setEditingContact(null);
  };

  const handleCancelEdit = () => {
    setEditingContact(null);
  };

  if (loading) return <div className="p-6">読み込み中...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!customer) return <div className="p-6">顧客が見つかりません。</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">顧客詳細: {customer.name}</h2>
        <Link
          to={`/customers/edit/${customer._id}`}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          顧客情報を編集
        </Link>
      </div>
      <div className="bg-white p-4 rounded shadow-md border mb-8">
        <p>メールアドレス: {customer.email}</p>
        <p>電話番号: {customer.phone}</p>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4">活動履歴</h3>

      {/* 問い合わせ登録/編集フォーム */}
      <div className="border p-4 rounded shadow-md bg-white mb-8">
        <ContactForm
          customerId={customerId}
          editingContact={editingContact}
          onSuccess={handleContactSuccess}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      <div className="mt-8">
        <ContactList
          customerId={customerId}
          onEdit={setEditingContact}
          refreshTrigger={refreshContacts}
        />
      </div>
    </div>
  );
};

export default CustomerDetailPage;
