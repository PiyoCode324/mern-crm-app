// backend/models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientUid: { type: String, required: true }, // 通知を受け取るユーザーUID
    message: { type: String, required: true }, // 通知本文
    read: { type: Boolean, default: false }, // 既読フラグ
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" }, // 関連タスク
  },
  { timestamps: true } // createdAt, updatedAt
);

module.exports = mongoose.model("Notification", notificationSchema);
