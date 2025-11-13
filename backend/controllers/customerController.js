// backend/controllers/customerController.js

const Customer = require("../models/Customer"); // 顧客(Customer)モデル
const Activity = require("../models/Activity"); // アクティビティ(Activity)モデル
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler"); // 非同期処理のエラーハンドリングを簡潔にするためのラッパー

// ==============================
// 💡 共通: アクティビティ記録用関数
// ==============================
const recordActivity = async (
  userId, // 実行ユーザーID
  action, // 操作内容 (created, updated, deleted, status_changed 等)
  targetModel, // 対象モデル (Customer 等)
  targetId, // 対象ドキュメントのID
  description, // 操作の説明
  customerId = null,
  assignedUserId // ✅ 担当者IDを記録
) => {
  try {
    const activity = new Activity({
      userId,
      action,
      targetModel,
      targetId,
      description,
      customerId,
      assignedUserId,
    });
    await activity.save();
  } catch (error) {
    console.error("アクティビティの記録に失敗しました:", error);
    // ⚠️ エラーが発生しても顧客処理は継続
  }
};

// ==============================
// ➕ 顧客新規登録
// ==============================
exports.createCustomer = asyncHandler(async (req, res) => {
  const assignedUserId = req.user.uid; // ログインユーザーを担当者に設定
  const newCustomer = await Customer.create({
    ...req.body,
    assignedUserId,
  });

  // 顧客作成時にアクティビティを記録
  await recordActivity(
    req.user.uid,
    "created",
    "Customer",
    newCustomer._id,
    `新しい顧客「${
      newCustomer.companyName || newCustomer.name
    }」を登録しました。`,
    newCustomer._id,
    assignedUserId
  );

  res.status(201).json(newCustomer);
});

// ==============================
// 📄 顧客一覧取得（ログインユーザーのみ）
// ==============================
exports.getCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find({
    assignedUserId: req.user.uid,
  }).sort({ createdAt: -1 });

  res.status(200).json(customers);
});

// ==============================
// 📄 顧客詳細取得（ログインユーザー専用）
// ==============================
exports.getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({
    _id: req.params.id,
    assignedUserId: req.user.uid,
  });
  if (!customer) {
    res.status(404);
    throw new Error("顧客が見つかりません");
  }
  res.status(200).json(customer);
});

// ==============================
// ✏️ 顧客情報更新（ログインユーザー専用）
// ==============================
exports.updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uid;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("無効な顧客IDです");
  }

  // 更新対象の顧客を取得
  const customer = await Customer.findById(id);
  if (!customer || customer.assignedUserId !== userId) {
    res.status(404);
    throw new Error("顧客が見つからないか、権限がありません");
  }

  const beforeUpdateData = customer.toObject(); // 更新前のデータを保持

  // 顧客情報を更新
  const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  // 更新内容をログに記録
  const changes = [];
  for (const key in req.body) {
    if (beforeUpdateData[key] !== updatedCustomer[key] && key !== "updatedAt") {
      changes.push(
        `「${key}」を「${beforeUpdateData[key]}」から「${updatedCustomer[key]}」に更新`
      );
    }
  }

  // アクティビティ記録
  if (changes.length > 0) {
    await recordActivity(
      req.user.uid,
      "updated",
      "Customer",
      updatedCustomer._id,
      `顧客「${
        updatedCustomer.companyName || updatedCustomer.name
      }」の情報を更新しました: ${changes.join("、")}`,
      updatedCustomer._id,
      userId
    );
  }

  res.status(200).json(updatedCustomer);
});

// ==============================
// 🗑️ 顧客削除（ログインユーザー専用）
// ==============================
exports.deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uid;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("無効な顧客IDです");
  }

  const customer = await Customer.findById(id);
  if (!customer || customer.assignedUserId !== userId) {
    res.status(404);
    throw new Error("顧客が見つからないか、権限がありません");
  }

  // アクティビティ記録
  await recordActivity(
    req.user.uid,
    "deleted",
    "Customer",
    customer._id,
    `顧客「${customer.companyName || customer.name}」を削除しました。`,
    customer._id,
    userId
  );

  await Customer.findByIdAndDelete(id);
  res.status(200).json({ message: "顧客情報を削除しました" });
});

// ==============================
// 📄 全顧客取得（管理者用）
// ==============================
exports.getAllCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find({}).sort({ createdAt: -1 });
  res.status(200).json({ customers });
});

// ==============================
// 📄 ステータス別顧客一覧取得
// ==============================
exports.getCustomersByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const customers = await Customer.find({
    assignedUserId: req.user.uid,
    status: status,
  }).sort({ createdAt: -1 });

  res.status(200).json(customers);
});

// ==============================
// ✏️ 顧客ステータス更新
// ==============================
exports.updateCustomerStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.uid;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("無効な顧客IDです");
  }

  const updatedCustomer = await Customer.findOneAndUpdate(
    { _id: id, assignedUserId: userId },
    { status: status },
    { new: true, runValidators: true }
  );

  if (!updatedCustomer) {
    res.status(404);
    throw new Error("顧客が見つからないか、権限がありません");
  }

  // アクティビティ記録
  await recordActivity(
    req.user.uid,
    "status_changed",
    "Customer",
    updatedCustomer._id,
    `顧客「${
      updatedCustomer.companyName || updatedCustomer.name
    }」のステータスを「${updatedCustomer.status}」に更新しました。`,
    updatedCustomer._id,
    userId
  );

  res.status(200).json(updatedCustomer);
});
