// components/ErrorMessage.jsx
// -----------------------------------------
// エラーメッセージ表示用コンポーネント
// propsで受け取ったmessageを表示
// 赤色の背景と枠線で視覚的にエラーを強調
// -----------------------------------------

import React from "react";

const ErrorMessage = ({ message }) => {
  return (
    // コンテナ: 横中央・縦中央に配置
    <div className="flex justify-center items-center">
      {/* エラー表示ボックス */}
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert" // アクセシビリティ用にアラートとして認識される
      >
        {/* エラータイトル */}
        <strong className="font-bold">エラー: </strong>
        {/* エラーメッセージ内容 */}
        <span className="block sm:inline">{message}</span>
      </div>
    </div>
  );
};

export default ErrorMessage;
