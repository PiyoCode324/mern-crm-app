// backend/controllers/taskController.js

const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Sales = require("../models/Sales");
const Activity = require("../models/Activity");
const { addNotification } = require("./notificationController");

/**
 * @desc ユーザーアクティビティを記録するヘルパー関数
 * @param {String} userId - アクションを実行したユーザーID
 * @param {String} action - アクションの種類（例: created, updated, deleted）
 * @param {String} taskId - 対象のタスクID
 * @param {String} description - アクティビティの説明文
 * @param {String} customerId - 関連する顧客ID（任意）
 * @param {String} salesId - 関連する案件ID（任意）
 * @param {String} assignedUserId - タスクの担当者ID（任意）
 * @param {Object} before - 更新前のタスクデータ（任意）
 * @param {Object} after - 更新後のタスクデータ（任意）
 * @param {String} targetId - 対象ID（省略時はtaskIdを使用）
 * @param {Date} timestamp - アクティビティ作成日時（デフォルト: 現在時刻）
 */
const recordActivity = async (
  userId,
  action,
  taskId,
  description,
  customerId = null,
  salesId = null,
  assignedUserId = null,
  before = null,
  after = null,
  targetId = null,
  timestamp = new Date()
) => {
  try {
    console.log("📝 recordActivity start:", { userId, action, taskId });
    const activity = new Activity({
      userId,
      action,
      taskId,
      description,
      customerId,
      salesId,
      assignedUserId,
      before,
      after,
      targetModel: "Task",
      targetId: targetId || taskId, // targetId が指定されなければ taskId を使用
      updatedAt: timestamp,
    });
    await activity.save();
    console.log("✅ recordActivity success");
  } catch (err) {
    console.error("❌ アクティビティ記録エラー:", err.message);
  }
};

/**
 * @desc 新規タスク作成
 * @route POST /api/tasks
 * @access Private
 */
exports.createTask = asyncHandler(async (req, res) => {
  console.log("📝 createTask start", req.body);
  const { title, description, assignedTo, customer, sales, dueDate } = req.body;
  const createdBy = req.user.uid;

  // 新しいタスクオブジェクト作成
  const newTask = new Task({
    title,
    description,
    assignedTo,
    createdBy,
    customer,
    sales,
    dueDate,
  });

  // タスクをDBに保存
  const task = await newTask.save();
  console.log("✅ Task saved:", task._id);

  // 関連情報取得（通知やアクティビティ用）
  const createdByUser = await User.findOne({ uid: createdBy });
  const assignedUser = await User.findOne({ uid: assignedTo });
  const customerObj = await Customer.findById(customer);
  const salesObj = await Sales.findById(sales);

  // 通知メッセージ作成
  const message = `${createdByUser?.displayName || "不明なユーザー"}が、顧客「${
    customerObj?.name || "不明"
  }」の案件「${salesObj?.dealName || "不明"}」に関する新しいタスク「${
    task.title
  }」を${assignedUser?.displayName || "不明なユーザー"}に割り当てました。`;

  // 担当者向け通知
  console.log("🔔 Adding notification for assigned user");
  await addNotification({
    message,
    targetUser: assignedTo,
    relatedTask: task._id,
  });

  // 作成者と担当者が異なる場合、作成者にも通知
  if (createdBy !== assignedTo) {
    console.log("🔔 Adding notification for creator");
    await addNotification({
      message: `${assignedUser?.displayName || "不明なユーザー"}がタスク「${
        task.title
      }」をあなたに割り当てました。`,
      targetUser: createdBy,
      relatedTask: task._id,
    });
  }

  // アクティビティ記録
  await recordActivity(
    createdBy,
    "created",
    task._id,
    `タスク「${task.title}」を作成しました。`,
    customer,
    sales,
    assignedTo,
    null,
    task,
    task._id // targetId を taskId に設定
  );

  console.log("📝 createTask end");
  res.status(201).json(task);
});

/**
 * @desc タスク更新
 * @route PATCH /api/tasks/:id
 * @access Private
 */
exports.updateTask = asyncHandler(async (req, res) => {
  console.log("📝 updateTask start", req.body);
  const { title, description, status, assignedTo, customer, sales, dueDate } =
    req.body;
  const task = await Task.findById(req.params.id);

  if (!task) {
    console.log("❌ Task not found:", req.params.id);
    return res.status(404).json({ msg: "タスクが見つかりません" });
  }

  const beforeTask = task.toObject(); // 更新前のタスクデータ
  const updatedFields = {}; // 更新されたフィールドを保持

  // 更新フィールドの判定
  if (title !== undefined && title !== task.title) updatedFields.title = title;
  if (description !== undefined && description !== task.description)
    updatedFields.description = description;
  if (status !== undefined && status !== task.status)
    updatedFields.status = status;
  if (assignedTo !== undefined && assignedTo !== task.assignedTo)
    updatedFields.assignedTo = assignedTo;
  if (customer !== undefined && String(customer) !== String(task.customer))
    updatedFields.customer = customer;
  if (sales !== undefined && String(sales) !== String(task.sales))
    updatedFields.sales = sales;
  if (
    dueDate &&
    new Date(dueDate).toISOString() !== task.dueDate?.toISOString()
  )
    updatedFields.dueDate = dueDate;

  // DB更新
  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    { ...updatedFields },
    { new: true }
  );

  console.log("✅ Task updated:", updatedTask._id);

  const activityDescriptions = []; // アクティビティ用の変更内容
  const user = await User.findOne({ uid: req.user.uid });

  // ステータス変更
  if (updatedFields.status) {
    activityDescriptions.push(
      `ステータスを「${beforeTask.status}」から「${updatedTask.status}」に変更`
    );
  }

  // 担当者変更
  if (updatedFields.assignedTo) {
    const beforeUser = await User.findOne({ uid: beforeTask.assignedTo });
    const afterUser = await User.findOne({ uid: updatedTask.assignedTo });
    activityDescriptions.push(
      `担当者を「${beforeUser?.displayName || "未割り当て"}」から「${
        afterUser?.displayName || "未割り当て"
      }」に変更`
    );
  }

  // 顧客変更
  if (updatedFields.customer) {
    const beforeCustomer = await Customer.findById(beforeTask.customer);
    const afterCustomer = await Customer.findById(updatedTask.customer);
    activityDescriptions.push(
      `顧客を「${beforeCustomer?.name || "未指定"}」から「${
        afterCustomer?.name || "未指定"
      }」に変更`
    );
  }

  // 案件変更
  if (updatedFields.sales) {
    const beforeSales = await Sales.findById(beforeTask.sales);
    const afterSales = await Sales.findById(updatedTask.sales);
    activityDescriptions.push(
      `案件を「${beforeSales?.dealName || "未指定"}」から「${
        afterSales?.dealName || "未指定"
      }」に変更`
    );
  }

  // タイトル・説明・期日変更
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

  // アクティビティ記録
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
      updatedTask,
      updatedTask._id // targetId を設定
    );
  }

  console.log("📝 updateTask end");
  res.json(updatedTask);
});

/**
 * @desc タスク削除
 * @route DELETE /api/tasks/:id
 * @access Private
 */
exports.deleteTask = asyncHandler(async (req, res) => {
  console.log("📝 deleteTask start:", req.params.id);
  const task = await Task.findById(req.params.id);
  if (!task) {
    console.log("❌ Task not found for delete:", req.params.id);
    return res.status(404).json({ msg: "タスクが見つかりません" });
  }

  const user = await User.findOne({ uid: req.user.uid });

  // 作成者と担当者に通知
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

  // アクティビティ記録
  await recordActivity(
    req.user.uid,
    "deleted",
    task._id,
    `タスク「${task.title}」を削除しました。`,
    task.customer,
    task.sales,
    task.assignedTo,
    task,
    null,
    task._id // targetId を設定
  );

  // DBから削除
  await Task.findByIdAndDelete(req.params.id);
  console.log("✅ deleteTask success");
  res.status(200).json({ message: "タスクを削除しました。" });
});

/**
 * @desc 全タスク取得（自分が作成 or 自分に割り当て）
 * @route GET /api/tasks
 * @access Private
 */
exports.getAllTasks = asyncHandler(async (req, res) => {
  console.log("📝 getAllTasks start");
  const tasks = await Task.find({
    $or: [{ assignedTo: req.user.uid }, { createdBy: req.user.uid }],
  }).sort({ createdAt: -1 });

  console.log(`✅ getAllTasks found ${tasks.length} tasks`);
  res.status(200).json(tasks);
});

/**
 * @desc 顧客別タスク取得
 * @route GET /api/tasks/customer/:id
 * @access Private
 */
exports.getTasksByCustomer = asyncHandler(async (req, res) => {
  console.log("📝 getTasksByCustomer start:", req.params.id);
  const tasks = await Task.find({
    customer: req.params.id,
    $or: [{ assignedTo: req.user.uid }, { createdBy: req.user.uid }],
  }).sort({ createdAt: -1 });

  console.log(`✅ getTasksByCustomer found ${tasks.length} tasks`);
  res.status(200).json(tasks);
});

/**
 * @desc タスク詳細取得（アクティビティ込み）
 * @route GET /api/tasks/:id
 * @access Private
 */
exports.getTaskById = asyncHandler(async (req, res) => {
  console.log("📝 getTaskById start:", req.params.id);
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId)
      .populate("customer", "name")
      .populate("sales", "dealName")
      .populate("assignedTo", "displayName email");

    if (!task) {
      console.log("❌ Task not found in getTaskById:", taskId);
      return res.status(404).json({ msg: "タスクが見つかりません" });
    }

    // タスクに関連するアクティビティを取得
    const activities = await Activity.find({ taskId })
      .sort({ updatedAt: -1 })
      .populate("userId", "displayName")
      .populate("customerId", "name")
      .populate("salesId", "dealName");

    console.log(`✅ getTaskById found ${activities.length} activities`);
    res.status(200).json({ task, activities });
  } catch (err) {
    console.error("❌ タスク詳細取得エラー:", err.message);
    res.status(500).send("タスク詳細の取得に失敗しました。");
  }
});
