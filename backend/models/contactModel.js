// backend/models/contactModel.js

const mongoose = require("mongoose");

/**
 * 🔹 Contactモデルのスキーマ定義
 * @desc 顧客との問い合わせや連絡内容を記録するモデル
 */
const contactSchema = new mongoose.Schema(
  {
    // 顧客ID（CustomerモデルのObjectId）
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null, // 顧客が未登録の場合はnull
    },

    // 連絡日
    contactDate: {
      type: Date,
      required: [true, "連絡日を入力してください"],
      default: Date.now, // デフォルトは現在日時
    },

    // 連絡内容
    content: {
      type: String,
      required: [true, "内容を入力してください"],
      trim: true, // 前後の空白を削除
    },

    // 対応状況（未対応、対応中、対応済み）
    responseStatus: {
      type: String,
      enum: ["未対応", "対応中", "対応済み"],
      default: "未対応",
    },

    // メモ（自由入力）
    memo: {
      type: String,
      trim: true,
    },

    // 担当者ユーザーID（Firebase UID）
    assignedUserId: {
      type: String,
      default: null, // 社員が登録した場合のみUIDを設定
    },

    // 顧客名（検索や表示用に冗長で保持）
    customerName: {
      type: String,
      trim: true,
    },

    // 連絡者氏名
    contactName: {
      type: String,
      required: [true, "氏名は必須です"],
      trim: true,
    },

    // 連絡者メールアドレス
    contactEmail: {
      type: String,
      required: [true, "メールアドレスは必須です"],
      trim: true,
    },

    // 連絡者電話番号
    contactPhone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // 作成日時(createdAt)と更新日時(updatedAt)を自動追加
  }
);

// モデルをエクスポート
module.exports = mongoose.model("Contact", contactSchema);
