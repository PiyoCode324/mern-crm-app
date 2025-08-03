// src/utils/salesApi.js
import api from "./api";

export const fetchSalesSummary = async () => {
  try {
    const response = await api.get("/api/sales/summary");
    return response.data;
  } catch (error) {
    console.error("売上データの取得に失敗しました:", error);
    throw error;
  }
};
