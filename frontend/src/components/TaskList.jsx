// src/components/TaskList.jsx
// タスク一覧をグリッド表示するコンポーネント
// TaskCard を使って個別のタスクを表示
// propsでタスク・ユーザー・顧客・案件情報を受け取り、編集・削除・詳細表示などの操作を可能にする

import React from "react";
import TaskCard from "./TaskCard";

const TaskList = ({
  tasks, // タスク配列
  users, // ユーザー情報配列
  customers, // 顧客情報配列
  sales, // 案件情報配列
  onEdit, // 編集ボタン押下時のコールバック
  onDelete, // 削除ボタン押下時のコールバック
  currentUserUid, // ログイン中ユーザーUID（編集・削除ボタン表示判定用）
  onTaskAction, // タスクに対するアクション（未使用でも受け取り可能）
  onViewDetails, // 詳細表示ボタン押下時のコールバック
}) => {
  // ユーザーIDから担当者名を取得するヘルパー
  const getUserName = (userId) => {
    const user = users.find((u) => u.uid === userId);
    return user ? user.displayName : "不明な担当者";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.length > 0 ? (
        // タスクがある場合は TaskCard をレンダリング
        tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            assignedToName={getUserName(task.assignedTo)}
            onEdit={() => onEdit(task)}
            onDelete={() => onDelete(task)}
            users={users}
            customers={customers}
            sales={sales}
            currentUserUid={currentUserUid}
            onTaskAction={onTaskAction}
            onViewDetails={() => onViewDetails(task)}
          />
        ))
      ) : (
        // タスクがない場合の表示
        <p className="text-gray-500 italic">タスクはありません。</p>
      )}
    </div>
  );
};

export default TaskList;
