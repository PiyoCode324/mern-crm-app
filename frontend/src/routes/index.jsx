// src/routes/index.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import CustomerList from "../pages/CustomerList";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<CustomerList />} />
      </Routes>
    </BrowserRouter>
  );
}
