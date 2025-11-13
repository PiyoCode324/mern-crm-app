// backend/models/Customer.js

const mongoose = require("mongoose");

/**
 * 🔹 Customerモデルのスキーマ定義
 * @desc 顧客情報を管理するモデル
 */
const customerSchema = new mongoose.Schema(
  {
    // 顧客名
    name: {
      type: String,
      required: true,
      trim: true, // 前後の空白を削除
    },

    // 会社名
    companyName: {
      type: String,
      trim: true,
    },

    // メールアドレス
    email: {
      type: String,
      trim: true,
    },

    // 電話番号
    phone: {
      type: String,
      trim: true,
    },

    // 顧客ステータス（見込み、提案中、契約済、失注）
    status: {
      type: String,
      enum: ["見込み", "提案中", "契約済", "失注"],
      default: "見込み",
    },

    // 連絡メモ
    contactMemo: {
      type: String,
      trim: true,
    },

    // 担当ユーザーID（Firebase UID）
    assignedUserId: {
      type: String,
      required: true, // 顧客には必ず担当者が必要
    },
  },
  {
    timestamps: true, // 作成日時(createdAt)と更新日時(updatedAt)を自動追加
  }
);

// モデルをエクスポート
module.exports = mongoose.model("Customer", customerSchema);
