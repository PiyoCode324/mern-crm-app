// backend/controllers/taskController.js

const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Sales = require("../models/Sales");
const Activity = require("../models/Activity");
const { addNotification } = require("./notificationController");

/**
 * @desc ユーザーアクティビティを記録
 */
const recordActivity = async (
  userId,
  type,
  taskId,
  description,
  customerId = null,
  salesId = null,
  assignedUserId = null,
  before = null,
  after = null
) => {
  try {
    const activity = new Activity({
      userId,
      action: type,
      taskId,
      description,
      customerId,
      salesId,
      assignedUserId,
      before,
      after,
      targetModel: "Task",
    });
    await activity.save();
  } catch (err) {
    console.error("❌ アクティビティ記録エラー:", err.message);
  }
};

/**
 * @desc 新規タスク作成
 */
exports.createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, customer, sales, dueDate } = req.body;
  const createdBy = req.user.uid;

  const newTask = new Task({
    title,
    description,
    assignedTo,
    createdBy,
    customer,
    sales,
    dueDate,
  });

  const task = await newTask.save();

  const createdByUser = await User.findOne({ uid: createdBy });
  const assignedUser = await User.findOne({ uid: assignedTo });
  const customerObj = await Customer.findById(customer);
  const salesObj = await Sales.findById(sales);

  const message = `${createdByUser?.displayName || "不明なユーザー"}が、顧客「${
    customerObj?.name || "不明"
  }」の案件「${salesObj?.dealName || "不明"}」に関する新しいタスク「${
    task.title
  }」を${assignedUser?.displayName || "不明なユーザー"}に割り当てました。`;

  await addNotification({
    message,
    targetUser: assignedTo,
    relatedTask: task._id,
  });

  if (createdBy !== assignedTo) {
    await addNotification({
      message: `${assignedUser?.displayName || "不明なユーザー"}がタスク「${
        task.title
      }」をあなたに割り当てました。`,
      targetUser: createdBy,
      relatedTask: task._id,
    });
  }

  // ✅ アクティビティ記録
  await recordActivity(
    createdBy,
    "created",
    task._id,
    `タスク「${task.title}」を作成しました。`,
    customer,
    sales,
    assignedTo
  );

  res.status(201).json(task);
});

/**
 * @desc タスク更新
 */
exports.updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, assignedTo, customer, sales, dueDate } =
    req.body;
  const task = await Task.findById(req.params.id);

  if (!task) return res.status(404).json({ msg: "タスクが見つかりません" });

  const beforeTask = task.toObject();
  const updatedFields = {};

  if (title !== undefined && title !== task.title) updatedFields.title = title;
  if (description !== undefined && description !== task.description)
    updatedFields.description = description;
  if (status !== undefined && status !== task.status)
    updatedFields.status = status;
  if (assignedTo !== undefined && assignedTo !== task.assignedTo)
    updatedFields.assignedTo = assignedTo;
  if (customer !== undefined && customer !== task.customer.toString())
    updatedFields.customer = customer;
  if (sales !== undefined && sales !== task.sales.toString())
    updatedFields.sales = sales;
  if (
    dueDate &&
    new Date(dueDate).toISOString() !== task.dueDate?.toISOString()
  )
    updatedFields.dueDate = dueDate;

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    { ...updatedFields },
    { new: true }
  );

  const activityDescriptions = [];
  const user = await User.findOne({ uid: req.user.uid });

  if (updatedFields.status) {
    activityDescriptions.push(
      `ステータスを「${beforeTask.status}」から「${updatedTask.status}」に変更`
    );
    await addNotification({
      message: `${user?.displayName || "不明"}が、タスク「${
        updatedTask.title
      }」のステータスを更新しました。`,
      targetUser: updatedTask.assignedTo,
      relatedTask: updatedTask._id,
    });
  }

  if (updatedFields.assignedTo) {
    const beforeUser = await User.findOne({ uid: beforeTask.assignedTo });
    const afterUser = await User.findOne({ uid: updatedTask.assignedTo });
    activityDescriptions.push(
      `担当者を「${beforeUser?.displayName || "未割り当て"}」から「${
        afterUser?.displayName || "未割り当て"
      }」に変更`
    );

    await addNotification({
      message: `${user?.displayName || "不明"}が、タスク「${
        updatedTask.title
      }」の担当者をあなたに割り当てました。`,
      targetUser: updatedTask.assignedTo,
      relatedTask: updatedTask._id,
    });

    if (beforeTask.assignedTo) {
      await addNotification({
        message: `${user?.displayName || "不明"}が、タスク「${
          updatedTask.title
        }」の担当者をあなたから変更しました。`,
        targetUser: beforeTask.assignedTo,
        relatedTask: updatedTask._id,
      });
    }
  }

  if (updatedFields.title)
    activityDescriptions.push(
      `タイトルを「${beforeTask.title}」から「${updatedTask.title}」に変更`
    );
  if (updatedFields.description) activityDescriptions.push(`説明を更新`);
  if (updatedFields.dueDate) {
    const oldDate = beforeTask.dueDate
      ? new Date(beforeTask.dueDate).toLocaleDateString()
      : "未定";
    const newDate = new Date(updatedTask.dueDate).toLocaleDateString();
    activityDescriptions.push(`期日を「${oldDate}」から「${newDate}」に変更`);
  }

  if (activityDescriptions.length > 0) {
    await recordActivity(
      req.user.uid,
      "updated",
      updatedTask._id,
      `タスクを更新しました：\n- ${activityDescriptions.join("\n- ")}`,
      updatedTask.customer,
      updatedTask.sales,
      updatedTask.assignedTo,
      beforeTask,
      updatedTask
    );
  }

  res.json(updatedTask);
});

/**
 * @desc タスク削除
 */
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ msg: "タスクが見つかりません" });

  const user = await User.findOne({ uid: req.user.uid });

  const relatedUsers = new Set([task.createdBy, task.assignedTo]);
  const customerObj = await Customer.findById(task.customer);
  const salesObj = await Sales.findById(task.sales);
  const message = `${user?.displayName || "不明"}が、顧客「${
    customerObj?.name || "不明"
  }」の案件「${salesObj?.dealName || "不明"}」のタスク「${
    task.title
  }」を削除しました。`;

  for (const targetUser of relatedUsers) {
    await addNotification({
      message,
      targetUser,
      relatedTask: task._id,
    });
  }

  await recordActivity(
    req.user.uid,
    "deleted",
    task._id,
    `タスク「${task.title}」を削除しました。`,
    task.customer,
    task.sales,
    task.assignedTo,
    task,
    null
  );

  await Task.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "タスクを削除しました。" });
});

/**
 * @desc 全タスク取得（自分が作成 or 自分に割り当て）
 */
exports.getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    $or: [{ assignedTo: req.user.uid }, { createdBy: req.user.uid }],
  }).sort({ createdAt: -1 });

  res.status(200).json(tasks);
});

/**
 * @desc 顧客別タスク取得
 */
exports.getTasksByCustomer = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    customer: req.params.id,
    $or: [{ assignedTo: req.user.uid }, { createdBy: req.user.uid }],
  }).sort({ createdAt: -1 });

  res.status(200).json(tasks);
});

/**
 * @desc タスク単位のアクティビティ履歴取得
 */
exports.getTaskActivities = asyncHandler(async (req, res) => {
  try {
    const taskId = req.params.id;
    const activities = await Activity.find({ taskId })
      .sort({ createdAt: -1 })
      .populate("customerId", "name")
      .populate("salesId", "dealName")
      .populate("taskId", "title");

    res.status(200).json(activities);
  } catch (err) {
    console.error("❌ タスクアクティビティ取得エラー:", err.message);
    res.status(500).send("タスクアクティビティの取得に失敗しました。");
  }
});
