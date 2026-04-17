import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import Dashboard from '../../pages/Dashboard';
import ProjectsPage from '../../pages/proyectos/ProjectsPage';

const AuthenticatedApp = () => {
  const { logout } = useAuth();

  return (
    <Routes>
      <Route element={<DashboardLayout onLogout={logout} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/proyectos" element={<ProjectsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AuthenticatedApp;