// backend/models/contactModel.js

const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    // customerIdは必須ではなくなります
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      // required: [true, "顧客IDは必須です"], // この行を削除
      default: null, // 初期値としてnullを設定
    },
    contactDate: {
      type: Date,
      required: [true, "連絡日を入力してください"],
      default: Date.now,
    },
    content: {
      type: String,
      required: [true, "内容を入力してください"],
      trim: true,
    },
    responseStatus: {
      type: String,
      enum: ["未対応", "対応中", "対応済み"],
      default: "未対応",
    },
    memo: {
      type: String,
      trim: true,
    },
    // assignedUserIdも初期は未設定のため、必須ではなくします
    assignedUserId: {
      type: String, // Firebase UIDを保存
      // required: [true, "担当者IDは必須です"], // この行を削除
      default: null, // 初期値としてnullを設定
    },
    // 新規問い合わせを管理するために、名前とメールアドレスも追加します
    contactName: {
      type: String,
      required: [true, "氏名は必須です"],
      trim: true,
    },
    contactEmail: {
      type: String,
      required: [true, "メールアドレスは必須です"],
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contact", contactSchema);
