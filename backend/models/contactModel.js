// backend/models/contactModel.js

const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "名前は必須です"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "メールアドレスは必須です"],
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "有効なメールアドレスを入力してください"],
    },
    message: {
      type: String,
      required: [true, "メッセージは必須です"],
      trim: true,
    },
  },
  {
    timestamps: true, // createdAtとupdatedAtを自動生成
  }
);

module.exports = mongoose.model("Contact", contactSchema);
