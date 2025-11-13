// src/utils/activityApi.js

import api from "./api"; // 共通APIラッパーをインポート

/**
 * 顧客に紐づくアクティビティを取得する
 * @param {string} customerId - 顧客のID
 * @returns {Promise<Object[]>} 顧客に関連するアクティビティの配列
 */
export const getCustomerActivities = async (customerId) => {
  try {
    // GETリクエストで顧客IDに紐づくアクティビティ一覧を取得
    const response = await api.get(`/activities/customer/${customerId}`);
    return response.data; // レスポンスのデータ部分を返す
  } catch (error) {
    // エラー時は顧客IDとエラー内容をコンソールに出力
    console.error(
      `顧客ID ${customerId} のアクティビティ取得に失敗しました:`,
      error.response?.data || error.message
    );
    throw error; // 呼び出し元でエラー処理できるよう再スロー
  }
};

/**
 * 案件に紐づくアクティビティを取得する
 * @param {string} saleId - 案件のID
 * @returns {Promise<Object[]>} 案件に関連するアクティビティの配列
 */
export const getSalesActivities = async (saleId) => {
  try {
    // GETリクエストで案件IDに紐づくアクティビティ一覧を取得
    const response = await api.get(`/activities/sales/${saleId}`);
    return response.data; // レスポンスのデータ部分を返す
  } catch (error) {
    // エラー時は案件IDとエラー内容をコンソールに出力
    console.error(
      `案件ID ${saleId} のアクティビティ取得に失敗しました:`,
      error.response?.data || error.message
    );
    throw error; // 呼び出し元でエラー処理できるよう再スロー
  }
};
