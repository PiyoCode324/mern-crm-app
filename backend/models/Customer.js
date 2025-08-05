// backend/models/Customer.js

const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "顧客名は必須です"],
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["見込み", "提案中", "契約済", "失注"],
      default: "見込み",
    },
    assignedUserId: {
      type: String, // Firebase UIDの文字列として保持
      default: null,
    },
    contactMemo: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", customerSchema);
