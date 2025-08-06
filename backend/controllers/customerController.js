// backend/controllers/customerController.js (修正版)

const Customer = require("../models/Customer");
// const User = require("../models/User"); // Userモデルはここで直接使用しないため削除

// 🔹 顧客新規登録
// 顧客を作成する際、ログイン中のユーザーに紐づける
exports.createCustomer = async (req, res) => {
  try {
    const newCustomer = await Customer.create({
      ...req.body,
      // ✅ 修正: assignedUserをassignedUserIdに、req.user._idをreq.user.uidに統一
      assignedUserId: req.user.uid,
    });
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error("❌ 顧客作成エラー:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(400).json({ message: error.message });
  }
};

// 📄 全顧客情報取得（ログインユーザーの顧客のみ）
exports.getCustomers = async (req, res) => {
  // 関数名をgetAllCustomersからgetCustomersに変更（routesと合わせる）
  try {
    // ログイン中のユーザーIDでフィルタリング
    // ✅ 修正: assignedUserをassignedUserIdに、req.user._idをreq.user.uidに統一
    const customers = await Customer.find({
      assignedUserId: req.user.uid,
    }).sort({
      createdAt: -1,
    });
    res.status(200).json(customers);
  } catch (error) {
    console.error("❌ 全顧客取得エラー:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔸 顧客IDで顧客情報を取得（ログインユーザーに紐づく特定の顧客を取得）
exports.getCustomerById = async (req, res) => {
  try {
    // IDとログイン中のユーザーIDでフィルタリング
    // ✅ 修正: assignedUserをassignedUserIdに、req.user._idをreq.user.uidに統一
    const customer = await Customer.findOne({
      _id: req.params.id,
      assignedUserId: req.user.uid,
    });
    if (!customer)
      return res.status(404).json({ message: "顧客が見つかりません" });
    res.status(200).json(customer);
  } catch (error) {
    console.error("❌ 顧客ID取得エラー:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✏️ 顧客情報を更新（ログイン中のユーザーに紐づく特定の顧客を更新）
exports.updateCustomer = async (req, res) => {
  try {
    // ✅ 修正: assignedUserをassignedUserIdに、req.user._idをreq.user.uidに統一
    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: req.params.id, assignedUserId: req.user.uid },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCustomer)
      return res.status(404).json({ message: "顧客が見つかりません" });
    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error("❌ 顧客更新エラー:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(400).json({ message: error.message });
  }
};

// 🗑️ 顧客を削除（ログイン中のユーザーに紐づく特定の顧客を削除）
exports.deleteCustomer = async (req, res) => {
  try {
    // IDとログイン中のユーザーIDでフィルタリング
    // ✅ 修正: assignedUserをassignedUserIdに、req.user._idをreq.user.uidに統一
    const deletedCustomer = await Customer.findOneAndDelete({
      _id: req.params.id,
      assignedUserId: req.user.uid,
    });
    if (!deletedCustomer)
      return res.status(404).json({ message: "顧客が見つかりません" });
    res.status(200).json({ message: "顧客を削除しました" });
  } catch (error) {
    console.error("❌ 顧客削除エラー:", error);
    res.status(500).json({ message: error.message });
  }
};
