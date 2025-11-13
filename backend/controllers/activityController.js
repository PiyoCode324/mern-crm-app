// backend/controllers/activityController.js

// --- 必要なモジュールをインポート ---
const Activity = require("../models/Activity"); // アクティビティ情報を管理するMongooseモデル
const User = require("../models/User"); // ユーザー情報を管理するMongooseモデル
const mongoose = require("mongoose"); // MongoDB操作用
const asyncHandler = require("express-async-handler"); // 非同期処理のエラーハンドリングを簡潔にするミドルウェア

// --- 特定のタスクに関連するアクティビティ履歴を取得 ---
const getActivitiesByTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  console.log(
    `📝 getActivitiesByTask called by ${req.user.uid} for taskId: ${taskId}`
  );

  // タスクIDがMongoDBのObjectId形式であるかチェック
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    console.error("❌ 無効なタスクID:", taskId);
    res.status(400);
    Error("無効なタスクIDです");
  }

  // 該当タスクに紐づく最新50件のアクティビティを取得
  const activities = await Activity.find({ taskId })
    .sort({ createdAt: -1 })
    .limit(50);

  // アクティビティに関わるユーザーのIDを抽出（重複削除）
  const userIds = [...new Set(activities.map((a) => a.userId))];

  // ユーザー情報（名前・アイコン）を取得
  const users = await User.find({ uid: { $in: userIds } }).select(
    "uid displayName photoURL"
  );

  // ユーザーIDをキーにしたマッピングを作成
  const userMap = users.reduce((map, user) => {
    map[user.uid] = user;
    return map;
  }, {});

  // 各アクティビティに対応するユーザー情報を付与
  const activitiesWithUsers = activities.map((activity) => ({
    ...activity.toObject(),
    user: userMap[activity.userId],
  }));

  console.log(
    `✅ Found ${activitiesWithUsers.length} activities for taskId: ${taskId}`
  );
  res.status(200).json(activitiesWithUsers);
});

// --- 顧客IDに紐づくアクティビティを取得 ---
const getActivitiesByCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const assignedUserId = req.user.uid;
  console.log(
    `📝 getActivitiesByCustomer called by ${assignedUserId} for customerId: ${customerId}`
  );

  // 顧客IDの妥当性チェック
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    console.error("❌ 無効な顧客ID:", customerId);
    res.status(400);
    throw new Error("無効な顧客IDです");
  }

  // 顧客IDとログイン中のユーザーに紐づく最新50件を取得
  const activities = await Activity.find({
    customerId: new mongoose.Types.ObjectId(customerId),
    assignedUserId,
  })
    .sort({ createdAt: -1 })
    .limit(50);

  console.log(
    `✅ Found ${activities.length} activities for customerId: ${customerId}`
  );
  res.status(200).json(activities);
});

// --- ユーザーIDに紐づくアクティビティを取得 ---
const getActivitiesByUser = asyncHandler(async (req, res) => {
  console.log(`📝 getActivitiesByUser called by ${req.user.uid}`);

  // ログイン中のユーザーが担当するアクティビティを最新50件取得
  const activities = await Activity.find({ assignedUserId: req.user.uid })
    .sort({ createdAt: -1 })
    .limit(50);

  console.log(
    `✅ Found ${activities.length} activities for user: ${req.user.uid}`
  );
  res.status(200).json(activities);
});

// --- 全てのアクティビティを取得（管理者向け） ---
const getAllActivities = asyncHandler(async (req, res) => {
  console.log(`📝 getAllActivities called by ${req.user.uid}`);

  // 管理者権限のチェック
  if (req.user.role !== "admin") {
    console.error("❌ 権限なし user:", req.user.uid);
    res.status(403);
    throw new Error("権限がありません");
  }

  // 全ユーザーのアクティビティを最新100件取得
  const activities = await Activity.find().sort({ createdAt: -1 }).limit(100);

  console.log(`✅ Found ${activities.length} total activities`);
  res.status(200).json(activities);
});

// --- 特定の案件IDに紐づくアクティビティを取得 ---
const getActivitiesBySaleId = asyncHandler(async (req, res) => {
  const { saleId } = req.params;
  const assignedUserId = req.user.uid;
  console.log(
    `📝 getActivitiesBySaleId called by ${assignedUserId} for saleId: ${saleId}`
  );

  // 案件IDの妥当性チェック
  if (!mongoose.Types.ObjectId.isValid(saleId)) {
    console.error("❌ 無効な案件ID:", saleId);
    res.status(400);
    throw new Error("無効な案件IDです");
  }

  // 案件IDとユーザーに紐づく最新50件を取得
  const activities = await Activity.find({
    salesId: new mongoose.Types.ObjectId(saleId),
    assignedUserId,
  })
    .sort({ createdAt: -1 })
    .limit(50);

  console.log(`✅ Found ${activities.length} activities for saleId: ${saleId}`);
  res.status(200).json(activities);
});

// --- エクスポート ---
module.exports = {
  getActivitiesByTask,
  getActivitiesByCustomer,
  getActivitiesByUser,
  getAllActivities,
  getActivitiesBySaleId,
};
