// src/utils/taskApi.js

import api from "./api";

/**
 * タスク専用のAxiosインスタンスを作成
 * ベースURLは /tasks 配下に設定
 */
const tasksApi = api.create({
  baseURL: `${api.defaults.baseURL}/tasks`,
});

/**
 * @desc タスク一覧を取得
 * @returns {Promise<Array>} タスク配列
 */
export const getTasks = async () => {
  try {
    console.log("📝 getTasks called");
    const response = await api.get("/tasks"); // GET /tasks
    console.log(`✅ getTasks response: ${response.data.length} tasks fetched`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ タスクの取得に失敗しました:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * @desc 新規タスクを作成
 * @param {object} taskData - タスク情報
 * @returns {Promise<object>} 作成したタスクデータ
 */
export const createTask = async (taskData) => {
  try {
    console.log("📝 createTask called with:", taskData);
    const response = await tasksApi.post("/", taskData); // POST /tasks/
    console.log("✅ Task created:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ タスクの作成に失敗しました:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * @desc タスクを更新
 * @param {string} taskId - 更新対象のタスクID
 * @param {object} updateData - 更新内容
 * @returns {Promise<object>} 更新後のタスクデータ
 */
export const updateTask = async (taskId, updateData) => {
  try {
    console.log(`📝 updateTask called for taskId: ${taskId}`, updateData);
    const response = await tasksApi.put(`/${taskId}`, updateData); // PUT /tasks/:id
    console.log("✅ Task updated:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ タスクの更新に失敗しました:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * @desc タスクを削除
 * @param {string} taskId - 削除対象のタスクID
 */
export const deleteTask = async (taskId) => {
  try {
    console.log(`📝 deleteTask called for taskId: ${taskId}`);
    await tasksApi.delete(`/${taskId}`); // DELETE /tasks/:id
    console.log(`✅ Task deleted: ${taskId}`);
  } catch (error) {
    console.error(
      "❌ タスクの削除に失敗しました:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * @desc タスクに紐づくアクティビティ一覧を取得
 * @param {string} taskId - タスクID
 * @returns {Promise<Array>} アクティビティ配列
 */
export const getTaskActivities = async (taskId) => {
  try {
    console.log(`📝 getTaskActivities called for taskId: ${taskId}`);
    const response = await api.get(`/activities/tasks/${taskId}`); // GET /activities/tasks/:taskId
    console.log(
      `✅ ${response.data.length} activities fetched for taskId: ${taskId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ タスクのアクティビティ取得に失敗しました:",
      error.response?.data || error.message
    );
    throw error;
  }
};
