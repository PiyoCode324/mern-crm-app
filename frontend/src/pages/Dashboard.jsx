// src/components/Dashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";
import Modal from "../components/Modal";

const Dashboard = () => {
  const { user, token } = useAuth();
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({
    productName: "",
    unitPrice: "",
    quantity: "",
    saleDate: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  const fetchSales = useCallback(async () => {
    if (!user || !token) {
      console.log("ユーザーまたはトークンがありません。");
      setSales([]);
      return;
    }
    try {
      // authorizedRequestはデータそのものを直接返すので、res.dataではなくresを使用
      const res = await authorizedRequest("GET", "/api/sales", token);
      if (Array.isArray(res)) {
        setSales(res);
      } else {
        console.error("APIレスポンスの形式が不正です:", res);
        setSales([]);
      }
    } catch (err) {
      console.error("売上取得失敗:", err);
      setModalConfig({
        title: "エラー",
        message: "売上情報の取得に失敗しました。",
        onConfirm: () => setShowModal(false),
        isConfirmOnly: true,
      });
      setShowModal(true);
      setSales([]);
    }
  }, [user, token]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

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
    const totalPrice = Number(form.unitPrice) * Number(form.quantity);
    const requestData = { ...form, totalPrice };
    try {
      if (editingId) {
        await authorizedRequest(
          "PUT",
          `/api/sales/${editingId}`,
          token,
          requestData
        );
        setEditingId(null);
      } else {
        await authorizedRequest("POST", "/api/sales", token, requestData);
      }
      setForm({ productName: "", unitPrice: "", quantity: "", saleDate: "" });
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
      productName: sale.productName,
      unitPrice: sale.unitPrice,
      quantity: sale.quantity,
      saleDate: sale.saleDate.slice(0, 10),
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
      await authorizedRequest("DELETE", `/api/sales/${id}`, token);
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

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans">
      {showModal && <Modal {...modalConfig} />}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        売上管理ダッシュボード
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          売上登録・編集
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        >
          <input
            type="text"
            name="productName"
            placeholder="商品名"
            value={form.productName}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            name="unitPrice"
            placeholder="単価"
            value={form.unitPrice}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            name="quantity"
            placeholder="数量"
            value={form.quantity}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="date"
            name="saleDate"
            value={form.saleDate}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="p-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200 lg:col-span-1"
          >
            {editingId ? "更新する" : "登録する"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({
                  productName: "",
                  unitPrice: "",
                  quantity: "",
                  saleDate: "",
                });
              }}
              className="p-3 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200 lg:col-span-1"
            >
              キャンセル
            </button>
          )}
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">売上一覧</h2>
        {Array.isArray(sales) && sales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    単価
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    数量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    合計金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日付
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
                      {sale.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sale.unitPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sale.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sale.totalPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sale.saleDate.slice(0, 10)}
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
          <p className="text-gray-500">売上データがありません。</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
