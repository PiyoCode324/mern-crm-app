// src/pages/SalesPage.jsx

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext"; // 認証情報取得用カスタムフック
import { authorizedRequest } from "../services/authService"; // 認証付きAPIリクエスト関数
import Modal from "../components/Modal"; // 汎用モーダルコンポーネント
import { Link } from "react-router-dom"; // ルーティング用リンク
import SalesForm from "../components/SalesForm"; // 案件登録・編集フォーム

const SalesPage = () => {
  const { user, token } = useAuth(); // ログインユーザー情報とトークン
  const [sales, setSales] = useState([]); // 案件一覧を保持
  const [editingSale, setEditingSale] = useState(null); // 編集中の案件データ
  const [showModal, setShowModal] = useState(false); // モーダル表示フラグ
  const [modalConfig, setModalConfig] = useState({}); // モーダル設定
  const [customers, setCustomers] = useState([]); // 顧客一覧を保持

  // 顧客リストを取得する関数（案件表示やSalesFormで使用）
  const fetchCustomers = useCallback(async () => {
    if (!user || !token) return; // 未ログインの場合は取得しない
    try {
      const res = await authorizedRequest("GET", "/customers");
      if (Array.isArray(res)) {
        setCustomers(res); // 顧客一覧をstateに保存
      }
    } catch (err) {
      console.error("顧客リストの取得に失敗しました:", err);
    }
  }, [user, token]);

  // 案件リストを取得する関数
  const fetchSales = useCallback(async () => {
    if (!user || !token) {
      setSales([]); // 未ログインの場合は空配列
      return;
    }
    try {
      const res = await authorizedRequest("GET", "/sales");
      if (Array.isArray(res)) {
        setSales(res); // 案件一覧をstateに保存
      } else {
        console.error("APIレスポンスの形式が不正です:", res);
        setSales([]);
      }
    } catch (err) {
      console.error("案件取得失敗:", err);
      setModalConfig({
        title: "エラー",
        message: "案件情報の取得に失敗しました。",
        onConfirm: () => setShowModal(false),
        isConfirmOnly: true,
      });
      setShowModal(true);
      setSales([]);
    }
  }, [user, token]);

  // 初回レンダリング時に案件と顧客情報を取得
  useEffect(() => {
    fetchSales();
    fetchCustomers();
  }, [fetchSales, fetchCustomers]);

  // 編集ボタン押下時の処理
  const handleEdit = (sale) => {
    setEditingSale(sale); // 編集対象の案件をstateにセット
  };

  // 削除確認モーダルを表示
  const handleDelete = (id) => {
    setModalConfig({
      title: "削除確認",
      message: "本当に削除しますか？",
      onConfirm: () => {
        confirmDelete(id); // 確認後に削除実行
        setShowModal(false);
      },
      onCancel: () => setShowModal(false), // キャンセル時はモーダル非表示
      isConfirmOnly: false, // キャンセルボタンも表示
    });
    setShowModal(true);
  };

  // 案件削除処理
  const confirmDelete = async (id) => {
    if (!user || !token) {
      setModalConfig({
        title: "エラー",
        message: "ログインしてください",
        onConfirm: () => setShowModal(false),
        isConfirmOnly: true,
      });
      setShowModal(true);
      return;
    }
    try {
      await authorizedRequest("DELETE", `/sales/${id}`); // APIで削除
      fetchSales(); // 削除後、案件一覧を再取得
    } catch (err) {
      console.error("削除エラー:", err);
      setModalConfig({
        title: "エラー",
        message: "削除に失敗しました",
        onConfirm: () => setShowModal(false),
        isConfirmOnly: true,
      });
      setShowModal(true);
    }
  };

  // 顧客IDから顧客名を取得するヘルパー関数
  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c._id === customerId);
    return customer ? customer.companyName : "顧客情報なし";
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans">
      {/* モーダル表示 */}
      {showModal && <Modal {...modalConfig} />}

      <h1 className="text-3xl font-bold text-gray-800 mb-6">営業案件管理</h1>

      {/* 案件登録・編集フォーム */}
      <div className="mb-8">
        <SalesForm
          editingSale={editingSale} // 編集中案件を渡す
          onSuccess={() => {
            fetchSales(); // 登録/編集成功後に案件一覧を再取得
            setEditingSale(null); // 編集状態を解除
          }}
          onCancelEdit={() => setEditingSale(null)} // キャンセル時に編集状態を解除
        />
      </div>

      {/* 案件一覧表示 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">案件一覧</h2>
        {Array.isArray(sales) && sales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    案件名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    顧客
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    案件金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    期限日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    {/* 案件名リンク */}
                    <td className="px-6 py-4 whitespace-nowrap text-blue-600 hover:underline">
                      <Link to={`/sales/${sale._id}`}>{sale.dealName}</Link>
                    </td>
                    {/* 顧客名 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCustomerName(sale.customerId)}
                    </td>
                    {/* 金額 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      ¥{sale.amount.toLocaleString()}
                    </td>
                    {/* ステータス */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sale.status}
                    </td>
                    {/* 期限日 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sale.dueDate
                        ? new Date(sale.dueDate).toLocaleDateString()
                        : "未設定"}
                    </td>
                    {/* 編集・削除ボタン */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(sale)}
                          className="bg-yellow-400 text-white px-3 py-1 rounded-md hover:bg-yellow-500 transition-colors duration-200"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(sale._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors duration-200"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">案件データがありません。</p>
        )}
      </div>
    </div>
  );
};

export default SalesPage;
