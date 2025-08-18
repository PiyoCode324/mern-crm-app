// src/utils/taskApi.js

import api from "./api";

// タスク関連のエンドポイント専用のAxiosインスタンスを作成
const tasksApi = api.create({
  baseURL: `${api.defaults.baseURL}/tasks`,
});

/**
 * すべてのタスクを取得します。
 * @returns {Promise<Array>} タスクの配列
 */
export const getTasks = async () => {
  try {
    const response = await api.get("/tasks");
    return response.data;
  } catch (error) {
    console.error(
      "タスクの取得に失敗しました:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * 新しいタスクを作成します。
 * @param {object} taskData - 新しいタスクのデータ
 * @returns {Promise<object>} 作成されたタスク
 */
export const createTask = async (taskData) => {
  try {
    const response = await tasksApi.post("/", taskData);
    return response.data;
  } catch (error) {
    console.error(
      "タスクの作成に失敗しました:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * 既存のタスクを更新します。
 * @param {string} taskId - 更新するタスクのID
 * @param {object} updateData - 更新データ
 * @returns {Promise<object>} 更新されたタスク
 */
export const updateTask = async (taskId, updateData) => {
  try {
    const response = await tasksApi.put(`/${taskId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(
      "タスクの更新に失敗しました:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * タスクを削除します。
 * @param {string} taskId - 削除するタスクのID
 * @returns {Promise<void>}
 */
export const deleteTask = async (taskId) => {
  try {
    await tasksApi.delete(`/${taskId}`);
  } catch (error) {
    console.error(
      "タスクの削除に失敗しました:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * ✅ 特定タスクのアクティビティを取得します。
 * @param {string} taskId - タスクID
 * @returns {Promise<Array>} アクティビティ配列
 */
export const getTaskActivities = async (taskId) => {
  try {
    const response = await api.get(`/activities/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(
      "タスクのアクティビティ取得に失敗しました:",
      error.response?.data || error.message
    );
    throw error;
  }
};
