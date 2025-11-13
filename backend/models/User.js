// backend/models/User.js

const mongoose = require("mongoose");

// Userモデル（ユーザー）のスキーマ定義
const userSchema = new mongoose.Schema(
  {
    // 🔹 Firebase UID（ユーザー識別用の一意ID）
    uid: {
      type: String,
      required: true,
      unique: true, // 重複不可
      index: true, // 検索しやすいようにインデックス
    },
    // 🔹 ユーザーのメールアドレス
    email: {
      type: String,
      required: true,
      trim: true, // 前後の空白を自動除去
      index: true, // メールで検索する場合が多いためインデックス
    },
    // 🔹 表示名（任意、プロフィールなどに使用）
    displayName: {
      type: String,
      trim: true,
    },
    // 🔹 ユーザーの役割（管理者 or 一般ユーザー）
    role: {
      type: String,
      enum: ["admin", "user"], // 管理者(admin)か一般ユーザー(user)
      default: "user",
    },
    // 🔹 ユーザーの有効/無効ステータス（任意）
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // 🔹 作成日時(createdAt)と更新日時(updatedAt)を自動で追加
    timestamps: true,
  }
);

// 🔹 Userモデルをエクスポート
module.exports = mongoose.model("User", userSchema);
