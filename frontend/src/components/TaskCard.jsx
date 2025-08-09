// src/components/TaskCard.jsx
import React from "react";

const TaskCard = ({ task, onEdit, onDelete, users, currentUserUid, onTaskAction }) => {
  const assignedUser = users.find((user) => user.uid === task.assignedTo);

  return (
    <div className="border rounded p-4 shadow hover:shadow-md transition">
      <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
      <p className="text-gray-700 mb-2">{task.description}</p>
      <p className="text-sm text-gray-500 mb-1">
        状態: <span className="capitalize">{task.status}</span>
      </p>
      <p className="text-sm text-gray-500 mb-1">
        担当者: {assignedUser ? assignedUser.displayName : "未割当"}
      </p>
      <p className="text-sm text-gray-500 mb-3">
        期日: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "未設定"}
      </p>
      {task.assignedTo === currentUserUid && (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500"
          >
            編集
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            削除
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
