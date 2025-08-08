// src/routes/AppRoutes.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProfilePage from "../pages/ProfilePage";
import CustomerPage from "../pages/CustomerPage";
import CustomerDetailPage from "../pages/CustomerDetailPage";
import ContactsPage from "../pages/ContactsPage";
import ProtectedRoute from "../components/ProtectedRoute";
import FreeContactPage from "../pages/FreeContactPage";
import SalesPage from "../pages/SalesPage";
import Dashboard from "../pages/Dashboard";
import ContactForm from "../components/ContactForm";
import AdminUserPage from "../pages/AdminUserPage";
// ✅ パスワードリセットコンポーネントをインポート
import PasswordReset from "../components/PasswordReset";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/contact-form" element={<FreeContactPage />} />{" "}
      {/* 公開フォームのルート */}
      {/* ✅ パスワードリセットのルートを追加 */}
      <Route path="/reset-password" element={<PasswordReset />} />
      {/* ログインが必要なルート */}
      <Route
        path="/"
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
      <Route
        path="/contacts/new"
        element={
          <ProtectedRoute>
            <ContactForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/:customerId/contacts"
        element={
          <ProtectedRoute>
            <ContactsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <SalesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* ✅ 管理者向けのルート */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminUserPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
