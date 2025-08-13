// backend/controllers/activityController.js

const Activity = require("../models/Activity");
const mongoose = require("mongoose");

// --- 顧客IDに紐づくアクティビティを取得 ---
exports.getActivitiesByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "無効な顧客IDです" });
    }

    // 💡 customerIdでアクティビティを検索し、新しいものから順にソート
    const activities = await Activity.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(50); // 最新50件のみ取得するなど、件数を制限すると良い

    res.status(200).json(activities);
  } catch (error) {
    console.error("❌ 顧客アクティビティ取得エラー:", error);
    res.status(500).json({ message: "アクティビティの取得に失敗しました" });
  }
};

// --- ユーザーIDに紐づくアクティビティを取得 ---
exports.getActivitiesByUser = async (req, res) => {
  try {
    // 💡 ログイン中のユーザーIDでアクティビティを検索
    const activities = await Activity.find({ userId: req.user.uid })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(activities);
  } catch (error) {
    console.error("❌ ユーザーアクティビティ取得エラー:", error);
    res.status(500).json({ message: "アクティビティの取得に失敗しました" });
  }
};

// --- 全てのアクティビティを取得（管理者向け） ---
exports.getAllActivities = async (req, res) => {
  try {
    // 💡 管理者ユーザーかどうかのチェックを追加することも可能
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(100); // 最新100件のみ取得

    res.status(200).json(activities);
  } catch (error) {
    console.error("❌ 全体アクティビティ取得エラー:", error);
    res.status(500).json({ message: "アクティビティの取得に失敗しました" });
  }
};
