// backend/controllers/taskController.js

const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const User = require("../models/User");
const Customer = require("../models/Customer"); // ✅ Customerモデルをインポート
const Sales = require("../models/Sales"); // ✅ Salesモデルをインポート
const { addNotification } = require("../controllers/notificationController"); // ✅ 新しい通知コントローラーをインポート

/**
 * @desc 新規タスクを作成
 * @route POST /api/tasks
 * @access Private
 */
exports.createTask = asyncHandler(async (req, res) => {
  try {
    const { title, description, assignedTo, customer, sales, dueDate } =
      req.body;
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

    // 関連情報を取得
    const createdByUser = await User.findOne({
      uid: createdBy,
    });
    const assignedToUser = await User.findOne({
      uid: assignedTo,
    });
    const customerObj = await Customer.findById(customer);
    const salesObj = await Sales.findById(sales);

    // 通知メッセージを生成
    let message = "";
    if (createdBy === assignedTo) {
      // 自分にタスクを割り当てた場合
      message = `${createdByUser?.displayName || "不明なユーザー"}が、顧客「${
        customerObj?.name || "不明"
      }」の案件「${salesObj?.dealName || "不明"}」に関する新しいタスク「${
        task.title
      }」をあなたに割り当てました。`;
    } else {
      // 他のユーザーにタスクを割り当てた場合
      message = `${createdByUser?.displayName || "不明なユーザー"}が、顧客「${
        customerObj?.name || "不明"
      }」の案件「${salesObj?.dealName || "不明"}」」に関する新しいタスク「${
        task.title
      }」を${
        assignedToUser?.displayName || "不明なユーザー"
      }に割り当てました。`;
    }

    // 通知を送信
    await addNotification({
      message,
      targetUser: assignedTo,
      relatedTask: task._id,
    });

    // タスク作成者にも通知
    if (createdBy !== assignedTo) {
      await addNotification({
        message: `${assignedToUser?.displayName || "不明なユーザー"}がタスク「${
          task.title
        }」をあなたに割り当てました。`,
        targetUser: createdBy,
        relatedTask: task._id,
      });
    }

    res.status(201).json(task);
  } catch (err) {
    console.error("❌ タスク作成エラー:", err.message);
    res.status(500).send("タスクの作成に失敗しました。");
  }
});

/**
 * @desc タスクを更新
 * @route PUT /api/tasks/:id
 * @access Private
 */
exports.updateTask = asyncHandler(async (req, res) => {
  try {
    const { title, description, status, assignedTo, customer, sales, dueDate } =
      req.body;
    const existingTask = await Task.findById(req.params.id);

    if (!existingTask) {
      return res.status(404).json({
        msg: "タスクが見つかりません",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        status,
        assignedTo,
        customer,
        sales,
        dueDate,
      },
      {
        new: true,
      }
    );

    // 関連情報を取得
    const user = await User.findOne({
      uid: req.user.uid,
    });
    const customerObj = await Customer.findById(customer);
    const salesObj = await Sales.findById(sales);
    const beforeAssignedUser = await User.findOne({
      uid: existingTask.assignedTo,
    });
    const afterAssignedUser = await User.findOne({
      uid: assignedTo,
    });

    let message = "";
    let targetUsers = [updatedTask.assignedTo];

    // ステータス変更の通知
    if (existingTask.status !== status) {
      const statusMap = {
        todo: "未着手",
        in_progress: "進行中",
        done: "完了",
      };
      message = `${user?.displayName || "不明なユーザー"}が、顧客「${
        customerObj?.name || "不明"
      }」の案件「${salesObj?.dealName || "不明"}」のタスク「${
        updatedTask.title
      }」のステータスを「${
        statusMap[existingTask.status] || existingTask.status
      }」から「${statusMap[status] || status}」に変更しました。`;
    }

    // 担当者変更の通知
    if (existingTask.assignedTo !== assignedTo) {
      message = `${user?.displayName || "不明なユーザー"}が、顧客「${
        customerObj?.name || "不明"
      }」の案件「${salesObj?.dealName || "不明"}」のタスク「${
        updatedTask.title
      }」の担当者を「${beforeAssignedUser?.displayName || "不明"}」から「${
        afterAssignedUser?.displayName || "不明"
      }」に変更しました。`;
      targetUsers.push(existingTask.assignedTo); // 変更前の担当者にも通知
    }

    // その他の情報更新の通知
    if (!message) {
      message = `${user?.displayName || "不明なユーザー"}が、顧客「${
        customerObj?.name || "不明"
      }」の案件「${salesObj?.dealName || "不明"}」のタスク「${
        updatedTask.title
      }」を更新しました。`;
    }

    // 通知を送信
    for (const targetUser of targetUsers) {
      await addNotification({
        message,
        targetUser,
        relatedTask: updatedTask._id,
      });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error("❌ タスク更新エラー:", err.message);
    res.status(500).send("タスクの更新に失敗しました。");
  }
});

/**
 * @desc 全てのタスクを取得
 * @route GET /api/tasks
 * @access Private
 */
exports.getAllTasks = asyncHandler(async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        {
          assignedTo: req.user.uid,
        },
        {
          createdBy: req.user.uid,
        },
      ],
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(tasks);
  } catch (err) {
    console.error("❌ 全タスク取得エラー:", err.message);
    res.status(500).send("サーバーエラー");
  }
});

/**
 * @desc 特定の顧客に紐づくタスクを取得
 * @route GET /api/tasks/by-customer/:id
 * @access Private
 */
exports.getTasksByCustomer = asyncHandler(async (req, res) => {
  try {
    const tasks = await Task.find({
      customer: req.params.id,
      $or: [
        {
          assignedTo: req.user.uid,
        },
        {
          createdBy: req.user.uid,
        },
      ],
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(tasks);
  } catch (err) {
    console.error("❌ 顧客別タスク取得エラー:", err.message);
    res.status(500).send("サーバーエラー");
  }
});

/**
 * @desc タスクを削除
 * @route DELETE /api/tasks/:id
 * @access Private
 */
exports.deleteTask = asyncHandler(async (req, res) => {
  try {
    const taskId = req.params.id;
    const taskToDelete = await Task.findById(taskId);

    if (!taskToDelete) {
      return res.status(404).json({
        msg: "タスクが見つかりません",
      });
    }

    // 関連情報を取得
    const user = await User.findOne({
      uid: req.user.uid,
    });
    const customerObj = await Customer.findById(taskToDelete.customer);
    const salesObj = await Sales.findById(taskToDelete.sales);
    const assignedUser = await User.findOne({
      uid: taskToDelete.assignedTo,
    });

    // 通知メッセージを生成
    let message = `${user?.displayName || "不明なユーザー"}が、顧客「${
      customerObj?.name || "不明"
    }」の案件「${salesObj?.dealName || "不明"}」のタスク「${
      taskToDelete.title
    }」を削除しました。`;

    // 関連する全員に通知
    const relatedUsers = new Set([
      taskToDelete.createdBy,
      taskToDelete.assignedTo,
    ]);

    // 通知を送信
    for (const targetUser of relatedUsers) {
      await addNotification({
        message,
        targetUser,
        relatedTask: taskToDelete._id,
      });
    }

    await Task.findByIdAndDelete(taskId);
    res.status(200).json({
      message: "タスクが正常に削除されました。",
    });
  } catch (err) {
    console.error("❌ タスク削除エラー:", err.message);
    res.status(500).send("タスクの削除に失敗しました。");
  }
});
