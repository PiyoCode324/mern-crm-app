// backend/models/Task.js

const mongoose = require("mongoose");

// Taskモデル（タスク）のスキーマ定義
const taskSchema = new mongoose.Schema(
  {
    // 🔹 タスクの件名
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // 🔹 タスクの詳細説明（任意）
    description: {
      type: String,
      trim: true,
    },
    // 🔹 タスクの状態（ステータス）
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"], // todo: 未着手, in_progress: 進行中, done: 完了
      default: "todo",
      index: true, // ステータスで検索することがあるためインデックス
    },
    // 🔹 タスクの担当者（Firebase UID）
    assignedTo: {
      type: String,
      required: true,
      index: true, // 担当者で検索することが多いためインデックス
    },
    // 🔹 タスク作成者（Firebase UID）
    createdBy: {
      type: String,
      required: true,
      index: true, // 作成者で検索する場合があるためインデックス
    },
    // 🔹 タスクに関連付けられた顧客（CustomerモデルのObjectId）
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true, // 顧客は必須
      index: true, // 顧客ごとにタスクを検索することが多いためインデックス
    },
    // 🔹 タスクに関連付けられた案件（SalesモデルのObjectId、任意）
    sales: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sales",
      required: false,
      index: true, // 案件ごとにタスクを検索する場合があるためインデックス
    },
    // 🔹 タスクの期日（任意）
    dueDate: {
      type: Date,
    },
  },
  {
    // 🔹 timestamps: 作成日時(createdAt)と更新日時(updatedAt)を自動追加
    timestamps: true,
  }
);

// 🔹 Taskモデルをエクスポート
module.exports = mongoose.model("Task", taskSchema);
