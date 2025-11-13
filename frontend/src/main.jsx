// src/main.jsx

// React 本体の読み込み
import React from "react";
// React 18 以降で推奨される root API の読み込み
import ReactDOM from "react-dom/client";
// アプリケーションのルートコンポーネント
import App from "./App";
// ルーティング機能を提供するライブラリ
import { BrowserRouter } from "react-router-dom";
// 認証情報をアプリ全体で管理するための Context Provider
import { AuthProvider } from "./context/AuthContext";
// 通知機能をアプリ全体で管理するための Context Provider
import { NotificationProvider } from "./context/NotificationContext"; // ✅ 追加
// グローバルスタイル（CSSリセットや共通スタイル）
import "./index.css";

/**
 * アプリケーションのエントリーポイント
 * - React 18 の新しい createRoot API を使用してレンダリング
 * - BrowserRouter でアプリ全体にルーティング機能を提供
 * - AuthProvider で認証状態を全コンポーネントで共有可能にする
 * - NotificationProvider で通知機能を全コンポーネントで共有可能にする
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode> を外しているが、開発時に再レンダリング確認用で使える
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
        {" "}
        {/* ✅ 通知用の Context をアプリ全体に提供 */}
        <App />
      </NotificationProvider>{" "}
      {/* ✅ NotificationProvider の終了タグ */}
    </AuthProvider>
  </BrowserRouter>
  // </React.StrictMode>
);
