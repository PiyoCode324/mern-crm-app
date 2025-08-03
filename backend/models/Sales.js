// backend/models/sales.js

const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
  },
  saleDate: {
    type: Date,
    required: true,
  },
});

// 合計金額を自動計算
salesSchema.pre("save", function (next) {
  this.totalPrice = this.unitPrice * this.quantity;
  next();
});

const Sale = mongoose.model("Sale", salesSchema);

module.exports = Sale;
