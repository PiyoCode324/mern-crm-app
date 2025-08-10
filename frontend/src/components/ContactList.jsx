// src/components/ContactList.jsx (修正版)

import { useState, useEffect } from "react";
import { authorizedRequest } from "../services/authService";
import { Link } from "react-router-dom";

const ContactList = ({ onEdit, refreshTrigger }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      console.log("📄 ContactList: APIに問い合わせ一覧をリクエストします...");
      try {
        setLoading(true);
        const response = await authorizedRequest("GET", "/contacts");
        console.log(
          "✅ ContactList: APIから以下のデータを受信しました:",
          response
        );
        // 修正: レスポンスが既にデータ配列であることを想定し、安全にセット
        const data = Array.isArray(response) ? response : [];
        setContacts(data);
        setError(null);
      } catch (err) {
        console.error("❌ ContactList: 問い合わせの取得に失敗しました:", err);
        setError("問い合わせの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [refreshTrigger]);

  if (loading) {
    return <div className="text-center">データを読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">問い合わせ一覧</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                会社名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                担当者名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                内容
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                担当者
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  問い合わせはまだありません。
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {contact.customerName
                        ? contact.customerName
                        : "会社名なし"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {contact.contactName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 truncate max-w-xs">
                      {contact.content}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        contact.responseStatus === "対応済み"
                          ? "bg-green-100 text-green-800"
                          : contact.responseStatus === "対応中"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {contact.responseStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.assignedUserId
                      ? contact.assignedUserId
                      : "担当者不明"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(contact)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      編集
                    </button>
                    {/* <Link to={`/contacts/${contact._id}`} className="text-blue-600 hover:text-blue-900">詳細</Link> */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactList;
