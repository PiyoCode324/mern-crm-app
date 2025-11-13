// src/components/Modal.jsx
// -----------------------------------------
// 汎用モーダルコンポーネント
// タイトル・メッセージを表示し、OKボタンとキャンセルボタンを選択可能
// isConfirmOnly が true の場合はOKボタンのみ表示
// -----------------------------------------

import React from "react";

const Modal = ({ title, message, onConfirm, onCancel, isConfirmOnly }) => {
  return (
    // モーダル背景: 画面全体を覆う半透明の暗い背景、中央に配置
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
      {/* モーダル本体 */}
      <div className="bg-white rounded-lg p-6 max-w-sm mx-auto shadow-xl">
        {/* モーダルタイトル */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        {/* メッセージ内容 */}
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        {/* ボタンコンテナ */}
        <div
          className={`flex ${
            isConfirmOnly ? "justify-center" : "justify-end space-x-2"
          }`}
        >
          {/* キャンセルボタン: isConfirmOnly が false の場合のみ表示 */}
          {!isConfirmOnly && (
            <button
              onClick={onCancel}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              キャンセル
            </button>
          )}
          {/* OKボタン */}
          <button
            onClick={onConfirm}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
