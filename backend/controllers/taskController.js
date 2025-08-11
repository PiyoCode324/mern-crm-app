// backend/controllers/taskController.js

const Task = require("../models/Task");

// 特定の顧客に紐づくタスクを取得
exports.getTasksByCustomer = async (req, res) => {
  try {
    // ログイン中のユーザーIDと顧客IDでタスクをフィルタリング
    const tasks = await Task.find({
      customer: req.params.id,
      $or: [{ assignedTo: req.user.uid }, { createdBy: req.user.uid }], // 💡 ログインユーザーに関連するタスクに限定
    }).sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (err) {
    console.error("❌ 顧客別タスク取得エラー:", err.message);
    res.status(500).send("サーバーエラー");
  }
};
