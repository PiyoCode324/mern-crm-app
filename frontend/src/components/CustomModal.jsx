// src/components/CustomModal.jsx
// -----------------------------------------
// 汎用モーダルコンポーネント
// createPortalを使ってbody直下に描画
// 外側クリックで閉じる機能付き
// -----------------------------------------

import React from "react";
import { createPortal } from "react-dom";

const CustomModal = ({ isOpen, onClose, children }) => {
  // モーダルが閉じている場合は何も描画しない
  if (!isOpen) return null;

  // モーダル外側クリック時に閉じる処理
  const handleOverlayClick = (e) => {
    // クリックされた要素がオーバーレイ（背景）であれば閉じる
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    // オーバーレイ部分
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick} // 背景クリックでモーダルを閉じる
    >
      {/* モーダルコンテンツ */}
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-0">
        {children} {/* モーダル内部に任意のコンテンツを表示 */}
      </div>
    </div>,
    document.body // body直下に描画
  );
};

export default CustomModal;
