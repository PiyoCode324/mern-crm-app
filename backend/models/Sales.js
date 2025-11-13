// backend/models/Sales.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Salesモデル（案件）のスキーマ定義
const salesSchema = new Schema(
  {
    // 🔹 案件名
    dealName: {
      type: String,
      required: true,
      trim: true,
    },
    // 🔹 顧客との紐づけ（CustomerモデルのObjectId）
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true, // 顧客ごとに案件を検索する場合が多いためインデックス
    },
    // 🔹 案件金額
    amount: {
      type: Number,
      required: true,
    },
    // 🔹 案件のステータス
    status: {
      type: String,
      enum: ["見込み", "提案中", "交渉中", "契約済", "失注"],
      default: "見込み",
      index: true, // ステータスで検索することがあるためインデックス
    },
    // 🔹 担当者との紐づけ（Firebase UID）
    assignedUserId: {
      type: String,
      required: true,
      index: true, // 担当者ごとに案件を検索する場合が多いためインデックス
    },
    // 🔹 メモ（任意）
    notes: {
      type: String,
      trim: true,
    },
    // 🔹 案件の期限日（任意）
    dueDate: {
      type: Date,
      required: false,
    },
  },
  {
    // 🔹 timestamps: 作成日時(createdAt)と更新日時(updatedAt)を自動追加
    timestamps: true,
  }
);

// 🔹 Salesモデルをエクスポート
module.exports = mongoose.model("Sales", salesSchema);
