// src/utils/salesApi.js

import api from "./api";

/**
 * @desc 案件データ一覧を取得する関数
 *
 * 処理の流れ:
 * 1. Axiosラッパーapiを使用してGETリクエストで /sales へアクセス
 * 2. 成功した場合、案件データ配列を返却
 * 3. 失敗した場合、エラーをコンソールに出力してthrow
 *
 * @returns {Promise<Array>} 案件データの配列
 */
export const getSales = async () => {
  try {
    const response = await api.get("/sales");
    return response.data;
  } catch (error) {
    console.error(
      "案件データの取得に失敗しました:",
      error.response?.data || error.message
    );
    throw error;
  }
};
