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
  currentUser,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  // task が変わったらフィールドを更新
  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setAssignedTo(task.assignedTo || "");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    } else {
      setTitle("");
      setDescription("");
      setAssignedTo("");
      setDueDate("");
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      assignedTo,
      dueDate,
    });
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

          {/* 担当者選択 */}
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">担当者を選択</option>
            {users.map((user) => (
              <option key={user.uid} value={user.uid}>
                {user.displayName}
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
