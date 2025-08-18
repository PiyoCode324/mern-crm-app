// src/pages/TasksPage.jsx

import React, { useState, useEffect } from "react";
// authorizedRequest を authService からインポート
import { authorizedRequest } from "../services/authService";
// 認証状態の確認に AuthContext を使用
import { useAuth } from "../context/AuthContext";

import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import TaskDetails from "../components/TaskDetails";
import CustomModal from "../components/CustomModal";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // AuthContextは認証状態の確認のみに使用
  const { isAuthReady, user: currentUser } = useAuth();

  const fetchInitialData = async () => {
    try {
      // authorizedRequest を使用してすべてのデータを取得
      const [fetchedUsers, fetchedTasks, fetchedCustomers, fetchedSales] =
        await Promise.all([
          authorizedRequest("get", "/users/basic"),
          authorizedRequest("get", "/tasks"),
          authorizedRequest("get", "/customers"),
          authorizedRequest("get", "/sales"),
        ]);

      // APIレスポンスをコンソールに出力して確認
      console.log("Fetched Users:", fetchedUsers);
      console.log("Fetched Tasks:", fetchedTasks);

      // ここを修正：APIレスポンスの形式に合わせてデータをセット
      // /users/basicが{"users": [...]}形式で返される場合
      setUsers(fetchedUsers.users);

      setTasks(fetchedTasks);
      setCustomers(fetchedCustomers);
      setSales(fetchedSales);
    } catch (err) {
      console.error(err);
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 認証が完了したらデータをフェッチ
    if (isAuthReady) {
      fetchInitialData();
    }
  }, [isAuthReady]);

  const handleOpenFormModal = (task = null) => {
    setSelectedTask(task);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setSelectedTask(null);
    setIsFormModalOpen(false);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (selectedTask) {
        await authorizedRequest("put", `/tasks/${selectedTask._id}`, taskData);
      } else {
        await authorizedRequest("post", "/tasks", taskData);
      }
      fetchInitialData();
      handleCloseFormModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedTask(null);
    setIsDetailsModalOpen(false);
  };

  const handleOpenDeleteConfirm = (task) => {
    setSelectedTask(task);
    setIsConfirmModalOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setSelectedTask(null);
    setIsConfirmModalOpen(false);
  };

  const handleDeleteTask = async () => {
    try {
      if (selectedTask) {
        await authorizedRequest("delete", `/tasks/${selectedTask._id}`);
        fetchInitialData();
        handleCloseDeleteConfirm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !isAuthReady)
    return <p className="text-center mt-20">データを読み込み中...</p>;

  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">タスク一覧</h1>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => handleOpenFormModal()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          新規タスク追加
        </button>
      </div>
      <TaskList
        tasks={tasks}
        users={users}
        customers={customers}
        sales={sales}
        currentUserUid={currentUser?.uid}
        onEdit={handleOpenFormModal}
        onDelete={handleOpenDeleteConfirm}
        onViewDetails={handleViewDetails}
      />

      {/* タスクフォームモーダル */}
      <TaskForm
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleSaveTask}
        task={selectedTask}
        users={users}
        customers={customers}
        sales={sales}
      />

      {/* タスク詳細モーダル */}
      <CustomModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      >
        <TaskDetails
          task={selectedTask}
          users={users}
          customers={customers}
          sales={sales}
          onClose={handleCloseDetailsModal}
        />
      </CustomModal>

      {/* 削除確認モーダル */}
      <CustomModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseDeleteConfirm}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">タスク削除の確認</h2>
          <p className="mb-6">
            タスク「{selectedTask?.title}」を本当に削除しますか？
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCloseDeleteConfirm}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              キャンセル
            </button>
            <button
              onClick={handleDeleteTask}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              削除
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default TasksPage;
