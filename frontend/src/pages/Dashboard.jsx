// pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({
    productName: "",
    unitPrice: "",
    quantity: "",
    saleDate: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchSales = async () => {
    const res = await axios.get("/api/sales");
    setSales(res.data);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalPrice = Number(form.unitPrice) * Number(form.quantity);

    if (editingId) {
      // 編集中
      try {
        await axios.put(`/api/sales/${editingId}`, {
          ...form,
          totalPrice,
        });
        setEditingId(null);
      } catch (err) {
        console.error("更新エラー:", err);
        alert("更新に失敗しました");
      }
    } else {
      // 新規登録
      try {
        await axios.post("/api/sales", {
          ...form,
          totalPrice,
        });
      } catch (err) {
        console.error("登録エラー:", err);
        alert("登録に失敗しました");
      }
    }

    setForm({
      productName: "",
      unitPrice: "",
      quantity: "",
      saleDate: "",
    });
    fetchSales();
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

  const handleDelete = async (id) => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      await axios.delete(`/api/sales/${id}`);
      fetchSales();
    } catch (err) {
      console.error("削除エラー:", err);
      alert("削除に失敗しました");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">売上管理ダッシュボード</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          type="text"
          name="productName"
          placeholder="商品名"
          value={form.productName}
          onChange={handleChange}
          required
          className="border p-2"
        />
        <input
          type="number"
          name="unitPrice"
          placeholder="単価"
          value={form.unitPrice}
          onChange={handleChange}
          required
          className="border p-2"
        />
        <input
          type="number"
          name="quantity"
          placeholder="数量"
          value={form.quantity}
          onChange={handleChange}
          required
          className="border p-2"
        />
        <input
          type="date"
          name="saleDate"
          value={form.saleDate}
          onChange={handleChange}
          required
          className="border p-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 col-span-1 md:col-span-2"
        >
          {editingId ? "更新する" : "登録する"}
        </button>
      </form>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">商品名</th>
            <th className="border p-2">単価</th>
            <th className="border p-2">数量</th>
            <th className="border p-2">合計金額</th>
            <th className="border p-2">日付</th>
            <th className="border p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale._id}>
              <td className="border p-2">{sale.productName}</td>
              <td className="border p-2">{sale.unitPrice}</td>
              <td className="border p-2">{sale.quantity}</td>
              <td className="border p-2">{sale.totalPrice}</td>
              <td className="border p-2">{sale.saleDate.slice(0, 10)}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleEdit(sale)}
                  className="bg-yellow-400 px-2 py-1 mr-2"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(sale._id)}
                  className="bg-red-500 text-white px-2 py-1"
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
