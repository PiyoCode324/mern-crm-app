// src/pages/TaskPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import {
  fetchNotifications,
  addNotification,
} from "../services/notificationService";

const TasksPage = () => {
  const { user: currentUser, isAuthReady } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);

  // useRef を使って、データが一度ロードされたかどうかを追跡するフラグ
  const hasLoadedData = useRef(false);

  // --- API呼び出し ---
  const fetchUsers = async () => {
    try {
      console.log("📡 ユーザーリスト取得開始");
      const response = await authorizedRequest("get", "/users/basic");
      setUsers(response.users || response);
      console.log("📡 ユーザーリスト取得成功", response);
    } catch (err) {
      console.error("ユーザーリストの取得に失敗しました", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      console.log("📡 顧客リスト取得開始");
      const response = await authorizedRequest("get", "/customers/all");
      setCustomers(response.customers);
      console.log("📡 顧客リスト取得成功", response);
    } catch (err) {
      console.error("顧客リストの取得に失敗しました", err);
    }
  };

  const fetchTasks = async () => {
    try {
      console.log("📡 タスク取得開始");
      const response = await authorizedRequest("get", "/tasks");
      setTasks(response);
      setError(null);
      console.log(`📡 タスク取得成功 件数: ${response.length}`);
    } catch (err) {
      setError("タスクの取得に失敗しました。");
      console.error(err);
    }
  };

  const fetchNotificationsData = async () => {
    try {
      console.log("📡 通知取得開始");
      const data = await fetchNotifications();
      setNotifications(data);
      console.log(`📡 通知取得成功 件数: ${data.length}`);
    } catch (err) {
      console.error("通知の取得に失敗しました", err);
    }
  };

  useEffect(() => {
    // isAuthReadyとcurrentUserが準備完了し、かつまだデータがロードされていない場合
    if (isAuthReady && currentUser && !hasLoadedData.current) {
      console.log("🚀 初回データロード開始");

      const loadData = async () => {
        setLoading(true);
        try {
          await Promise.all([
            fetchUsers(),
            fetchCustomers(),
            fetchTasks(),
            fetchNotificationsData(),
          ]);
          // ロードが成功したらフラグをtrueに設定
          hasLoadedData.current = true;
        } catch (err) {
          setError("データの取得に失敗しました。");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    } else if (isAuthReady && !currentUser) {
      // ログインしていない場合はローディングを終了し、フラグをリセット
      setLoading(false);
      setError("ログインしてください。");
      hasLoadedData.current = false;
    }
  }, [isAuthReady, currentUser]);

  // --- 操作 ---
  const handleTaskAction = () => {
    fetchTasks();
    setIsFormVisible(false);
    setCurrentTask(null);
  };

  const openFormForNew = () => {
    setCurrentTask(null);
    setIsFormVisible(true);
  };

  const openFormForEdit = (task) => {
    setCurrentTask(task);
    setIsFormVisible(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("このタスクを削除してもよろしいですか？")) {
      try {
        await authorizedRequest("delete", `/tasks/${taskId}`);
        handleTaskAction();
      } catch (err) {
        console.error("タスクの削除に失敗しました", err);
      }
    }
  };
  const handleSubmitTask = async (formData) => {
    try {
      let action = "";
      let taskId = null;
      let response; // レスポンスを保持する変数

      if (currentTask?._id) {
        console.log(`📡 タスク更新リクエスト id=${currentTask._id}`, formData);
        response = await authorizedRequest(
          "put",
          `/tasks/${currentTask._id}`,
          formData
        );
        taskId = currentTask._id;
        action = "更新";
      } else {
        console.log("📡 タスク作成リクエスト", formData);
        response = await authorizedRequest("post", "/tasks", formData);
        taskId = response._id; // 新規作成されたタスクのIDを取得
        action = "作成";
      }

      // タスクが正常に保存された後にのみ通知を追加
      if (response) {
        console.log(
          `📡 通知追加リクエスト: タスク「${formData.title}」が${action}されました`
        );
        await addNotification(
          `タスク「${formData.title}」が${action}されました`,
          formData.assignedTo,
          taskId
        );
      }

      // タスクと通知の処理がすべて完了した後に、データを再取得
      await Promise.all([fetchTasks(), fetchNotificationsData()]);

      // フォームを閉じる
      setIsFormVisible(false);
      setCurrentTask(null);
    } catch (err) {
      console.error("タスクの保存に失敗しました", err);
    }
  };

  if (loading || !isAuthReady || !currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">{error || "読み込み中..."}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">タスク管理</h1>
      <button
        onClick={openFormForNew}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        新しいタスクを作成
      </button>

      {/* 通知一覧 */}
      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">通知一覧</h2>
        {notifications.length > 0 ? (
          <ul className="list-disc list-inside max-h-48 overflow-auto">
            {notifications.map((note) => (
              <li key={note._id} className="mb-1">
                {note.message}{" "}
                <span className="text-sm text-gray-500">
                  ({new Date(note.createdAt).toLocaleString()})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">通知はありません。</p>
        )}
      </div>

      <TaskForm
        isOpen={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        onSubmit={handleSubmitTask}
        task={currentTask}
        users={users}
        customers={customers}
        currentUser={currentUser}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks?.length > 0 ? (
          tasks
            .filter((task) => task.assignedTo === currentUser.uid)
            .map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={openFormForEdit}
                onDelete={handleDeleteTask}
                users={users}
                currentUserUid={currentUser.uid}
                onTaskAction={handleTaskAction}
              />
            ))
        ) : (
          <p className="text-gray-500">タスクはまだありません。</p>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
