// backend/routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");
const Notification = require("../models/Notification"); // 通知モデルを追加
const { verifyFirebaseToken } = require("../middleware/authMiddleware");

// @route   POST /api/tasks
// @desc    新しいタスクを作成
// @access  Private
router.post("/", verifyFirebaseToken, async (req, res) => {
  const { title, description, status, assignedTo, customer, dueDate } =
    req.body;
  const createdBy = req.user.uid;

  try {
    const newTask = new Task({
      title,
      description,
      status,
      assignedTo,
      createdBy,
      customer,
      dueDate,
    });

    const task = await newTask.save();

    // 通知作成用データ
    const notificationData = {
      recipientUid: assignedTo,
      message: `タスク「${title}」が作成されました`,
      taskId: task._id,
    };
    console.log("📌 通知作成データ (POST):", notificationData);

    // 通知を保存
    const notification = new Notification(notificationData);
    await notification.save();
    console.log("📌 通知が保存されました (POST):", notification);

    res.status(201).json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("サーバーエラー");
  }
});

// @route   GET /api/tasks
// @desc    認証済みユーザーに関連するすべてのタスクを取得
// @access  Private
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [{ assignedTo: req.user.uid }, { createdBy: req.user.uid }],
    }).sort({ createdAt: -1 });

    const userUids = [
      ...new Set(
        tasks.map((t) => t.assignedTo).concat(tasks.map((t) => t.createdBy))
      ),
    ];
    const users = await User.find({ uid: { $in: userUids } });
    const userMap = users.reduce((map, user) => {
      map[user.uid] = user;
      return map;
    }, {});

    const tasksWithUsers = tasks.map((task) => ({
      ...task.toObject(),
      assignedToUser: userMap[task.assignedTo],
      createdByuser: userMap[task.createdBy],
    }));

    res.json(tasksWithUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("サーバーエラー");
  }
});

// @route   PUT /api/tasks/:id
// @desc    特定のタスクを更新
// @access  Private
router.put("/:id", verifyFirebaseToken, async (req, res) => {
  const { title, description, status, assignedTo, customer, dueDate } =
    req.body;

  const taskFields = {};
  if (title) taskFields.title = title;
  if (description) taskFields.description = description;
  if (status) taskFields.status = status;
  if (assignedTo) taskFields.assignedTo = assignedTo;
  if (customer) taskFields.customer = customer;
  if (dueDate) taskFields.dueDate = dueDate;

  try {
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: "タスクが見つかりません" });

    if (
      task.createdBy.toString() !== req.user.uid &&
      task.assignedTo.toString() !== req.user.uid
    ) {
      return res.status(401).json({ msg: "許可されていません" });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: taskFields },
      { new: true }
    );

    // 通知作成用データ
    const notificationData = {
      recipientUid: assignedTo || task.assignedTo,
      message: `タスク「${title || task.title}」が更新されました`,
      taskId: task._id,
    };
    console.log("📌 通知作成データ (PUT):", notificationData);

    const notification = new Notification(notificationData);
    await notification.save();
    console.log("📌 通知が保存されました (PUT):", notification);

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("サーバーエラー");
  }
});

// @route   DELETE /api/tasks/:id
// @desc    特定のタスクを削除
// @access  Private
router.delete("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: "タスクが見つかりません" });

    if (task.createdBy.toString() !== req.user.uid) {
      return res.status(401).json({ msg: "許可されていません" });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ msg: "タスクが削除されました" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("サーバーエラー");
  }
});

module.exports = router;
