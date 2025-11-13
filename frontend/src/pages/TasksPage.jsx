// src/pages/TasksPage.jsx

import React, { useState, useEffect } from "react";
import { authorizedRequest } from "../services/authService"; // 認証付きAPIリクエスト用関数
import { useAuth } from "../context/AuthContext"; // Firebase認証コンテキスト

import TaskList from "../components/TaskList"; // タスク一覧表示コンポーネント
import TaskForm from "../components/TaskForm"; // タスク作成・編集フォーム
import TaskDetails from "../components/TaskDetails"; // タスク詳細表示（ActivityTimeline含む）
import CustomModal from "../components/CustomModal"; // モーダル表示用汎用コンポーネント

const TasksPage = () => {
  // ✅ State管理
  const [tasks, setTasks] = useState([]); // タスク一覧
  const [users, setUsers] = useState([]); // ユーザー一覧
  const [customers, setCustomers] = useState([]); // 顧客一覧
  const [sales, setSales] = useState([]); // 案件一覧
  const [loading, setLoading] = useState(true); // データ読み込み中フラグ
  const [error, setError] = useState(null); // エラー情報
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0); // ✅ アクティビティTimeline更新用のキー

  const [selectedTask, setSelectedTask] = useState(null); // 現在選択中のタスク
  const [isFormModalOpen, setIsFormModalOpen] = useState(false); // タスク作成・編集モーダル開閉
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // タスク詳細モーダル開閉
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // 削除確認モーダル開閉

  const { isAuthReady, user: currentUser } = useAuth(); // 認証状態とログイン中ユーザー情報

  // ✅ 初期データ取得関数（ユーザー・タスク・顧客・案件）
  const fetchInitialData = async () => {
    console.log("📝 TasksPage fetchInitialData 開始");
    try {
      // 複数APIを並列で取得
      const [fetchedUsers, fetchedTasks, fetchedCustomers, fetchedSales] =
        await Promise.all([
          authorizedRequest("get", "/users/basic"),
          authorizedRequest("get", "/tasks"),
          authorizedRequest("get", "/customers"),
          authorizedRequest("get", "/sales"),
        ]);

      console.log("✅ fetchInitialData 結果:", {
        fetchedUsers,
        fetchedTasks,
        fetchedCustomers,
        fetchedSales,
      });

      // Stateにセット
      setUsers(fetchedUsers.users); // users/basic APIは { users: [...] } の形式
      setTasks(fetchedTasks); // タスク一覧
      setCustomers(fetchedCustomers); // 顧客一覧
      setSales(fetchedSales); // 案件一覧
    } catch (err) {
      console.error("❌ fetchInitialData エラー:", err);
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false); // ローディング終了
    }
  };

  // ✅ 認証準備完了時に初期データ取得
  useEffect(() => {
    if (isAuthReady) {
      console.log("📝 isAuthReady true -> fetchInitialData");
      fetchInitialData();
    }
  }, [isAuthReady]);

  // ✅ タスク作成・編集モーダルを開く
  const handleOpenFormModal = (task = null) => {
    console.log("📝 handleOpenFormModal task:", task);
    setSelectedTask(task); // 編集の場合は対象タスクをセット、新規はnull
    setIsFormModalOpen(true); // モーダル表示
  };

  // ✅ タスク作成・編集モーダルを閉じる
  const handleCloseFormModal = () => {
    console.log("📝 handleCloseFormModal");
    setSelectedTask(null);
    setIsFormModalOpen(false);
  };

  // ✅ タスク保存処理（新規作成・編集共通）
  const handleSaveTask = async (taskData) => {
    console.log("📝 handleSaveTask taskData:", taskData);
    try {
      if (selectedTask) {
        // 編集の場合
        console.log("📝 Updating existing task:", selectedTask._id);
        await authorizedRequest("put", `/tasks/${selectedTask._id}`, taskData);
      } else {
        // 新規作成の場合
        console.log("📝 Creating new task");
        await authorizedRequest("post", "/tasks", taskData);
      }

      await fetchInitialData(); // データ再取得
      handleCloseFormModal(); // モーダル閉じる
      setTasksRefreshKey((prevKey) => prevKey + 1); // ActivityTimeline更新用
      console.log("✅ Task saved, tasksRefreshKey:", tasksRefreshKey + 1);
    } catch (err) {
      console.error("❌ handleSaveTask エラー:", err);
    }
  };

  // ✅ タスク詳細モーダルを開く
  const handleViewDetails = (task) => {
    console.log("📝 handleViewDetails task:", task);
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  // ✅ タスク詳細モーダルを閉じる
  const handleCloseDetailsModal = () => {
    console.log("📝 handleCloseDetailsModal");
    setSelectedTask(null);
    setIsDetailsModalOpen(false);
  };

  // ✅ 削除確認モーダルを開く
  const handleOpenDeleteConfirm = (task) => {
    console.log("📝 handleOpenDeleteConfirm task:", task);
    setSelectedTask(task);
    setIsConfirmModalOpen(true);
  };

  // ✅ 削除確認モーダルを閉じる
  const handleCloseDeleteConfirm = () => {
    console.log("📝 handleCloseDeleteConfirm");
    setSelectedTask(null);
    setIsConfirmModalOpen(false);
  };

  // ✅ タスク削除処理
  const handleDeleteTask = async () => {
    try {
      if (selectedTask) {
        console.log("📝 handleDeleteTask task:", selectedTask._id);
        await authorizedRequest("delete", `/tasks/${selectedTask._id}`);
        await fetchInitialData(); // データ再取得
        handleCloseDeleteConfirm(); // モーダル閉じる
      }
    } catch (err) {
      console.error("❌ handleDeleteTask エラー:", err);
    }
  };

  // ✅ ローディング表示
  if (loading || !isAuthReady)
    return <p className="text-center mt-20">データを読み込み中...</p>;

  // ✅ エラー表示
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;

  // ✅ メインレンダリング
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">タスク一覧</h1>

      {/* 新規タスク作成ボタン */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => handleOpenFormModal()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          新規タスク追加
        </button>
      </div>

      {/* タスク一覧表示コンポーネント */}
      <TaskList
        tasks={tasks}
        users={users}
        customers={customers}
        sales={sales}
        currentUserUid={currentUser?.uid}
        onEdit={handleOpenFormModal} // 編集ボタン押下時
        onDelete={handleOpenDeleteConfirm} // 削除ボタン押下時
        onViewDetails={handleViewDetails} // 詳細ボタン押下時
      />

      {/* タスクフォームモーダル（作成・編集共通） */}
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
          refreshKey={tasksRefreshKey} // ActivityTimeline更新用
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
