// src/components/ContactList.jsx

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";
import { Link } from "react-router-dom";

const ContactList = ({ customerId }) => {
  const { user, token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    if (!user || !token) {
      setError("ログインしてください。");
      setContacts([]);
      return;
    }

    if (!customerId) {
      setError("顧客IDが指定されていません");
      setContacts([]);
      return;
    }

    try {
      const res = await authorizedRequest(
        "GET",
        `/api/contacts?customerId=${customerId}`,
        token
      );
      if (Array.isArray(res)) {
        setContacts(res);
      } else {
        console.error("APIレスポンスの形式が不正です:", res);
        setContacts([]);
      }
      setError(null);
    } catch (err) {
      console.error("問い合わせ取得失敗:", err);
      setError("問い合わせ情報の取得に失敗しました。");
    }
  }, [user, token, customerId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = async (contactId) => {
    if (!window.confirm("この問い合わせを削除してもよろしいですか？")) return;

    try {
      await authorizedRequest("DELETE", `/api/contacts/${contactId}`, token);
      fetchContacts();
    } catch (err) {
      console.error("削除失敗:", err);
      setError("問い合わせの削除に失敗しました。");
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">問い合わせ一覧</h2>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : contacts.length === 0 ? (
        <p>問い合わせがありません。</p>
      ) : (
        <table className="w-full border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">名前</th>
              <th className="border p-2">メール</th>
              <th className="border p-2">メッセージ</th>
              <th className="border p-2">作成日時</th>
              <th className="border p-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c._id}>
                <td className="border p-2">{c.name}</td>
                <td className="border p-2">{c.email}</td>
                <td className="border p-2 whitespace-pre-wrap">{c.message}</td>
                <td className="border p-2">
                  {new Date(c.createdAt).toLocaleString()}
                </td>
                <td className="border p-2 space-x-2">
                  <Link
                    to={`/contacts/${c._id}/edit`}
                    className="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded text-xs"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ContactList;
