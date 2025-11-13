// backend/models/Notification.js

const mongoose = require("mongoose");

// Notificationモデルのスキーマ定義
const notificationSchema = new mongoose.Schema(
  {
    // 🔹 通知を受け取るユーザーのUID（Firebase UIDを想定）
    targetUser: {
      type: String,
      required: true,
      index: true, // ユーザーごとの通知取得で検索されることが多いためインデックス
    },
    // 🔹 通知メッセージの本文
    message: {
      type: String,
      required: true,
    },
    // 🔹 関連するタスクのObjectId（任意）
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    // 🔹 既読フラグ（初期値はfalse：未読）
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    // 🔹 timestamps: 作成日時(createdAt)と更新日時(updatedAt)を自動追加
    timestamps: true,
  }
);

// 🔹 Notificationモデルをエクスポート
module.exports = mongoose.model("Notification", notificationSchema);
