// backend/models/contactModel.js

const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "顧客IDは必須です"],
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
    assignedUserId: {
      type: String, // Firebase UIDは文字列なのでString型に変更
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contact", contactSchema);
