// src/utils/userApi.js

import api from "./api";

// ユーザー関連のエンドポイント専用のAxiosインスタンスを作成
const usersApi = api.create({
  baseURL: `${api.defaults.baseURL}/users`,
});

/**
 * すべてのユーザーを取得します。
 * @returns {Promise<Array>} ユーザーの配列
 */
export const getUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    console.error(
      "ユーザーの取得に失敗しました:",
      error.response?.data || error.message
    );
    throw error;
  }
};
