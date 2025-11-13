// src/components/Contact/ContactList.jsx
// 問い合わせ一覧をテーブル形式で表示するコンポーネント
// APIから問い合わせデータを取得し、ステータスや担当者名も表示できるようにしている

import { useState, useEffect } from "react";
import { authorizedRequest } from "../services/authService"; // API認証付きリクエスト関数を利用

const ContactList = ({ onEdit, refreshTrigger, users }) => {
  // 問い合わせ一覧データ
  const [contacts, setContacts] = useState([]);
  // ローディング状態
  const [loading, setLoading] = useState(true);
  // エラー状態
  const [error, setError] = useState(null);

  // UID → displayName に変換する関数
  const getUserName = (uid) => {
    const user = users.find((u) => u.uid === uid);
    return user ? user.displayName : "担当者不明";
  };

  // 問い合わせデータをAPIから取得
  useEffect(() => {
    const fetchContacts = async () => {
      console.log("📄 ContactList: APIに問い合わせ一覧をリクエストします...");
      try {
        setLoading(true);
        const response = await authorizedRequest("GET", "/contacts");
        console.log("✅ ContactList: APIから受信:", response);

        // 配列でない場合は空配列にする（安全対策）
        const data = Array.isArray(response) ? response : [];
        setContacts(data);
        setError(null);
      } catch (err) {
        console.error("❌ ContactList: 取得失敗:", err);
        setError("問い合わせの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [refreshTrigger]); // refreshTriggerが変わったら再取得

  // ローディング表示
  if (loading) {
    return <div className="text-center">データを読み込み中...</div>;
  }

  // エラー表示
  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">問い合わせ一覧</h2>

      {/* 横スクロール対応 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* テーブルヘッダー */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                会社名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                顧客名
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

          {/* テーブル本体 */}
          <tbody className="bg-white divide-y divide-gray-200">
            {/* データが存在しない場合 */}
            {contacts.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  問い合わせはまだありません。
                </td>
              </tr>
            ) : (
              // データが存在する場合
              contacts.map((contact) => (
                <tr key={contact._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contact.customerName || "会社名なし"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contact.contactName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 truncate max-w-xs">
                      {contact.content}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* ステータスに応じた色付け */}
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
                    {/* 担当者が登録されていれば名前を表示 */}
                    {contact.assignedUserId
                      ? getUserName(contact.assignedUserId)
                      : "担当者不明"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* 編集ボタン */}
                    <button
                      onClick={() => onEdit(contact)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      編集
                    </button>
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
