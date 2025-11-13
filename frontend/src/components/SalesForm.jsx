// src/components/SalesForm.jsx
// -----------------------------------------
// 案件（Sales）登録・編集フォームコンポーネント
// ・編集対象(editingSale)があれば編集フォームとして機能
// ・新規登録の場合は空フォームで初期化
// ・顧客リストを取得してセレクトボックスに表示
// ・成功・エラーメッセージをフォーム上部に表示
// -----------------------------------------

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";

const SalesForm = ({ editingSale, onSuccess, onCancelEdit }) => {
  const { user, token } = useAuth(); // ユーザー情報と認証トークンを取得
  const [customers, setCustomers] = useState([]); // 顧客リスト
  const [form, setForm] = useState({
    dealName: "", // 案件名
    customerId: "", // 顧客ID
    amount: "", // 金額
    status: "見込み", // 案件ステータス
    notes: "", // メモ
    dueDate: "", // 期限日
  });
  const [message, setMessage] = useState(""); // 成功・エラーメッセージ
  const [messageType, setMessageType] = useState("success"); // メッセージタイプ: success or error

  /**
   * 顧客リストをAPIから取得
   */
  const fetchCustomers = useCallback(async () => {
    if (!user || !token) return;
    try {
      const res = await authorizedRequest("GET", "/customers");
      if (Array.isArray(res)) setCustomers(res);
    } catch (err) {
      console.error("顧客リストの取得に失敗しました:", err);
    }
  }, [user, token]);

  // コンポーネントマウント時に顧客リストを取得
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  /**
   * 編集対象がある場合、フォームに既存データをセット
   * 編集対象がない場合は空フォームにリセット
   */
  useEffect(() => {
    if (editingSale) {
      setForm({
        dealName: editingSale.dealName,
        customerId: editingSale.customerId,
        amount: editingSale.amount,
        status: editingSale.status,
        notes: editingSale.notes,
        dueDate: editingSale.dueDate
          ? new Date(editingSale.dueDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      setForm({
        dealName: "",
        customerId: "",
        amount: "",
        status: "見込み",
        notes: "",
        dueDate: "",
      });
    }
  }, [editingSale]);

  /**
   * フォーム入力変更時のハンドラ
   * name属性をキーにしてformの状態を更新
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * フォーム送信ハンドラ
   * ・新規登録 or 編集更新に応じてAPIを呼び分け
   * ・成功時に親コンポーネントに通知(onSuccess)
   * ・成功/失敗メッセージを表示して3秒後に消去
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      setMessageType("error");
      setMessage("ログインしてください");
      return;
    }
    try {
      if (editingSale) {
        await authorizedRequest("PUT", `/sales/${editingSale._id}`, form);
        setMessageType("success");
        setMessage("案件を更新しました！");
      } else {
        await authorizedRequest("POST", "/sales", form);
        // 登録成功後にフォームをリセット
        setForm({
          dealName: "",
          customerId: "",
          amount: "",
          status: "見込み",
          notes: "",
          dueDate: "",
        });
        setMessageType("success");
        setMessage("案件を登録しました！");
      }

      if (onSuccess) onSuccess(); // 親コンポーネントに成功通知

      // 3秒後にメッセージを消す
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(editingSale ? "更新エラー:" : "登録エラー:", err);
      setMessageType("error");
      setMessage(editingSale ? "更新に失敗しました" : "登録に失敗しました");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        {editingSale ? "案件編集" : "案件登録"}
      </h2>

      {/* 成功・エラーメッセージ */}
      {message && (
        <p
          className={`mb-4 font-medium ${
            messageType === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
      >
        {/* 案件名 */}
        <input
          type="text"
          name="dealName"
          placeholder="案件名"
          value={form.dealName}
          onChange={handleChange}
          required
          className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* 顧客選択 */}
        <select
          name="customerId"
          value={form.customerId}
          onChange={handleChange}
          required
          className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">顧客を選択</option>
          {customers.map((customer) => (
            <option key={customer._id} value={customer._id}>
              {customer.companyName}
            </option>
          ))}
        </select>

        {/* 案件金額 */}
        <input
          type="number"
          name="amount"
          placeholder="案件金額"
          value={form.amount}
          onChange={handleChange}
          required
          className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* ステータス選択 */}
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          required
          className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="見込み">見込み</option>
          <option value="提案中">提案中</option>
          <option value="交渉中">交渉中</option>
          <option value="契約済">契約済</option>
          <option value="失注">失注</option>
        </select>

        {/* 期限日 */}
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* メモ */}
        <textarea
          name="notes"
          placeholder="メモ"
          value={form.notes}
          onChange={handleChange}
          className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-full"
        />

        {/* 登録/更新ボタン */}
        <button
          type="submit"
          className="p-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200 col-span-full sm:col-span-1"
        >
          {editingSale ? "更新する" : "登録する"}
        </button>

        {/* 編集キャンセルボタン */}
        {editingSale && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="p-3 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200 col-span-full sm:col-span-1"
          >
            キャンセル
          </button>
        )}
      </form>
    </div>
  );
};

export default SalesForm;
