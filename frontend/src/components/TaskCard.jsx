// src/components/TaskCard.jsx
// タスクをカード形式で表示するコンポーネント
// 担当者が現在ログインユーザーの場合のみ編集・削除ボタンを表示
// 顧客・案件名も props から取得して表示

import React from "react";

const TaskCard = ({
  task, // タスクオブジェクト（タイトル、説明、担当者、期限、顧客ID、案件ID、ステータス）
  onEdit, // 編集ボタン押下時のコールバック関数
  onDelete, // 削除ボタン押下時のコールバック関数
  customers, // 顧客リスト（_id と name）
  sales, // 案件リスト（_id と dealName）
  currentUserUid, // 現在ログイン中ユーザーのUID
  onTaskAction, // タスクに対する追加アクション用コールバック（未使用だが拡張用）
  onViewDetails, // 詳細ボタン押下時のコールバック
  assignedToName, // 担当者名（propsで渡せる場合はこちらを優先表示）
}) => {
  // --- 顧客・案件名の取得 ---
  // 顧客IDから顧客名を取得。存在しなければ「顧客なし」と表示
  const customerName =
    customers.find((c) => String(c._id) === String(task.customer))?.name ||
    "顧客なし";

  // 案件IDから案件名を取得。存在しなければ「案件なし」と表示
  const saleName =
    sales.find((s) => s._id === task.sales)?.dealName || "案件なし";

  // 現在のユーザーが担当者かどうか判定
  const isAssignedToCurrentUser =
    String(task.assignedTo) === String(currentUserUid);

  // --- ステータス表示用マッピング ---
  const statusText = {
    todo: "未着手",
    in_progress: "進行中",
    done: "完了",
  };

  const statusColors = {
    todo: "bg-red-500",
    in_progress: "bg-yellow-500",
    done: "bg-green-500",
  };

  return (
    // --- カードラッパー ---
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between h-full transform transition-transform duration-200 hover:scale-105">
      {/* --- 上部: タイトル・ステータス・説明 --- */}
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          {/* タイトル */}
          <h3 className="text-xl font-bold text-gray-800 break-words pr-2">
            {task.title}
          </h3>
          {/* ステータス表示 */}
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full text-white whitespace-nowrap ${
              statusColors[task.status]
            }`}
          >
            {statusText[task.status]}
          </span>
        </div>

        {/* 説明文（最大3行で省略） */}
        <p className="text-gray-600 mb-4 text-sm line-clamp-3">
          {task.description}
        </p>

        {/* --- タスク詳細: 担当者・期限・顧客・案件 --- */}
        <div className="space-y-2 text-gray-700 text-sm">
          <div className="flex items-center">
            <span>担当者: {assignedToName || "不明"}</span>
          </div>
          <div className="flex items-center">
            <span>
              期限:{" "}
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString("ja-JP")
                : "期限なし"}
            </span>
          </div>
          <div className="flex items-center">
            <span>顧客: {customerName}</span>
          </div>
          <div className="flex items-center">
            <span>案件: {saleName}</span>
          </div>
        </div>
      </div>

      {/* --- 下部ボタン群: 詳細・編集・削除 --- */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2 justify-end items-center">
        {/* 詳細ボタン（常に表示） */}
        <button
          onClick={() => onViewDetails(task)}
          className="bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors py-2 px-3 rounded-full text-sm font-medium flex items-center gap-1"
        >
          詳細
        </button>

        {/* 担当者のみ編集・削除ボタンを表示 */}
        {isAssignedToCurrentUser && (
          <>
            {/* 編集ボタン */}
            <button
              onClick={() => onEdit(task)}
              className="bg-blue-500 text-white hover:bg-blue-600 transition-colors py-2 px-3 rounded-full text-sm font-medium flex items-center gap-1"
            >
              編集
            </button>
            {/* 削除ボタン */}
            <button
              onClick={() => onDelete(task)}
              className="bg-red-500 text-white hover:bg-red-600 transition-colors py-2 px-3 rounded-full text-sm font-medium flex items-center gap-1"
            >
              削除
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
