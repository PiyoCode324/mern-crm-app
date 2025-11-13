// src/components/CustomerList.jsx
// -----------------------------------------
// 顧客リスト表示コンポーネント
// 顧客情報の取得、編集、削除、詳細リンクを提供
// -----------------------------------------

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext"; // ユーザー認証情報を取得
import { authorizedRequest } from "../services/authService"; // 認証付きAPIリクエスト
import CustomerForm from "./CustomerForm"; // 顧客登録・編集フォーム
import { Link } from "react-router-dom"; // ルーティングリンク

const CustomerList = () => {
  const { user, token } = useAuth(); // ログインユーザー情報とトークンを取得
  const [customers, setCustomers] = useState([]); // 顧客一覧を格納
  const [error, setError] = useState(null); // エラーメッセージ
  const [editingCustomer, setEditingCustomer] = useState(null); // 編集対象の顧客

  // 顧客データ取得関数
  const fetchCustomers = useCallback(async () => {
    if (!user || !token) {
      setError("ログインしてください。");
      setCustomers([]); // 未ログイン時は空配列
      return;
    }

    try {
      // 認証付きAPIリクエスト
      const res = await authorizedRequest("GET", "/customers", token);

      if (Array.isArray(res)) {
        setCustomers(res); // 顧客一覧をセット
      } else {
        console.error("APIレスポンスの形式が不正です:", res);
        setCustomers([]);
      }

      setError(null); // エラーがなければリセット
    } catch (err) {
      console.error("顧客取得失敗:", err);
      setError("顧客情報の取得に失敗しました。");
    }
  }, [user, token]);

  // 初回レンダリング時と依存関係変更時にデータ取得
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // 顧客削除処理
  const handleDelete = async (customerId) => {
    if (!window.confirm("この顧客を削除してもよろしいですか？")) return;

    try {
      await authorizedRequest("DELETE", `/customers/${customerId}`, token);
      fetchCustomers(); // 削除後に最新データを取得
    } catch (err) {
      console.error("削除失敗:", err);
      setError("顧客の削除に失敗しました。");
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-8">
      {/* 顧客登録・編集フォーム */}
      <CustomerForm
        editingCustomer={editingCustomer} // 編集対象顧客
        onSuccess={() => {
          setEditingCustomer(null); // 更新後に編集モードを解除
          fetchCustomers(); // 最新データを取得
        }}
        onCancelEdit={() => setEditingCustomer(null)} // 編集キャンセル
      />

      <h2 className="text-xl font-bold mb-4 mt-8">顧客一覧</h2>

      {/* エラー表示 */}
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        // 顧客テーブル
        <table className="w-full border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">名前</th>
              <th className="border p-2">会社名</th>
              <th className="border p-2">ステータス</th>
              <th className="border p-2">メール</th>
              <th className="border p-2">電話</th>
              <th className="border p-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(customers) &&
              customers.map((c) => (
                <tr key={c._id}>
                  {/* 顧客名リンク */}
                  <td className="border p-2">
                    <Link
                      to={`/customers/${c._id}`}
                      className="text-blue-500 hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>

                  <td className="border p-2">{c.companyName}</td>
                  <td className="border p-2">{c.status}</td>
                  <td className="border p-2">{c.email}</td>
                  <td className="border p-2">{c.phone}</td>

                  {/* 編集・削除・詳細リンク */}
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => setEditingCustomer(c)}
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
                    <Link
                      to={`/customers/${c._id}`}
                      className="inline-block px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CustomerList;
