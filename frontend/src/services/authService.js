// src/services/authService.js
import axios from "axios";

export const authorizedRequest = async (method, url, token, data = null) => {
  if (!token) {
    throw new Error("認証トークンがありません。");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      method: method.toUpperCase(),
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTPエラー！ステータス: ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error("authorizedRequestエラー:", error);
    throw error;
  }
};
