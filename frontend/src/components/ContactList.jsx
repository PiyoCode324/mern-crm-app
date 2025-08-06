// src/components/ContactList.jsx (修正版)

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";

const ContactList = ({ onEdit, customerId, refreshTrigger }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState({}); // ✅ 修正: 担当者IDとユーザー名を紐づけるための状態
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    if (!user) {
      setError("ログインしてください。");
      setContacts([]);
      return;
    }

    try {
      const url = customerId
        ? `/contacts?customerId=${customerId}`
        : `/contacts`;

      const res = await authorizedRequest("GET", url);
      if (Array.isArray(res)) {
        setContacts(res);

        // ✅ 修正: 問い合わせの担当者情報を取得
        const assignedUserIds = [
          ...new Set(res.map((c) => c.assignedUserId)),
        ].filter((id) => id);
        if (assignedUserIds.length > 0) {
          const usersRes = await authorizedRequest(
            "GET",
            `/users?ids=${assignedUserIds.join(",")}`
          );
          const usersMap = usersRes.reduce((acc, curr) => {
            acc[curr.uid] = curr.displayName;
            return acc;
          }, {});
          setUsers(usersMap);
        } else {
          setUsers({});
        }
      } else {
        console.error("APIレスポンスの形式が不正です:", res);
        setContacts([]);
        setUsers({});
      }
      setError(null);
    } catch (err) {
      console.error("問い合わせ取得失敗:", err);
      setError(
        err.response?.data?.error || "問い合わせ情報の取得に失敗しました。"
      );
    }
  }, [user, customerId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts, refreshTrigger]);

  const handleDelete = async (contactId) => {
    if (!window.confirm("この問い合わせを削除してもよろしいですか？")) return;

    try {
      await authorizedRequest("DELETE", `/contacts/${contactId}`);
      fetchContacts();
    } catch (err) {
      console.error("削除失敗:", err);
      setError(err.response?.data?.error || "問い合わせの削除に失敗しました。");
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
              <th className="border p-2">内容</th>
              <th className="border p-2">ステータス</th>
              <th className="border p-2">担当者</th>
              <th className="border p-2">作成日時</th>
              <th className="border p-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c._id}>
                <td className="border p-2">{c.contactName}</td>
                <td className="border p-2">{c.contactEmail}</td>
                <td className="border p-2 whitespace-pre-wrap">{c.content}</td>
                <td className="border p-2">{c.responseStatus}</td>
                <td className="border p-2">
                  {/* ✅ 修正: assignedUserIdから担当者名を表示 */}
                  {c.assignedUserId
                    ? users[c.assignedUserId] || "不明"
                    : "未割り当て"}
                </td>
                <td className="border p-2">
                  {new Date(c.createdAt).toLocaleString()}
                </td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => onEdit(c)}
                    className="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded text-xs"
                  >
                    編集
                  </button>
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
