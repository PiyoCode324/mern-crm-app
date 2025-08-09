// backend/controllers/notificationController.js (修正案)
const Notification = require("../models/Notification");
const asyncHandler = require("express-async-handler");

// ログインユーザー宛の通知一覧取得
const getNotifications = asyncHandler(async (req, res) => {
  const userUid = req.user.uid;
  console.log(`🔔 通知取得リクエスト: userUid=${userUid}`);
  const notifications = await Notification.find({ recipientUid: userUid }).sort(
    { createdAt: -1 }
  );
  console.log(`🔔 通知件数: ${notifications.length}`);
  res.status(200).json({ notifications });
});

// 通知追加 (修正版)
const addNotification = asyncHandler(async (req, res) => {
  const { recipientUid, message, taskId } = req.body;
  console.log(
    `🔔 通知追加リクエスト: recipientUid=${recipientUid}, message=${message}, taskId=${taskId}`
  );

  if (!recipientUid || !message) {
    res.status(400);
    throw new Error("recipientUid と message は必須です");
  } // taskIdが指定されている場合のみ重複チェックを行う

  if (taskId) {
    const existingNotification = await Notification.findOne({
      taskId: taskId,
      message: message,
    });
    if (existingNotification) {
      console.log(`🔔 重複する通知が見つかりました: taskId=${taskId}`);
      return res
        .status(200)
        .json({
          message: "通知はすでに存在します",
          notification: existingNotification,
        });
    }
  } // 新しい通知を作成

  const notification = new Notification({ recipientUid, message, taskId });
  await notification.save();
  console.log(`🔔 通知追加完了: id=${notification._id}`);
  res.status(201).json({ message: "通知が追加されました", notification });
});

// 通知を既読にする
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(`🔔 通知既読処理: id=${id}`);
  await Notification.findByIdAndUpdate(id, { read: true });
  res.status(200).json({ message: "通知を既読にしました" });
});

module.exports = {
  getNotifications,
  addNotification,
  markAsRead,
};
