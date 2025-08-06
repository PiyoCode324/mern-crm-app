// src/routes/AppRoutes.jsx (修正箇所)

import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ProfilePage from "../pages/ProfilePage";
import CustomerPage from "../pages/CustomerPage";
import CustomerDetailPage from "../pages/CustomerDetailPage";
import ContactsPage from "../pages/ContactsPage";
import ProtectedRoute from "../components/ProtectedRoute";
import FreeContactPage from "../pages/FreeContactPage"; // ✅ 新しい公開フォームをインポート

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/contact-form" element={<FreeContactPage />} />{" "}
      {/* ✅ 公開フォームのルートを追加 */}
      {/* ログインユーザー向けの保護されたルート */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <CustomerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/:customerId"
        element={
          <ProtectedRoute>
            <CustomerDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <ContactsPage />
          </ProtectedRoute>
        }
      />
      {/* 顧客に紐づいた問い合わせ一覧を表示するためのルート */}
      <Route
        path="/customers/:customerId/contacts"
        element={
          <ProtectedRoute>
            <ContactsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
