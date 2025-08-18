// src/components/TaskForm.jsx
import React, { useState, useEffect } from "react";
import CustomModal from "./CustomModal";

const TaskForm = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  users,
  customers,
  sales,
  onCustomerSelect,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [customer, setCustomer] = useState("");
  const [salesId, setSalesId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filteredSales, setFilteredSales] = useState([]);

  // task が変わったらフィールドを更新
  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setAssignedTo(task.assignedTo || "");
      setCustomer(task.customer || "");
      setSalesId(task.sales || "");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    } else {
      setTitle("");
      setDescription("");
      setAssignedTo("");
      setCustomer("");
      setSalesId("");
      setDueDate("");
    }
  }, [task]);

  // 顧客選択時に案件をフィルタリング
  useEffect(() => {
    try {
      if (customer && sales) {
        const relatedSales = sales.filter((s) => s.customerId === customer);
        setFilteredSales(relatedSales);
        if (task?.sales && relatedSales.some((s) => s._id === task.sales)) {
          setSalesId(task.sales);
        } else {
          setSalesId("");
        }
      } else {
        setFilteredSales([]);
        setSalesId("");
      }
    } catch (err) {
      console.error("❌ 案件のフィルタリング中にエラー:", err);
      setFilteredSales([]);
    }
  }, [customer, sales, task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      title,
      description,
      assignedTo, // Firebase UID をそのまま送信
      customer,
      sales: salesId,
      dueDate,
    };
    onSubmit(formData);
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">
          {task ? "タスクを編集" : "新規タスク作成"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full"
            required
          />
          <textarea
            placeholder="説明"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full"
          />

          {/* 顧客選択 */}
          <select
            value={customer}
            onChange={(e) => {
              setCustomer(e.target.value);
              onCustomerSelect(e.target.value);
            }}
            className="border p-2 w-full"
            required
          >
            <option value="">顧客を選択</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.companyName || c.name}
              </option>
            ))}
          </select>

          {/* 案件選択 */}
          <select
            value={salesId}
            onChange={(e) => setSalesId(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">案件を選択（任意）</option>
            {filteredSales.map((s) => (
              <option key={s._id} value={s._id}>
                {s.dealName}
              </option>
            ))}
          </select>

          {/* 担当者選択（UIDで照合） */}
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="border p-2 w-full"
            required
          >
            <option value="">担当者を選択</option>
            {users &&
              users.map((user) => (
                <option key={user.uid} value={user.uid}>
                  {user.name}
                </option>
              ))}
          </select>

          {/* 期日設定 */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border p-2 w-full"
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </CustomModal>
  );
};

export default TaskForm;
