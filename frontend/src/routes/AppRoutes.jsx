// src/routes/AppRoutes.jsx

import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ProfilePage from "../pages/ProfilePage";
import CustomerPage from "../pages/CustomerPage";
import ContactFormPage from "../pages/ContactFormPage";
import ContactsPage from "../pages/ContactsPage";
import EditContactForm from "../pages/EditContactForm";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
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
        path="/contact-form"
        element={<ContactFormPage />} // ログイン不要
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
        path="/contacts/:id/edit"
        element={
          <ProtectedRoute>
            <EditContactForm />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
