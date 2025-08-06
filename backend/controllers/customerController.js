// backend/controllers/customerController.js
const Customer = require("../models/Customer");
const User = require("../models/User"); // Userモデルをインポート (authMiddlewareの修正で必要になるため)

// Create Customer
// 顧客を作成する際、ログイン中のユーザーに紐づける
exports.createCustomer = async (req, res) => {
  try {
    const newCustomer = await Customer.create({
      ...req.body,
      assignedUser: req.user._id,
    });
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error("❌ 顧客作成エラー:", error);
    // ✅ 修正: エラーの種類に応じてメッセージを返す
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(400).json({ message: error.message });
  }
};

// Get All Customers for the current user
// ログイン中のユーザーに紐づく顧客のみを全て取得
exports.getAllCustomers = async (req, res) => {
  try {
    // ログイン中のユーザーIDでフィルタリング
    const customers = await Customer.find({ assignedUser: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(customers);
  } catch (error) {
    console.error("❌ 全顧客取得エラー:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Customer by ID for the current user
// ログイン中のユーザーに紐づく特定の顧客を取得
exports.getCustomerById = async (req, res) => {
  try {
    // IDとログイン中のユーザーIDでフィルタリング
    const customer = await Customer.findOne({
      _id: req.params.id,
      assignedUser: req.user._id,
    });
    if (!customer)
      return res.status(404).json({ message: "顧客が見つかりません" });
    res.status(200).json(customer);
  } catch (error) {
    console.error("❌ 顧客ID取得エラー:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update Customer by ID for the current user
// ログイン中のユーザーに紐づく特定の顧客を更新
exports.updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: req.params.id, assignedUser: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCustomer)
      return res.status(404).json({ message: "顧客が見つかりません" });
    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error("❌ 顧客更新エラー:", error);
    // ✅ 修正: エラーの種類に応じてメッセージを返す
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete Customer by ID for the current user
// ログイン中のユーザーに紐づく特定の顧客を削除
exports.deleteCustomer = async (req, res) => {
  try {
    // IDとログイン中のユーザーIDでフィルタリング
    const deletedCustomer = await Customer.findOneAndDelete({
      _id: req.params.id,
      assignedUser: req.user._id,
    });
    if (!deletedCustomer)
      return res.status(404).json({ message: "顧客が見つかりません" });
    res.status(200).json({ message: "顧客を削除しました" });
  } catch (error) {
    console.error("❌ 顧客削除エラー:", error);
    res.status(500).json({ message: error.message });
  }
};
