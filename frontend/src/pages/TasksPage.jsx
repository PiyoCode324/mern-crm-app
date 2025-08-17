// src/pages/TasksPage.jsx

import React, { useState, useEffect } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../utils/taskApi";
import { getUsers } from "../utils/userApi";
import { useAuth } from "../context/AuthContext";
import { getCustomers } from "../utils/customerApi";
import { getSales } from "../utils/salesApi";

// コンポーネントのインポート
import TaskList from "../components/TaskList";
import CustomModal from "../components/CustomModal";
import Modal from "../components/Modal";

// 新しいコンポーネント: タスクフォームと詳細表示
const TaskForm = ({ task, users, customers, sales, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    assignedTo: "",
    dueDate: "",
    customerId: "",
    saleId: "",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        id: task.id,
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        assignedTo: task.assignedTo || "",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
        customerId: task.customerId || "",
        saleId: task.saleId || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        assignedTo: "",
        dueDate: "",
        customerId: "",
        saleId: "",
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">
        {task ? "タスクを編集" : "新規タスク追加"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">タイトル</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">説明</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            ステータス
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todo">未着手</option>
            <option value="in-progress">進行中</option>
            <option value="completed">完了</option>
            <option value="on-hold">保留</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">担当者</label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">担当者を選択</option>
            {users.map((user) => (
              <option key={user.uid} value={user.uid}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">期日</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">顧客</label>
          <select
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">顧客を選択</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">案件</label>
          <select
            name="saleId"
            value={formData.saleId}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">案件を選択</option>
            {sales.map((sale) => (
              <option key={sale.id} value={sale.id}>
                {sale.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-300"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  );
};

const TaskDetails = ({ task, users, customers, sales, onClose }) => {
  if (!task) return null;

  const assignedUser = users.find((u) => u.uid === task.assignedTo);
  const customer = customers.find((c) => c.id === task.customerId);
  const sale = sales.find((s) => s.id === task.saleId);

  const getStatusText = (status) => {
    switch (status) {
      case "todo":
        return "未着手";
      case "in-progress":
        return "進行中";
      case "completed":
        return "完了";
      case "on-hold":
        return "保留";
      default:
        return status;
    }
  };

  const formatDueDate = (date) => {
    try {
      if (!date) return "未定";
      const d = new Date(date);
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    } catch {
      return "日付エラー";
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
      <div className="space-y-4 text-gray-700">
        <div>
          <span className="font-semibold">説明:</span>
          <p className="whitespace-pre-line">{task.description}</p>
        </div>
        <div>
          <span className="font-semibold">ステータス:</span>{" "}
          {getStatusText(task.status)}
        </div>
        <div>
          <span className="font-semibold">担当者:</span>{" "}
          {assignedUser?.name || "未割り当て"}
        </div>
        <div>
          <span className="font-semibold">期日:</span>{" "}
          {formatDueDate(task.dueDate)}
        </div>
        <div>
          <span className="font-semibold">顧客:</span>{" "}
          {customer?.name || "未指定"}
        </div>
        <div>
          <span className="font-semibold">案件:</span> {sale?.name || "未指定"}
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // モーダル関連の状態
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { isAuthReady, user: currentUser } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);

  console.log("TasksPage: currentUser:", currentUser);
  console.log("TasksPage: currentUser?.uid:", currentUser?.uid);

  useEffect(() => {
    if (currentUser?.claims?.role === "admin") {
      setIsAdmin(true);
    }
  }, [currentUser]);

  const fetchInitialData = async () => {
    try {
      const [fetchedUsers, fetchedTasks, fetchedCustomers, fetchedSales] =
        await Promise.all([getUsers(), getTasks(), getCustomers(), getSales()]);

      setUsers(fetchedUsers);
      setTasks(fetchedTasks);
      setCustomers(fetchedCustomers);
      setSales(fetchedSales);
    } catch (err) {
      console.error("❌ データ取得に失敗しました:", err);
      setError(`データの取得に失敗しました: ${err.message}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthReady) {
      fetchInitialData();
    }
  }, [isAuthReady]);

  // タスクの追加または編集モーダルを開く関数
  const handleOpenFormModal = (task = null) => {
    setSelectedTask(task);
    setIsFormModalOpen(true);
  };

  // タスクの追加または編集モーダルを閉じる関数
  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedTask(null);
  };

  // タスクの追加または編集を処理する関数
  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        await updateTask(taskData.id, taskData);
      } else {
        await createTask(taskData);
      }
      fetchInitialData();
      handleCloseFormModal();
    } catch (err) {
      console.error("タスクの保存に失敗しました:", err);
      alert("タスクの保存に失敗しました。");
    }
  };

  // タスク詳細モーダルを開く関数
  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  // タスク詳細モーダルを閉じる関数
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedTask(null);
  };

  // 編集ボタンクリック時の処理
  const handleEditTask = (task) => {
    handleOpenFormModal(task);
  };

  // 削除確認モーダルを開く関数
  const handleOpenDeleteConfirm = (task) => {
    setSelectedTask(task);
    setIsConfirmModalOpen(true);
  };

  // 削除確認モーダルを閉じる関数
  const handleCloseDeleteConfirm = () => {
    setIsConfirmModalOpen(false);
    setSelectedTask(null);
  };

  // 削除実行関数
  const handleDeleteTask = async () => {
    try {
      if (selectedTask) {
        await deleteTask(selectedTask.id);
        fetchInitialData();
        handleCloseDeleteConfirm();
      }
    } catch (err) {
      console.error("タスクの削除に失敗しました:", err);
      alert("タスクの削除に失敗しました。");
    }
  };

  if (loading || !isAuthReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-gray-700">
          データを読み込み中...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        <p className="text-xl font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">タスク一覧</h1>
      {isAdmin && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => handleOpenFormModal()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            新規タスク追加
          </button>
        </div>
      )}
      <TaskList
        tasks={tasks}
        users={users}
        customers={customers}
        sales={sales}
        currentUserUid={currentUser?.uid}
        onViewDetails={handleViewDetails}
        onEdit={handleEditTask}
        onDelete={handleOpenDeleteConfirm}
        isAdmin={isAdmin}
      />
      {/* タスクの追加・編集モーダル */}
      <CustomModal isOpen={isFormModalOpen} onClose={handleCloseFormModal}>
        <TaskForm
          task={selectedTask}
          users={users}
          customers={customers}
          sales={sales}
          onSave={handleSaveTask}
          onClose={handleCloseFormModal}
        />
      </CustomModal>
      {/* タスク詳細表示モーダル */}
      <CustomModal isOpen={isViewModalOpen} onClose={handleCloseViewModal}>
        <TaskDetails
          task={selectedTask}
          users={users}
          customers={customers}
          sales={sales}
          onClose={handleCloseViewModal}
        />
      </CustomModal>
      {/* 削除確認モーダル */}
      <CustomModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseDeleteConfirm}
      >
        <Modal
          title="タスク削除の確認"
          message={`タスク「${selectedTask?.title}」を本当に削除しますか？`}
          onConfirm={handleDeleteTask}
          onCancel={handleCloseDeleteConfirm}
        />
      </CustomModal>
    </div>
  );
};

export default TasksPage;
