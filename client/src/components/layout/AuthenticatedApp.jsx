import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import Dashboard from '../../pages/Dashboard';
import ProjectsPage from '../../pages/proyectos/ProjectsPage';
import DiagnosticosPage from '../../pages/diagnosticos/DiagnosticosPage';

const AuthenticatedApp = () => {
  const { logout } = useAuth();

  return (
    <Routes>
      <Route element={<DashboardLayout onLogout={logout} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/proyectos" element={<ProjectsPage />} />
        <Route path="/dashboard/diagnosticos" element={<DiagnosticosPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AuthenticatedApp;