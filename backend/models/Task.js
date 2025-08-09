// backend/models/Task.js

const mongoose = require("mongoose");

// タスクのスキーマを定義
const taskSchema = new mongoose.Schema(
  {
    // タスクの件名
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // タスクの説明
    description: {
      type: String,
      trim: true,
    },
    // タスクの状態（例: 'todo', 'in_progress', 'done'）
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },
    // 💡 修正: assignedToをString型に変更
    // タスクの担当者（Firebase UIDを格納）
    assignedTo: {
      type: String,
      required: true,
    },
    // 💡 修正: createdByをString型に変更
    // タスクを作成したユーザー（Firebase UIDを格納）
    createdBy: {
      type: String,
      required: true,
    },
    // タスクに関連付けられた顧客（顧客IDを格納）
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer", // 'Customer'モデルを参照
    },
    // タスクの期日
    dueDate: {
      type: Date,
    },
  },
  // 作成日時と更新日時を自動で追加
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
