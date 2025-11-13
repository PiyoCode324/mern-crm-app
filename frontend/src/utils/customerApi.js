// src/utils/customerApi.js

import api from "./api";

/**
 * 顧客一覧取得API
 * - サーバーから全顧客データを取得
 * - 成功時は response.data を返す
 * - 失敗時はコンソールにエラーメッセージを表示して例外を投げる
 */
export const getCustomers = async () => {
  try {
    // GET /customers エンドポイントにリクエスト
    const response = await api.get("/customers");
    return response.data;
  } catch (error) {
    // エラー発生時の詳細ログ
    console.error(
      "顧客データの取得に失敗しました:",
      error.response?.data || error.message
    );
    throw error;
  }
};
