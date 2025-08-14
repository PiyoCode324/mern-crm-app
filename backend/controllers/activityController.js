// backend/controllers/activityController.js
const Activity = require("../models/Activity");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

// --- 顧客IDに紐づくアクティビティを取得 ---
exports.getActivitiesByCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const assignedUserId = req.user.uid;

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    res.status(400);
    throw new Error("無効な顧客IDです");
  }

  const activities = await Activity.find({
    customerId: new mongoose.Types.ObjectId(customerId),
    assignedUserId,
  })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json(activities);
});

// --- ユーザーIDに紐づくアクティビティを取得 ---
exports.getActivitiesByUser = asyncHandler(async (req, res) => {
  const activities = await Activity.find({ assignedUserId: req.user.uid })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json(activities);
});

// --- 全てのアクティビティを取得（管理者向け） ---
exports.getAllActivities = asyncHandler(async (req, res) => {
  // 管理者チェック例（必要に応じて）
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error("権限がありません");
  }

  const activities = await Activity.find().sort({ createdAt: -1 }).limit(100);

  res.status(200).json(activities);
});

// --- 特定の案件IDに紐づくアクティビティを取得 ---
exports.getActivitiesBySaleId = asyncHandler(async (req, res) => {
  const { saleId } = req.params;
  const assignedUserId = req.user.uid;

  if (!mongoose.Types.ObjectId.isValid(saleId)) {
    res.status(400);
    throw new Error("無効な案件IDです");
  }

  const activities = await Activity.find({
    salesId: new mongoose.Types.ObjectId(saleId),
    assignedUserId,
  })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json(activities);
});
