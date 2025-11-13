// src/utils/userApi.js

import api from "./api";

/**
 * ユーザー関連のエンドポイント専用のAxiosインスタンスを作成
 * ベースURLは /users 配下に設定
 */
const usersApi = api.create({
  baseURL: `${api.defaults.baseURL}/users`,
});

/**
 * @desc すべてのユーザーを取得
 * @returns {Promise<Array>} ユーザーの配列
 * @note タスクリスト用のユーザー情報取得には getUsersBasic の使用を推奨
 */
export const getUsers = async () => {
  try {
    const response = await usersApi.get("/"); // GET /users
    return response.data;
  } catch (error) {
    console.error(
      "ユーザーの取得に失敗しました:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * @desc 認証ユーザー向けに、ユーザーの基本情報のみを取得
 * @returns {Promise<Array>} ユーザー基本情報の配列
 */
export const getUsersBasic = async () => {
  try {
    const response = await usersApi.get("/basic"); // GET /users/basic
    return response.data.users;
  } catch (error) {
    console.error(
      "ユーザーリストの取得に失敗しました:",
      error.response?.data || error.message
    );
    throw error;
  }
};
