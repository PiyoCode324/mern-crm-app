// src/pages/SalesPage.jsx

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";
import Modal from "../components/Modal";
import { Link } from "react-router-dom";

const SalesPage = () => {
  const { user, token } = useAuth();
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    dealName: "",
    customerId: "",
    amount: "",
    status: "見込み",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  // 顧客リストを取得する関数
  const fetchCustomers = useCallback(async () => {
    if (!user || !token) return;
    try {
      // ✅ authorizedRequestの引数からtokenを削除
      const res = await authorizedRequest("GET", "/customers");
      if (Array.isArray(res)) {
        setCustomers(res);
      }
    } catch (err) {
      console.error("顧客リストの取得に失敗しました:", err);
    }
  }, [user, token]);

  // 案件リストを取得する関数
  const fetchSales = useCallback(async () => {
    if (!user || !token) {
      setSales([]);
      return;
    }
    try {
      // ✅ authorizedRequestの引数からtokenを削除
      const res = await authorizedRequest("GET", "/sales");
      if (Array.isArray(res)) {
        setSales(res);
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

  useEffect(() => {
    fetchSales();
    fetchCustomers();
  }, [fetchSales, fetchCustomers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      if (editingId) {
        // ✅ authorizedRequestの引数からtokenを削除
        await authorizedRequest("PUT", `/sales/${editingId}`, form);
        setEditingId(null);
      } else {
        // ✅ authorizedRequestの引数からtokenを削除
        await authorizedRequest("POST", "/sales", form);
      }
      setForm({
        dealName: "",
        customerId: "",
        amount: "",
        status: "見込み",
        notes: "",
      });
      fetchSales();
    } catch (err) {
      console.error(editingId ? "更新エラー:" : "登録エラー:", err);
      setModalConfig({
        title: "エラー",
        message: editingId ? "更新に失敗しました" : "登録に失敗しました",
        onConfirm: () => setShowModal(false),
        isConfirmOnly: true,
      });
      setShowModal(true);
    }
  };

  const handleEdit = (sale) => {
    setForm({
      dealName: sale.dealName,
      customerId: sale.customerId,
      amount: sale.amount,
      status: sale.status,
      notes: sale.notes,
    });
    setEditingId(sale._id);
  };

  const handleDelete = (id) => {
    setModalConfig({
      title: "削除確認",
      message: "本当に削除しますか？",
      onConfirm: () => {
        confirmDelete(id);
        setShowModal(false);
      },
      onCancel: () => setShowModal(false),
      isConfirmOnly: false,
    });
    setShowModal(true);
  };

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
      // ✅ authorizedRequestの引数からtokenを削除
      await authorizedRequest("DELETE", `/sales/${id}`);
      fetchSales();
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

  // customerIdから顧客名を取得するヘルパー関数
  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c._id === customerId);
    return customer ? customer.companyName : "顧客情報なし"; // 会社名を表示するように変更
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans">
      {showModal && <Modal {...modalConfig} />}

      <h1 className="text-3xl font-bold text-gray-800 mb-6">営業案件管理</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          案件登録・編集
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        >
          <input
            type="text"
            name="dealName"
            placeholder="案件名"
            value={form.dealName}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            name="customerId"
            value={form.customerId}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">顧客を選択</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.companyName}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="amount"
            placeholder="案件金額"
            value={form.amount}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="見込み">見込み</option>
            <option value="提案中">提案中</option>
            <option value="交渉中">交渉中</option>
            <option value="契約済">契約済</option>
            <option value="失注">失注</option>
          </select>
          <textarea
            name="notes"
            placeholder="メモ"
            value={form.notes}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-full"
          />
          <button
            type="submit"
            className="p-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            {editingId ? "更新する" : "登録する"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({
                  dealName: "",
                  customerId: "",
                  amount: "",
                  status: "見込み",
                  notes: "",
                });
              }}
              className="p-3 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
            >
              キャンセル
            </button>
          )}
        </form>
      </div>

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
                    作成日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sale.dealName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCustomerName(sale.customerId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ¥{sale.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sale.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
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
