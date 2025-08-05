// src/utils/api.js

import axios from "axios";

// 環境変数からAPIのベースURLを取得
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// シンプルなAxiosインスタンスを作成。インターセプターは削除します。
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
