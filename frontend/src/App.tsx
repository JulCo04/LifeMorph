import React, { useState } from "react";
import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EventTrackingPage from "./pages/EventTrackingPage";
import FinancePage from "./pages/FinancePage";
import ForgotPassPage from "./pages/ForgotPassPage";
import GoalTrackingPage from "./pages/GoalTrackingPage";
import ResetPassPage from "./pages/ResetPassPage";
import SettingsPage from "./pages/SettingsPage";
import TodoListPage from "./pages/TodoListPage";
import ContactPage from "./pages/ContactPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" index element={<HomePage />} />
        <Route path="/dashboard" index element={<DashboardPage />} />
        <Route path="/login" index element={<LoginPage />} />
        <Route path="/event-tracking" element={<EventTrackingPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/forgot-password" element={<ForgotPassPage />} />
        <Route path="/goal-tracking" element={<GoalTrackingPage />} />
        <Route path="/reset-password" element={<ResetPassPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/todo-list" element={<TodoListPage />} />
        <Route path="/contact-manager" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
