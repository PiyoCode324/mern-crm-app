// backend/controllers/customerController.js

const Customer = require("../models/Customer");
const Activity = require("../models/Activity"); // 💡 Activityモデルをインポート
const mongoose = require("mongoose");

// 💡 アクティビティを記録するためのヘルパー関数
const recordActivity = async (
  userId,
  action,
  targetModel,
  targetId,
  description,
  customerId = null
) => {
  try {
    const activity = new Activity({
      userId,
      action,
      targetModel,
      targetId,
      description,
      customerId,
    });
    await activity.save();
  } catch (error) {
    console.error("アクティビティの記録に失敗しました:", error);
    // エラーが発生しても、メインの処理は止めない
  }
};

// 顧客新規登録
// 顧客を作成する際、ログイン中のユーザーに紐づける
exports.createCustomer = async (req, res) => {
  try {
    const newCustomer = await Customer.create({
      ...req.body, // ログインユーザーのUIDを assignedUserId に設定
      assignedUserId: req.user.uid,
    });

    // 💡 顧客作成時にアクティビティを記録
    await recordActivity(
      req.user.uid,
      "created",
      "Customer",
      newCustomer._id,
      `新しい顧客「${
        newCustomer.companyName || newCustomer.name
      }」を登録しました。`,
      newCustomer._id
    );

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

// 全顧客情報取得（ログインユーザーの顧客のみ）
exports.getCustomers = async (req, res) => {
  try {
    // ログイン中のユーザーIDでフィルタリング
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

// 顧客IDで顧客情報を取得（ログインユーザーに紐づく特定の顧客を取得）
exports.getCustomerById = async (req, res) => {
  try {
    // IDとログイン中のユーザーIDでフィルタリング
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

// 顧客情報を更新（ログイン中のユーザーに紐づく特定の顧客を更新）
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // 💡 更新前データの取得
    const beforeUpdate = await Customer.findById(id).lean();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "無効な顧客IDです" });
    } // ログインユーザーのIDと顧客のassignedUserIdが一致するか確認

    const customer = await Customer.findById(id);
    if (!customer || customer.assignedUserId !== userId) {
      return res
        .status(404)
        .json({ message: "顧客が見つからないか、権限がありません" });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    // 💡 顧客更新時にアクティビティを記録
    await recordActivity(
      req.user.uid,
      "updated",
      "Customer",
      updatedCustomer._id,
      `顧客「${
        updatedCustomer.companyName || updatedCustomer.name
      }」の情報を更新しました。`,
      updatedCustomer._id
    );

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error("❌ 顧客更新エラー:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "顧客情報の更新に失敗しました" });
  }
};

// 顧客を削除（ログイン中のユーザーに紐づく特定の顧客を削除）
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "無効な顧客IDです" });
    } // ログインユーザーのIDと顧客のassignedUserIdが一致するか確認

    const customer = await Customer.findById(id);
    if (!customer || customer.assignedUserId !== userId) {
      return res
        .status(404)
        .json({ message: "顧客が見つからないか、権限がありません" });
    }

    // 💡 削除前にアクティビティを記録
    await recordActivity(
      req.user.uid,
      "deleted",
      "Customer",
      customer._id,
      `顧客「${customer.companyName || customer.name}」を削除しました。`,
      customer._id
    );

    await Customer.findByIdAndDelete(id);
    res.status(200).json({ message: "顧客情報を削除しました" });
  } catch (error) {
    console.error("❌ 顧客削除エラー:", error);
    res.status(500).json({ message: "顧客情報の削除に失敗しました" });
  }
};

// 全顧客取得（認証ユーザー問わず全件取得、管理者用に認可を後で追加可能）
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    res.status(200).json({ customers });
  } catch (error) {
    console.error("❌ 全顧客取得エラー:", error);
    res.status(500).json({ message: error.message });
  }
};

// 💡 追加: ステータス別に顧客情報を取得（ログインユーザーの顧客のみ）
exports.getCustomersByStatus = async (req, res) => {
  try {
    const { status } = req.params; // URLからステータスを取得
    const customers = await Customer.find({
      assignedUserId: req.user.uid,
      status: status, // 💡 指定されたステータスでフィルタリング
    }).sort({
      createdAt: -1,
    });
    res.status(200).json(customers);
  } catch (error) {
    console.error("❌ ステータス別顧客取得エラー:", error);
    res.status(500).json({ message: "顧客情報の取得に失敗しました" });
  }
};

// 💡 追加: 顧客のステータスを更新
exports.updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.uid;

    // 💡 更新前データの取得
    const beforeUpdate = await Customer.findById(id).lean();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "無効な顧客IDです" });
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: id, assignedUserId: userId }, // 💡 IDとユーザーIDで検索
      { status: status }, // 💡 ステータスのみを更新
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res
        .status(404)
        .json({ message: "顧客が見つからないか、権限がありません" });
    }

    // 💡 ステータス更新時にアクティビティを記録
    await recordActivity(
      req.user.uid,
      "status_changed", // 💡 'status_changed'という専用アクションを使用
      "Customer",
      updatedCustomer._id,
      `顧客「${
        updatedCustomer.companyName || updatedCustomer.name
      }」のステータスを「${updatedCustomer.status}」に更新しました。`,
      updatedCustomer._id
    );

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error("❌ 顧客ステータス更新エラー:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "顧客情報の更新に失敗しました" });
  }
};
