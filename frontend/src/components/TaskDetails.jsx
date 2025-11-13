// src/components/TaskDetails.jsx
// タスク詳細を表示するコンポーネント
// タスクのタイトル・説明・ステータス・担当者・期日・顧客・案件を表示
// さらに ActivityTimeline コンポーネントを組み込み、タスクに紐づくアクティビティを表示
// refreshKey を渡すことで ActivityTimeline の再描画を制御可能

import React from "react";
import ActivityTimeline from "./ActivityTimeline";

// ✅ 追加: refreshKeyプロップを受け取る
const TaskDetails = ({
  task, // タスクオブジェクト
  users, // ユーザーリスト
  customers, // 顧客リスト
  sales, // 案件リスト
  onClose, // 閉じるボタン押下時のコールバック
  refreshKey, // ActivityTimeline の再描画用キー
}) => {
  if (!task) return null; // taskが未定義の場合は何も表示しない

  // タスクの担当者オブジェクトを取得
  const assignedUser = users.find((u) => u.uid === task.assignedTo);

  // タスクの顧客オブジェクトを取得
  const customer = customers.find((c) => c._id === task.customer);

  // タスクの案件オブジェクトを取得
  const sale = sales.find((s) => s._id === task.sales);

  // ステータスコードを日本語に変換する関数
  const getStatusText = (status) => {
    switch (status) {
      case "todo":
        return "未着手";
      case "in_progress":
        return "進行中";
      case "done":
        return "完了";
      default:
        return status;
    }
  };

  // 日付を「YYYY年MM月DD日」形式に変換
  const formatDueDate = (date) => {
    if (!date) return "未定";
    const d = new Date(date);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div className="p-6">
      {/* タスクタイトル */}
      <h2 className="text-2xl font-bold mb-4">{task.title}</h2>

      {/* タスク詳細情報 */}
      <div className="space-y-2 text-gray-700">
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
          {assignedUser?.displayName || "未割り当て"}
        </div>
        <div>
          <span className="font-semibold">期日:</span>{" "}
          {formatDueDate(task.dueDate)}
        </div>
        <div>
          <span className="font-semibold">顧客:</span>{" "}
          {customer?.companyName || customer?.name || "未指定"}
        </div>
        <div>
          <span className="font-semibold">案件:</span>{" "}
          {sale?.dealName || "未指定"}
        </div>
      </div>

      {/* タスクのアクティビティタイムライン */}
      <div className="mt-8">
        <ActivityTimeline
          type="task"
          targetId={task._id}
          // ✅ refreshKey を渡すことでタイムラインを再描画
          refreshKey={refreshKey}
        />
      </div>

      {/* 閉じるボタン */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default TaskDetails;
