// src/components/Kanban/KanbanBoard.jsx
import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Link } from "react-router-dom";
import { authorizedRequest } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const STATUSES = ["todo", "in_progress", "done"]; // 🔹 カンバンに表示するタスクのステータス一覧（3列構成）

// ==============================
// 📌 タスクカード表示用コンポーネント
// ==============================
const Card = memo(function Card({ task, provided, snapshot }) {
  return (
    <div
      // 🔹 ドラッグ操作のために `provided` から参照とpropsを渡す
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`bg-white rounded-lg p-4 shadow-md transition-all duration-150 cursor-pointer ${
        snapshot.isDragging ? "shadow-lg scale-105" : "" // 🔹 ドラッグ中の見た目強調
      }`}
    >
      {/* タスク詳細ページへのリンク */}
      <Link
        to={`/tasks/${task._id}`}
        className="block text-inherit no-underline"
      >
        {/* タスク名 */}
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          {task.title}
        </h3>
        {/* 担当者名（未割り当ての場合はデフォルト表示） */}
        <p className="text-sm text-gray-600">
          担当: {task.assignedName || "未割り当て"}
        </p>
        {/* 顧客（会社名）がある場合のみ表示 */}
        {task.companyName && (
          <p className="text-sm text-gray-600">会社: {task.companyName}</p>
        )}
        {/* 期限が設定されている場合のみ表示 */}
        {task.dueDate && (
          <p className="text-sm text-gray-500">
            期限: {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}
      </Link>
    </div>
  );
});

// ==============================
// 📌 カラム（列）コンポーネント
// ==============================
const Column = memo(function Column({ status, items }) {
  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div
          // 🔹 ドロップ領域として設定
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`bg-gray-100 rounded-xl p-4 w-72 min-w-72 flex flex-col gap-3 h-fit max-h-[calc(100vh-100px)] overflow-y-auto transition-colors duration-200 ${
            snapshot.isDraggingOver ? "bg-gray-200" : "" // 🔹 ドロップ中に背景色を変更
          }`}
        >
          {/* カラムの見出し（ステータスに応じて日本語表示） */}
          <h2 className="text-xl font-semibold text-gray-700 mb-2 pb-2 border-b-2 border-gray-200">
            {status === "todo"
              ? "未着手"
              : status === "in_progress"
              ? "進行中"
              : "完了"}
          </h2>

          {/* カラム内にタスクが存在する場合 */}
          {items && items.length > 0 ? (
            items.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(provided, snapshot) => (
                  <Card task={task} provided={provided} snapshot={snapshot} />
                )}
              </Draggable>
            ))
          ) : (
            // 🔹 タスクが存在しない場合の表示
            <div className="text-gray-500 italic text-center p-4">
              タスクがありません
            </div>
          )}

          {/* 🔹 D&D用プレースホルダー（ドラッグ時の位置保持に必要） */}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
});

// ==============================
// 📌 カンバンボード本体コンポーネント
// ==============================
const KanbanBoard = () => {
  const { user, token, isAuthReady, user: currentUser } = useAuth();

  // 🔹 カラムごとのタスクを保持する state
  const [pipelines, setPipelines] = useState(() =>
    STATUSES.reduce((acc, s) => ({ ...acc, [s]: [] }), {})
  );

  const [loading, setLoading] = useState(true); // ローディング状態
  const [usersMap, setUsersMap] = useState({}); // uid → displayName の対応表
  const [customersMap, setCustomersMap] = useState({}); // assignedUserId → companyName の対応表

  // 🔹 初回ロード済み判定用
  const didInitialLoadRef = useRef(false);
  // 🔹 コンポーネントがマウント中かどうかを判定
  const isMountedRef = useRef(true);

  // アンマウント時にフラグを落とす
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ==============================
  // 🔹 ユーザー情報取得処理
  // ==============================
  const loadUsers = useCallback(async () => {
    if (!user || !token) return;
    try {
      const res = await authorizedRequest("GET", "/users/basic");
      const map = {};
      res.users.forEach((u) => {
        map[u.uid] = u.displayName || u.email;
      });
      if (isMountedRef.current) setUsersMap(map);
      console.log("ユーザー一覧:", map);
    } catch (err) {
      console.error("ユーザー取得エラー:", err);
    }
  }, [user, token]);

  // ==============================
  // 🔹 顧客情報取得処理（管理者のみ全件取得）
  // ==============================
  const loadCustomers = useCallback(async () => {
    if (!user || !token) return;
    try {
      const res = await authorizedRequest("GET", "/customers/all");
      const map = {};
      res.customers.forEach((c) => {
        map[c.assignedUserId] = c.companyName || "";
      });
      if (isMountedRef.current) setCustomersMap(map);
      console.log("顧客一覧:", map);
    } catch (err) {
      console.error("顧客取得エラー:", err);
    }
  }, [user, token]);

  // ==============================
  // 🔹 タスク情報取得処理
  // ==============================
  const loadTasks = useCallback(async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const tasks = await authorizedRequest("GET", "/tasks");

      // タスクに担当者名と顧客名を付与
      const tasksWithNames = tasks.map((task) => ({
        ...task,
        assignedName: usersMap[task.assignedTo] || "未割り当て",
        companyName: customersMap[task.assignedTo] || "",
      }));

      // ステータスごとに仕分け
      const newPipelines = STATUSES.reduce(
        (acc, s) => ({ ...acc, [s]: [] }),
        {}
      );
      tasksWithNames.forEach((task) => {
        const status = task.status || "todo"; // デフォルトは "todo"
        newPipelines[status].push(task);
      });

      if (isMountedRef.current) {
        setPipelines(newPipelines);
        setLoading(false);
      }
      console.log("取得タスク:", tasksWithNames);
    } catch (err) {
      console.error("タスク取得エラー:", err);
      if (isMountedRef.current) setLoading(false);
    }
  }, [user, token, usersMap, customersMap]);

  // ==============================
  // 初回ロード：ユーザー・顧客情報を取得
  // ==============================
  useEffect(() => {
    if (!isAuthReady || !user || !token) return;
    if (didInitialLoadRef.current) return;
    didInitialLoadRef.current = true;
    loadUsers();
    loadCustomers();
  }, [isAuthReady, user, token, loadUsers, loadCustomers]);

  // ==============================
  // ユーザー・顧客マップが揃ったらタスクを取得
  // ==============================
  useEffect(() => {
    if (
      Object.keys(usersMap).length === 0 ||
      Object.keys(customersMap).length === 0
    )
      return;
    loadTasks();
  }, [usersMap, customersMap, loadTasks]);

  // ==============================
  // 🔹 ドラッグ終了時の処理
  // ==============================
  const onDragEnd = useCallback(
    async (result) => {
      const { destination, source, draggableId } = result;
      if (!destination) return; // 移動先がない場合は終了
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return; // 元の位置と同じ場合は何もしない

      const sourceStatus = source.droppableId;
      const destStatus = destination.droppableId;

      // 🔹 即時UI更新（楽観的更新）
      setPipelines((prev) => {
        const fromList = [...(prev[sourceStatus] || [])];
        const toList = [...(prev[destStatus] || [])];
        const [moved] = fromList.splice(source.index, 1);
        if (!moved) return prev;
        toList.splice(destination.index, 0, moved);
        return { ...prev, [sourceStatus]: fromList, [destStatus]: toList };
      });

      // 🔹 DB上のタスク状態更新
      try {
        await authorizedRequest("PUT", `/tasks/${draggableId}`, {
          status: destStatus,
        });
      } catch (err) {
        console.error("タスクステータス更新エラー:", err);
        loadTasks(); // エラー時のみ再取得
      }
    },
    [loadTasks]
  );

  // ==============================
  // ローディング中のプレースホルダー表示
  // ==============================
  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen font-sans">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">タスクボード</h1>
        <div className="flex gap-6 overflow-x-auto p-4">
          {STATUSES.map((s) => (
            <div key={s} className="w-72 min-w-72">
              {/* カラム見出し部分のダミー */}
              <div className="bg-gray-200 h-8 rounded mb-4 animate-pulse" />
              {/* タスクカード部分のダミー */}
              <div className="space-y-4">
                <div className="h-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-24 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==============================
  // 実際のカンバンボード表示
  // ==============================
  return (
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">タスクボード</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto p-4">
          {STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              items={pipelines[status] || []}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
